import { NextRequest, NextResponse } from "next/server";
import { withApiErrorHandling } from "@/lib/api-error";
import { isRateLimited, clientIp } from "@/lib/rate-limit";
import { hashEmail, issueLoginCode, normaliseEmail } from "@/lib/login-code";
import { sendLoginCodeEmail } from "@/lib/customer-auth";

const WINDOW_MS = 15 * 60 * 1000;
const NEUTRAL = { ok: true, message: "If that address can receive mail, a code is on its way." };

// Always answers the same for a well-formed address: an unknown address, a known
// one, a rate-limited one and a failed send are indistinguishable from outside.
const handler = withApiErrorHandling(async (req: NextRequest) => {
  const body = await req.json().catch(() => null);
  const email = normaliseEmail(body?.email);
  if (!email) return NextResponse.json({ ok: false, code: "invalid_email" }, { status: 400 });

  if (isRateLimited(`code-start:ip:${clientIp(req)}`, 10, WINDOW_MS) || isRateLimited("code-start:all", 300, WINDOW_MS)) {
    return NextResponse.json({ ok: false, code: "rate_limited" }, { status: 429 });
  }
  // Per address: the fourth request in 15 minutes gets the normal answer and no mail.
  if (isRateLimited(`code-start:email:${hashEmail(email)}`, 3, WINDOW_MS)) return NextResponse.json(NEUTRAL);

  const code = await issueLoginCode(email);
  await sendLoginCodeEmail(email, code);
  return NextResponse.json(NEUTRAL);
});

export async function POST(req: NextRequest) {
  const res = await handler(req);
  res.headers.set("Cache-Control", "no-store");
  return res;
}
