import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withApiErrorHandling } from "@/lib/api-error";
import { isRateLimited, clientIp } from "@/lib/rate-limit";
import { ageGate } from "@/lib/age-gate";
import { normalizeNanpPhone, smsConsentRow } from "@/lib/sms-consent";

const FOUNDING_CAP = 100;
// Unauthenticated public signup endpoint with no CAPTCHA — throttle by IP so
// it can't be used to flood the DB, the CRM webhook, or the live "N of 100"
// counter with bulk fake signups.
const SIGNUP_MAX_ATTEMPTS = 10;
const SIGNUP_WINDOW_MS = 15 * 60 * 1000;

export const GET = withApiErrorHandling(async () => {
  const claimed = await db.foundingSignup.count();
  return NextResponse.json({ claimed, cap: FOUNDING_CAP });
});

export const POST = withApiErrorHandling(async (req: NextRequest) => {
  if (isRateLimited(`founding-list:${clientIp(req)}`, SIGNUP_MAX_ATTEMPTS, SIGNUP_WINDOW_MS)) {
    return NextResponse.json(
      { error: "Too many requests. Please try again in a few minutes." },
      { status: 429 }
    );
  }

  const body = await req.json().catch(() => null);
  const { name, email, phone, social, referredBy, source, dateOfBirth, smsConsent } = body ?? {};

  // Age screen first: an under-13 answer must store nothing at all.
  const blocked = ageGate(req, dateOfBirth);
  if (blocked) return blocked;

  if (!name || typeof name !== "string") {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }
  if (!email || typeof email !== "string" || !email.includes("@")) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  // A phone number is kept only with a saved yes to marketing texts (TCPA).
  // Without the tick it is discarded, not stored and not sent to the CRM.
  let smsPhone: string | null = null;
  if (typeof phone === "string" && phone.trim() !== "" && smsConsent === true) {
    smsPhone = normalizeNanpPhone(phone);
    if (!smsPhone) {
      return NextResponse.json({ error: "Please enter a valid US or Canadian mobile number." }, { status: 400 });
    }
  }

  // The local row is the source of truth for the live "N of 100" counter on
  // the page — save it first so the count is accurate even if the CRM
  // webhook below is slow, misconfigured, or down.
  const signup = db.foundingSignup.create({
    data: {
      name,
      email,
      phone: smsPhone,
      social: social || null,
      referredBy: referredBy || null,
      source: source ?? "Unknown",
    },
  });
  if (smsPhone) {
    // Signup and consent evidence are saved together or not at all.
    await db.$transaction([
      signup,
      smsConsentRow({
        phone: smsPhone,
        source: String(source ?? "Unknown").slice(0, 60),
        ip: clientIp(req) === "unknown" ? null : clientIp(req),
        userAgent: req.headers.get("user-agent"),
      }),
    ]);
  } else {
    await signup;
  }

  const webhookUrl = process.env.FOUNDING_LIST_WEBHOOK_URL;
  if (webhookUrl) {
    try {
      const res = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone: smsPhone ?? "",
          social: social || "",
          referredBy: referredBy || "",
          source: source ?? "Unknown",
          timestamp: new Date().toISOString(),
        }),
      });
      if (!res.ok) throw new Error(`Webhook responded ${res.status}`);
    } catch (err) {
      // The signup is already saved locally and will show up in the live
      // count regardless — a CRM sync failure shouldn't fail the signup
      // itself or tell the customer to try again.
      console.error("Founding list webhook failed:", err);
    }
  } else {
    console.error("FOUNDING_LIST_WEBHOOK_URL is not configured — signup saved locally only");
  }

  return NextResponse.json({ ok: true });
});
