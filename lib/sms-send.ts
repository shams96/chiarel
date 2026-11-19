import { db } from "@/lib/db";
import { hasLiveSmsConsent, normalizeNanpPhone } from "@/lib/sms-consent";
import { inSafeSendWindow } from "@/lib/sms-window";

export type SendReason =
  | "disabled"
  | "not-configured"
  | "invalid-phone"
  | "no-consent"
  | "quiet-hours"
  | "provider-error";
export type SendResult = { sent: true; sid: string } | { sent: false; reason: SendReason };

const OPT_OUT_LINE = " Reply STOP to opt out.";

/** Every marketing text carries the opt-out instruction. */
export function withOptOut(body: string): string {
  return /\bSTOP\b/i.test(body) ? body : body.trimEnd() + OPT_OUT_LINE;
}

function config() {
  if (process.env.SMS_SEND_ENABLED !== "on") return "disabled" as const;
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const service = process.env.TWILIO_MESSAGING_SERVICE_SID;
  const from = process.env.TWILIO_FROM;
  if (!sid || !token || (!service && !from)) return "not-configured" as const;
  return { sid, token, service, from };
}

/**
 * The only way marketing texts leave the system. Sends only when sending is
 * switched on, the number has a live saved yes (newest consent record not
 * revoked), and now is inside the safe send window. Every attempt that reaches
 * the provider is logged in SmsMessage.
 */
export async function sendMarketingText(
  phoneInput: string,
  body: string,
  opts: { now?: Date } = {}
): Promise<SendResult> {
  const cfg = config();
  if (cfg === "disabled") return { sent: false, reason: "disabled" };
  if (cfg === "not-configured") return { sent: false, reason: "not-configured" };

  const phone = normalizeNanpPhone(phoneInput);
  if (!phone) return { sent: false, reason: "invalid-phone" };
  if (!(await hasLiveSmsConsent(phone))) return { sent: false, reason: "no-consent" };
  if (!inSafeSendWindow(opts.now)) return { sent: false, reason: "quiet-hours" };

  const text = withOptOut(body);
  const form = new URLSearchParams({ To: phone, Body: text });
  if (cfg.service) form.set("MessagingServiceSid", cfg.service);
  else form.set("From", cfg.from!);

  try {
    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${cfg.sid}/Messages.json`, {
      method: "POST",
      headers: {
        Authorization: "Basic " + Buffer.from(`${cfg.sid}:${cfg.token}`).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: form,
    });
    const data = (await res.json().catch(() => ({}))) as { sid?: string; message?: string };
    if (!res.ok || !data.sid) {
      await db.smsMessage.create({
        data: { phone, body: text, status: "failed", error: String(data.message ?? res.status).slice(0, 300) },
      });
      return { sent: false, reason: "provider-error" };
    }
    await db.smsMessage.create({ data: { phone, body: text, status: "queued", providerSid: data.sid } });
    return { sent: true, sid: data.sid };
  } catch (err) {
    await db.smsMessage.create({
      data: { phone, body: text, status: "failed", error: String((err as Error).message).slice(0, 300) },
    });
    return { sent: false, reason: "provider-error" };
  }
}

/** Numbers whose newest consent record is a live yes, one per number. */
export async function numbersWithLiveConsent(): Promise<string[]> {
  const rows = await db.smsConsent.findMany({
    orderBy: { createdAt: "desc" },
    select: { phone: true, revokedAt: true },
  });
  const seen = new Set<string>();
  const live: string[] = [];
  for (const r of rows) {
    if (seen.has(r.phone)) continue;
    seen.add(r.phone);
    if (!r.revokedAt) live.push(r.phone);
  }
  return live;
}
