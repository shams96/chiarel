import { NextRequest, NextResponse } from "next/server";
import { SITE_URL } from "@/lib/seo";
import { normalizeNanpPhone, revokeSmsConsent } from "@/lib/sms-consent";
import { classifyInbound, HELP_REPLY } from "@/lib/sms-keywords";
import { validTwilioSignature } from "@/lib/sms-twilio";

// Twilio posts every reply to our number here. STOP-style replies revoke
// consent for that number immediately (the law allows 10 business days; we do
// it at once). Twilio also blocks further sends at the carrier level.
const xml = (inner: string) =>
  new NextResponse(`<?xml version="1.0" encoding="UTF-8"?><Response>${inner}</Response>`, {
    headers: { "Content-Type": "text/xml" },
  });
const escapeXml = (s: string) => s.replace(/[<>&"']/g, (c) => `&#${c.charCodeAt(0)};`);

export async function POST(req: NextRequest) {
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!token) return NextResponse.json({ error: "Not configured" }, { status: 503 });

  const form = await req.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "Bad request" }, { status: 400 });
  const params: Record<string, string> = {};
  form.forEach((v, k) => {
    if (typeof v === "string") params[k] = v;
  });

  // The proxy can rewrite req.url, so sign against the public URL.
  if (!validTwilioSignature(token, `${SITE_URL}/api/sms/inbound`, params, req.headers.get("x-twilio-signature"))) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
  }

  const kind = classifyInbound(params.Body);
  if (kind === "stop") {
    const phone = normalizeNanpPhone(params.From);
    if (phone) await revokeSmsConsent(phone, "sms-reply");
    return xml(""); // Twilio sends its own opt-out confirmation
  }
  if (kind === "help") return xml(`<Message>${escapeXml(HELP_REPLY)}</Message>`);
  return xml("");
}
