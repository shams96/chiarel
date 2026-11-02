import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { createSession, setSessionCookie } from "@/lib/auth";
import { recordAuthEvent } from "@/lib/audit";
import { withApiErrorHandling } from "@/lib/api-error";
import { isRateLimited, clientIp } from "@/lib/rate-limit";
import { sendMail } from "@/lib/mail";
import {
  AUDIT,
  OAUTH_COOKIE,
  PROVIDER,
  completeAuthorization,
  createLinkToken,
  googleConfig,
  siteOrigin,
  verifyValue,
  type GoogleProfile,
  type OAuthCookie,
} from "@/lib/oauth-google";
import { adminRedirect, loginRedirect, notFound, reasonCode, unavailableIfJson503 } from "@/lib/social-login-http";

const WINDOW_MS = 10 * 60 * 1000;

// Rules (plan.md section 2, owner-confirmed defaults):
//  - Only an identity already linked to a user signs in.
//  - A verified Google email that matches a user is NEVER linked automatically.
//    A one-time emailed link must be confirmed first (confirm route).
//  - Only users an Admin already created can ever be reached: no signup here.
//  - Role and access come from User, never from Google.
// The authorization code is single use, so this handler is never auto-retried.
const handler = withApiErrorHandling(
  async (req: NextRequest) => {
    const cfg = googleConfig();
    if (!cfg) return notFound();

    const ip = clientIp(req);
    if (isRateLimited(`google-cb:${ip}`, 20, WINDOW_MS) || isRateLimited("google-cb:all", 200, WINDOW_MS)) {
      return loginRedirect("rate_limited");
    }

    const fail = async (reason: string) => {
      await recordAuthEvent(req, { id: null, email: "unknown" }, {
        action: AUDIT.failed,
        entityType: "Identity",
        summary: `Google sign-in failed (${reason})`,
      });
      return loginRedirect("failed");
    };

    const cookie = verifyValue<OAuthCookie>(cfg.stateSecret, "oauth", req.cookies.get(OAUTH_COOKIE)?.value);
    if (!cookie) return fail("no_state_cookie");

    let profile: GoogleProfile;
    try {
      profile = await completeAuthorization(cfg, new URL(req.url), cookie);
    } catch (err) {
      return fail(reasonCode(err));
    }

    const identity = await db.identity.findUnique({
      where: { provider_subject: { provider: PROVIDER, subject: profile.subject } },
      include: { user: true },
    });

    if (identity) {
      const signed = await createSession(identity.user.id);
      await recordAuthEvent(
        req,
        { id: identity.user.id, email: identity.user.email },
        { action: AUDIT.login, entityType: "User", entityId: identity.user.id, summary: "Signed in with Google" }
      );
      const res = adminRedirect();
      setSessionCookie(res, signed);
      return res;
    }

    const user = await db.user.findUnique({ where: { email: profile.email } });
    if (!user) {
      // Same visible outcome as the pending case below, so the page cannot be
      // used to learn which addresses belong to the team.
      await recordAuthEvent(req, { id: null, email: profile.email.slice(0, 254) }, {
        action: AUDIT.failed,
        entityType: "Identity",
        summary: "Google sign-in failed (unknown_email)",
      });
      return loginRedirect("eligible");
    }

    // Per-user cap so nobody can use this to flood a team member's inbox.
    if (isRateLimited(`google-link-mail:${user.id}`, 3, 60 * 60 * 1000)) return loginRedirect("rate_limited");

    const token = createLinkToken(cfg, { uid: user.id, sub: profile.subject, email: user.email });
    const link = `${siteOrigin()}/api/auth/google/confirm?token=${encodeURIComponent(token)}`;
    try {
      await sendMail({
        to: user.email,
        subject: "Confirm Google sign-in for the CHIAREL admin console",
        text:
          "Someone signed in with a Google account using this email address and asked to link it to your CHIAREL admin account.\n\n" +
          `To confirm and allow Google sign-in, open this link within 15 minutes:\n${link}\n\n` +
          "If this was not you, ignore this email: nothing is linked until the link is confirmed.\n",
      });
    } catch (err) {
      console.error("[social-login] confirmation email failed", reasonCode(err));
    }
    await recordAuthEvent(req, { id: user.id, email: user.email }, {
      action: AUDIT.linkPending,
      entityType: "User",
      entityId: user.id,
      summary: "Google link awaiting email confirmation",
    });
    return loginRedirect("eligible");
  },
  { noRetry: true }
);

export async function GET(req: NextRequest) {
  const res = await handler(req);
  res.headers.set("Cache-Control", "no-store");
  return unavailableIfJson503(res);
}
