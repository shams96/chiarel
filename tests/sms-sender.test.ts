import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";

process.env.TWILIO_AUTH_TOKEN = "unit-test-token";

type Consent = { phone: string; createdAt: number; revokedAt: Date | null; revokedVia?: string };
const store = { consents: [] as Consent[], messages: [] as Record<string, unknown>[] };

vi.mock("@/lib/db", () => ({
  db: {
    smsConsent: {
      findFirst: async ({ where }: { where: { phone: string } }) =>
        store.consents.filter((c) => c.phone === where.phone).sort((a, b) => b.createdAt - a.createdAt)[0] ?? null,
      findMany: async () => [...store.consents].sort((a, b) => b.createdAt - a.createdAt),
      updateMany: async ({ where, data }: { where: { phone: string }; data: Partial<Consent> }) => {
        for (const c of store.consents) if (c.phone === where.phone && !c.revokedAt) Object.assign(c, data);
      },
    },
    smsMessage: { create: async ({ data }: { data: Record<string, unknown> }) => void store.messages.push(data) },
  },
}));

const { sendMarketingText, withOptOut, numbersWithLiveConsent } = await import("@/lib/sms-send");
const { inSafeSendWindow } = await import("@/lib/sms-window");
const { classifyInbound } = await import("@/lib/sms-keywords");
const { twilioSignature, validTwilioSignature } = await import("@/lib/sms-twilio");
const { POST: inbound } = await import("@/app/api/sms/inbound/route");
const { SITE_URL } = await import("@/lib/seo");

const PHONE = "+14155552671";
// 2026-11-19 12:00 UTC = 7am ET (outside) / 18:00 UTC = 1pm ET (inside)
const OUTSIDE = new Date("2026-11-19T12:00:00Z");
const INSIDE = new Date("2026-11-19T18:00:00Z");
const fetchMock = vi.fn();

beforeEach(() => {
  store.consents = [{ phone: PHONE, createdAt: 1, revokedAt: null }];
  store.messages = [];
  fetchMock.mockReset();
  fetchMock.mockResolvedValue({ ok: true, json: async () => ({ sid: "SM123" }) });
  vi.stubGlobal("fetch", fetchMock);
  process.env.SMS_SEND_ENABLED = "on";
  process.env.TWILIO_ACCOUNT_SID = "ACtest";
  process.env.TWILIO_MESSAGING_SERVICE_SID = "MGtest";
  delete process.env.TWILIO_FROM;
});
afterEach(() => vi.unstubAllGlobals());

describe("send window", () => {
  it("is 1pm-7pm Eastern only", () => {
    expect(inSafeSendWindow(new Date("2026-11-19T17:59:00Z"))).toBe(false); // 12:59 ET
    expect(inSafeSendWindow(INSIDE)).toBe(true); // 13:00 ET
    expect(inSafeSendWindow(new Date("2026-11-19T23:59:00Z"))).toBe(true); // 18:59 ET
    expect(inSafeSendWindow(new Date("2026-11-20T00:00:00Z"))).toBe(false); // 19:00 ET
  });
  it("tracks daylight saving", () => {
    expect(inSafeSendWindow(new Date("2026-07-19T17:00:00Z"))).toBe(true); // 1pm EDT
  });
});

describe("sendMarketingText gates", () => {
  it("sends nothing unless switched on", async () => {
    process.env.SMS_SEND_ENABLED = "";
    expect(await sendMarketingText(PHONE, "Hi", { now: INSIDE })).toEqual({ sent: false, reason: "disabled" });
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it("sends nothing without keys", async () => {
    delete process.env.TWILIO_MESSAGING_SERVICE_SID;
    expect(await sendMarketingText(PHONE, "Hi", { now: INSIDE })).toEqual({ sent: false, reason: "not-configured" });
  });
  it("refuses a number with no saved yes", async () => {
    store.consents = [];
    expect(await sendMarketingText(PHONE, "Hi", { now: INSIDE })).toEqual({ sent: false, reason: "no-consent" });
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it("refuses a number whose newest record is revoked", async () => {
    store.consents[0].revokedAt = new Date();
    expect(await sendMarketingText(PHONE, "Hi", { now: INSIDE })).toEqual({ sent: false, reason: "no-consent" });
  });
  it("refuses outside the safe window", async () => {
    expect(await sendMarketingText(PHONE, "Hi", { now: OUTSIDE })).toEqual({ sent: false, reason: "quiet-hours" });
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it("rejects a malformed number", async () => {
    expect(await sendMarketingText("123", "Hi", { now: INSIDE })).toEqual({ sent: false, reason: "invalid-phone" });
  });
  it("sends with the opt-out line and logs it", async () => {
    const r = await sendMarketingText(PHONE, "New formula is here.", { now: INSIDE });
    expect(r).toEqual({ sent: true, sid: "SM123" });
    const body = String(fetchMock.mock.calls[0][1].body);
    expect(decodeURIComponent(body.replace(/\+/g, " "))).toContain("Reply STOP to opt out.");
    expect(body).toContain("MessagingServiceSid=MGtest");
    expect(store.messages[0]).toMatchObject({ phone: PHONE, status: "queued", providerSid: "SM123" });
  });
  it("logs a provider failure and reports it", async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 400, json: async () => ({ message: "bad" }) });
    expect(await sendMarketingText(PHONE, "Hi", { now: INSIDE })).toEqual({ sent: false, reason: "provider-error" });
    expect(store.messages[0]).toMatchObject({ status: "failed", error: "bad" });
  });
  it("does not double the opt-out line", () => {
    expect(withOptOut("Hello. Reply STOP to cancel.")).toBe("Hello. Reply STOP to cancel.");
  });
});

describe("numbersWithLiveConsent", () => {
  it("lists only numbers whose newest record is live, once each", async () => {
    store.consents = [
      { phone: "+14155552671", createdAt: 1, revokedAt: new Date() },
      { phone: "+14155552671", createdAt: 2, revokedAt: null }, // re-consented later
      { phone: "+12125550100", createdAt: 3, revokedAt: new Date() },
    ];
    expect(await numbersWithLiveConsent()).toEqual(["+14155552671"]);
  });
});

describe("classifyInbound", () => {
  it("treats every FCC revocation word and reasonable wording as stop", () => {
    for (const t of ["STOP", "stop", "Stop all", "QUIT", "END", "REVOKE", "opt out", "optout", "CANCEL", "unsubscribe", "please stop texting me", "STOP."]) {
      expect(classifyInbound(t)).toBe("stop");
    }
  });
  it("recognises HELP and ignores ordinary replies", () => {
    expect(classifyInbound("help")).toBe("help");
    expect(classifyInbound("INFO")).toBe("help");
    expect(classifyInbound("love it, thanks")).toBe("other");
    expect(classifyInbound("stopwatch")).toBe("other");
    expect(classifyInbound(undefined)).toBe("other");
  });
});

describe("POST /api/sms/inbound", () => {
  const url = `${SITE_URL}/api/sms/inbound`;
  const req = (params: Record<string, string>, signed = true) =>
    new NextRequest("http://localhost/api/sms/inbound", {
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        ...(signed ? { "x-twilio-signature": twilioSignature("unit-test-token", url, params) } : {}),
      },
      body: new URLSearchParams(params).toString(),
    });

  it("verifies signatures", () => {
    const p = { Body: "STOP", From: PHONE };
    const sig = twilioSignature("unit-test-token", url, p);
    expect(validTwilioSignature("unit-test-token", url, p, sig)).toBe(true);
    expect(validTwilioSignature("unit-test-token", url, { ...p, Body: "HI" }, sig)).toBe(false);
    expect(validTwilioSignature("unit-test-token", url, p, null)).toBe(false);
  });
  it("rejects an unsigned or wrongly signed request and revokes nothing", async () => {
    expect((await inbound(req({ Body: "STOP", From: PHONE }, false))).status).toBe(403);
    expect(store.consents[0].revokedAt).toBeNull();
  });
  it("revokes consent on STOP, then the sender refuses", async () => {
    const res = await inbound(req({ Body: "STOP", From: "(415) 555-2671" }));
    expect(res.status).toBe(200);
    expect(store.consents[0].revokedAt).toBeInstanceOf(Date);
    expect(store.consents[0].revokedVia).toBe("sms-reply");
    expect(await sendMarketingText(PHONE, "Hi", { now: INSIDE })).toEqual({ sent: false, reason: "no-consent" });
  });
  it("answers HELP with the help text and leaves consent alone", async () => {
    const res = await inbound(req({ Body: "HELP", From: PHONE }));
    expect(await res.text()).toContain("hello@chiarel.com");
    expect(store.consents[0].revokedAt).toBeNull();
  });
  it("ignores other replies", async () => {
    await inbound(req({ Body: "thanks!", From: PHONE }));
    expect(store.consents[0].revokedAt).toBeNull();
  });
});
