import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isRateLimited, clientIp } from "@/lib/rate-limit";
import { sendMail } from "@/lib/mail";
import { SITE_URL } from "@/lib/seo";
import { CONSENT_TEXT_VERSION } from "@/lib/email-consent";
import { forwardToKlaviyo } from "@/lib/klaviyo";
import { isMissingTableError, normalizeEmail, normalizeSource, unsubscribeUrl } from "@/lib/subscribers";

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;

// Same body for a new address, an existing one, and a bot: no email enumeration.
const OK = () => NextResponse.json({ ok: true });

function welcomeEmail(email: string) {
  const unsub = unsubscribeUrl(SITE_URL, email);
  return {
    to: email,
    subject: "Welcome to CHIAREL",
    text: [
      "Thank you for joining the CHIAREL list. You will be first to know when we write.",
      "",
      `In the meantime, the daily ritual guide: ${SITE_URL}/journal/chiarel-ritual-guide`,
      "",
      unsub ? `Unsubscribe at any time: ${unsub}` : "Unsubscribe at any time by replying to this email.",
    ].join("\n"),
  };
}

export async function POST(req: NextRequest) {
  if (isRateLimited(`subscribe:${clientIp(req)}`, MAX_ATTEMPTS, WINDOW_MS)) {
    return NextResponse.json({ error: "Too many requests. Please try again in a few minutes." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);

  // Honeypot: real visitors never see or fill this field.
  if (typeof body?.website === "string" && body.website !== "") return OK();

  const email = normalizeEmail(body?.email);
  if (!email) return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  if (body?.consent !== true) {
    return NextResponse.json({ error: "Please tick the box to confirm you would like to receive email." }, { status: 400 });
  }
  const source = normalizeSource(body?.source);

  try {
    const existing = await db.emailSubscriber.findUnique({ where: { email } });
    const now = new Date();
    if (existing && !existing.unsubscribedAt) return OK();

    if (existing) {
      // Explicit fresh opt-in after an unsubscribe: re-consent, clear the suppression.
      await db.emailSubscriber.update({
        where: { email },
        data: { unsubscribedAt: null, consentAt: now, consentTextVersion: CONSENT_TEXT_VERSION },
      });
    } else {
      await db.emailSubscriber.create({
        data: { email, source, consentAt: now, consentTextVersion: CONSENT_TEXT_VERSION },
      });
    }
  } catch (err) {
    if (isMissingTableError(err)) {
      console.error("EmailSubscriber table missing — apply migrations (prisma migrate deploy)");
    } else {
      console.error("[subscribe]", err);
    }
    return NextResponse.json(
      { error: "Sign-up is unavailable right now. Please try again later." },
      { status: 503 }
    );
  }

  // Side effects are fire-and-forget so response timing doesn't reveal new vs existing.
  void forwardToKlaviyo(email);
  if (process.env.HOSTINGER_SMTP_HOST && process.env.HOSTINGER_SMTP_USER) {
    sendMail(welcomeEmail(email)).catch((err) => console.error("Welcome email failed:", err));
  }
  // email_signup analytics event is fired client-side in EmailSignup.tsx (consent-gated).
  return OK();
}
