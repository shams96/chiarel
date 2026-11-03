import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { createSession, setSessionCookie } from "@/lib/auth";
import { recordAuthEvent } from "@/lib/audit";
import { withApiErrorHandling } from "@/lib/api-error";
import { isRateLimited, clientIp } from "@/lib/rate-limit";
import {
  AUDIT,
  OAUTH_COOKIE,
  PROVIDER,
  completeAuthorization,
  googleConfig,
  verifyValue,
  type GoogleProfile,
  type OAuthCookie,
} from "@/lib/oauth-google";
import { adminRedirect, customerRedirect, loginRedirect, notFound, reasonCode, unavailableIfJson503 } from "@/lib/social-login-http";
import { CUSTOMER_AUDIT, CUSTOMER_PROVIDER, completeCustomerSignIn, findOrCreateCustomerByEmail } from "@/lib/customer-auth";
import { safeReturnTo } from "@/lib/return-to";

const WINDOW_MS = 10 * 60 * 1000;

// Rules (conventional Google sign-in, as in Auth.js/Firebase/Okta):
//  - An identity already bound to (google, sub) signs in that user.
//  - Otherwise a verified Google email equal to an existing user's email (an
//    admin pre-created or invited that user) binds the sub and signs in at once.
//  - Anyone else gets the same neutral failure. No signup, no email is sent.
//  - Role and access come from User, never from Google.
//  - intent=customer (carried in the signed state cookie, never in the callback URL)
//    instead finds or creates a storefront Customer by the verified email. It can
//    never produce an admin session, even for an admin's own Gmail.
// The authorization code is single use, so this handler is never auto-retried.
const handler = withApiErrorHandling(
  async (req: NextRequest) => {
    const cfg = googleConfig();
    if (!cfg) return notFound();

    const cookie = verifyValue<OAuthCookie>(cfg.stateSecret, "oauth", req.cookies.get(OAUTH_COOKIE)?.value);
    const intent = cookie?.i === "customer" ? "customer" : "admin";

    const ip = clientIp(req);
    if (isRateLimited(`google-cb:${ip}`, 20, WINDOW_MS) || isRateLimited("google-cb:all", 200, WINDOW_MS)) {
      return loginRedirect("rate_limited", true, intent);
    }

    const fail = async (reason: string, email = "unknown") => {
      await recordAuthEvent(req, { id: null, email: email.slice(0, 254) }, {
        action: intent === "customer" ? CUSTOMER_AUDIT.failed : AUDIT.failed,
        entityType: intent === "customer" ? "Customer" : "Identity",
        summary: `${intent === "customer" ? "Customer " : ""}Google sign-in failed (${reason})`,
      });
      return loginRedirect("failed", true, intent);
    };

    if (!cookie) return fail("no_state_cookie");

    let profile: GoogleProfile;
    try {
      profile = await completeAuthorization(cfg, new URL(req.url), cookie);
    } catch (err) {
      return fail(reasonCode(err));
    }

    if (intent === "customer") {
      const customerSignedIn = async (customer: Awaited<ReturnType<typeof findOrCreateCustomerByEmail>>) => {
        const res = customerRedirect(safeReturnTo(cookie.r));
        await completeCustomerSignIn(req, res, customer, "google");
        return res;
      };
      const known = await db.identity.findUnique({
        where: { provider_subject: { provider: CUSTOMER_PROVIDER, subject: profile.subject } },
        include: { customer: true },
      });
      if (known?.customer) {
        if (known.customer.deletedAt) return fail("customer_deleted", known.customer.email);
        return customerSignedIn(known.customer);
      }
      const customer = await findOrCreateCustomerByEmail(profile.email);
      if (customer.deletedAt) return fail("customer_deleted", profile.email);
      // One Google account per customer: one already bound to a different subject is refused.
      const bound = await db.identity.findFirst({ where: { customerId: customer.id, provider: CUSTOMER_PROVIDER } });
      if (bound) return fail("subject_mismatch", profile.email);
      try {
        await db.identity.create({
          data: { provider: CUSTOMER_PROVIDER, subject: profile.subject, email: profile.email, customerId: customer.id },
        });
      } catch (err) {
        if ((err as { code?: string } | null)?.code === "P2002") return fail("subject_conflict", profile.email);
        throw err;
      }
      await recordAuthEvent(req, { id: null, email: customer.email }, {
        action: CUSTOMER_AUDIT.link,
        entityType: "Customer",
        entityId: customer.id,
        summary: "Linked Google sign-in on first use (verified email)",
      });
      return customerSignedIn(customer);
    }

    const identity = await db.identity.findUnique({
      where: { provider_subject: { provider: PROVIDER, subject: profile.subject } },
      include: { user: true },
    });

    const signedIn = async (r: NextRequest, userId: string, email: string) => {
      const signed = await createSession(userId);
      await recordAuthEvent(r, { id: userId, email }, {
        action: AUDIT.login,
        entityType: "User",
        entityId: userId,
        summary: "Signed in with Google",
      });
      const res = adminRedirect();
      setSessionCookie(res, signed);
      return res;
    };

    if (identity?.user) return signedIn(req, identity.user.id, identity.user.email);

    const user = await db.user.findUnique({ where: { email: profile.email } });
    if (!user) return fail("unknown_email", profile.email);

    // One Google account per user: a user already bound to a different subject is refused.
    const bound = await db.identity.findFirst({ where: { userId: user.id, provider: PROVIDER } });
    if (bound) return fail("subject_mismatch", profile.email);

    try {
      await db.identity.create({
        data: { provider: PROVIDER, subject: profile.subject, email: profile.email, userId: user.id },
      });
    } catch (err) {
      // Lost a race with a concurrent bind of the same subject: nothing is signed in.
      if ((err as { code?: string } | null)?.code === "P2002") return fail("subject_conflict", profile.email);
      throw err;
    }
    await recordAuthEvent(req, { id: user.id, email: user.email }, {
      action: AUDIT.link,
      entityType: "User",
      entityId: user.id,
      summary: "Linked Google sign-in on first use (verified email matches a pre-created user)",
    });
    return signedIn(req, user.id, user.email);
  },
  { noRetry: true }
);

export async function GET(req: NextRequest) {
  const res = await handler(req);
  res.headers.set("Cache-Control", "no-store");
  const cfg = googleConfig();
  const cookie = cfg ? verifyValue<OAuthCookie>(cfg.stateSecret, "oauth", req.cookies.get(OAUTH_COOKIE)?.value) : null;
  return unavailableIfJson503(res, cookie?.i === "customer" ? "customer" : "admin");
}
