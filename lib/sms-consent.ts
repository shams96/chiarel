import { db } from "@/lib/db";

// Shared by the signup form (client) and the API route (server) so the text a
// person ticks is exactly the text version we store. Bump the version
// whenever the wording changes. Nothing sends text messages yet; any sender
// must call hasLiveSmsConsent() first and honour revokeSmsConsent().
export const SMS_CONSENT_VERSION = "2026-11-v1";
export const SMS_CONSENT_TEXT =
  "I agree to receive recurring automated marketing text messages from CHIAREL at the mobile number I entered. Consent is not a condition of any purchase. Message and data rates may apply. Message frequency varies. Reply STOP to cancel or HELP for help.";

/** US/Canada (NANP) mobile numbers only, stored as +1XXXXXXXXXX. */
export function normalizeNanpPhone(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const digits = value.replace(/\D/g, "");
  const national = digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits;
  if (!/^[2-9]\d{2}[2-9]\d{6}$/.test(national)) return null;
  return `+1${national}`;
}

export type SmsConsentEvidence = {
  phone: string;
  source: string;
  ip: string | null;
  userAgent: string | null;
};

/** Evidence row for one yes. Insert it in the same transaction as the signup. */
export function smsConsentRow(e: SmsConsentEvidence) {
  return db.smsConsent.create({
    data: {
      phone: e.phone,
      consentText: SMS_CONSENT_TEXT,
      consentTextVersion: SMS_CONSENT_VERSION,
      source: e.source,
      ip: e.ip,
      userAgent: e.userAgent?.slice(0, 300) ?? null,
    },
  });
}

/** True only if the newest consent record for this number is a live yes. */
export async function hasLiveSmsConsent(phone: string): Promise<boolean> {
  const latest = await db.smsConsent.findFirst({
    where: { phone },
    orderBy: { createdAt: "desc" },
  });
  return !!latest && latest.revokedAt === null;
}

/** Any STOP-style opt-out revokes every record for the number. */
export async function revokeSmsConsent(phone: string, via: string): Promise<void> {
  await db.smsConsent.updateMany({
    where: { phone, revokedAt: null },
    data: { revokedAt: new Date(), revokedVia: via },
  });
}
