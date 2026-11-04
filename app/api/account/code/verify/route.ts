import { NextRequest, NextResponse } from "next/server";
import { withApiErrorHandling } from "@/lib/api-error";
import { isRateLimited, clientIp } from "@/lib/rate-limit";
import { hashEmail, normaliseEmail, verifyLoginCode } from "@/lib/login-code";
import { CUSTOMER_AUDIT, completeCustomerSignIn, findOrCreateCustomerByEmail } from "@/lib/customer-auth";
import { safeReturnTo } from "@/lib/return-to";
import { recordAuthEvent } from "@/lib/audit";
import { rejectCrossSite } from "@/lib/request-guard";

const WINDOW_MS = 15 * 60 * 1000;

// Never auto-retried: a correct code is spent on first use.
const handler = withApiErrorHandling(
  async (req: NextRequest) => {
    const body = await req.json().catch(() => null);
    const email = normaliseEmail(body?.email);
    const code = typeof body?.code === "string" ? body.code.trim() : "";
    const invalid = () => NextResponse.json({ ok: false, code: "invalid_code" }, { status: 401 });
    if (!email || !/^\d{6}$/.test(code)) return invalid();

    if (isRateLimited(`code-verify:ip:${clientIp(req)}`, 30, WINDOW_MS) || isRateLimited("code-verify:all", 600, WINDOW_MS)) {
      return NextResponse.json({ ok: false, code: "rate_limited" }, { status: 429 });
    }
    // Per address AND source first: 4 tries per IP is below the 5-attempt budget of a code, so one IP cannot burn the owner code; the
    // address-only ceiling is much higher and only bounds a distributed attack.
    const eh = hashEmail(email);
    if (isRateLimited(`code-verify:pair:${eh}:${clientIp(req)}`, 4, WINDOW_MS) || isRateLimited(`code-verify:email:${eh}`, 40, WINDOW_MS)) {
      return invalid();
    }

    if (!(await verifyLoginCode(email, code))) {
      await recordAuthEvent(req, { id: null, email: "unknown" }, {
        action: CUSTOMER_AUDIT.failed,
        entityType: "Customer",
        summary: "Customer code sign-in failed",
      });
      return invalid();
    }

    const customer = await findOrCreateCustomerByEmail(email);
    const res = NextResponse.json({ ok: true, redirect: safeReturnTo(body?.return_to) });
    await completeCustomerSignIn(req, res, customer, "code");
    return res;
  },
  { noRetry: true }
);

export async function POST(req: NextRequest) {
  const res = rejectCrossSite(req) ?? (await handler(req));
  res.headers.set("Cache-Control", "no-store");
  return res;
}
