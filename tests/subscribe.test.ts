import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";

process.env.ADMIN_SESSION_SECRET = "unit-test-secret-unit-test-secret";

type Sub = {
  email: string;
  source: string;
  consentAt: Date;
  consentTextVersion: string;
  createdAt: Date;
  unsubscribedAt: Date | null;
};
const store = { subs: [] as Sub[], limited: false, fail: null as null | { code: string } };
const sendMail = vi.fn(async () => {});

const guard = () => {
  if (store.fail) throw Object.assign(new Error("db"), store.fail);
};

vi.mock("@/lib/rate-limit", () => ({ isRateLimited: () => store.limited, clientIp: () => "1.2.3.4" }));
vi.mock("@/lib/mail", () => ({ sendMail: (...a: unknown[]) => (sendMail as (...x: unknown[]) => Promise<void>)(...a) }));
vi.mock("@/lib/db", () => ({
  db: {
    emailSubscriber: {
      findUnique: async ({ where }: { where: { email: string } }) => {
        guard();
        return store.subs.find((s) => s.email === where.email) ?? null;
      },
      create: async ({ data }: { data: Omit<Sub, "createdAt" | "unsubscribedAt"> }) => {
        guard();
        if (store.subs.some((s) => s.email === data.email)) throw new Error("unique");
        store.subs.push({ ...data, createdAt: new Date(), unsubscribedAt: null });
      },
      update: async ({ where, data }: { where: { email: string }; data: Partial<Sub> }) => {
        Object.assign(store.subs.find((s) => s.email === where.email)!, data);
      },
      updateMany: async ({ where, data }: { where: { email: string; unsubscribedAt: null }; data: Partial<Sub> }) => {
        guard();
        for (const s of store.subs) if (s.email === where.email && !s.unsubscribedAt) Object.assign(s, data);
      },
    },
  },
}));

const { POST } = await import("@/app/api/subscribe/route");
const { GET: unsubscribe } = await import("@/app/api/unsubscribe/route");
const { unsubscribeToken, csvCell, normalizeEmail } = await import("@/lib/subscribers");
const { forwardToKlaviyo } = await import("@/lib/klaviyo");

const post = (body: unknown) =>
  POST(new NextRequest("http://localhost/api/subscribe", { method: "POST", body: JSON.stringify(body) }));
const good = { email: "Ada@Example.com ", consent: true, source: "journal", website: "" };

beforeEach(() => {
  store.subs = [];
  store.limited = false;
  store.fail = null;
  sendMail.mockClear();
  delete process.env.HOSTINGER_SMTP_HOST;
  delete process.env.HOSTINGER_SMTP_USER;
  delete process.env.KLAVIYO_PRIVATE_KEY;
  delete process.env.KLAVIYO_LIST_ID;
  vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => vi.unstubAllGlobals());

describe("POST /api/subscribe", () => {
  it("stores a normalized email with consent metadata", async () => {
    const res = await post(good);
    expect(res.status).toBe(200);
    expect(store.subs).toHaveLength(1);
    expect(store.subs[0]).toMatchObject({ email: "ada@example.com", source: "journal", consentTextVersion: "2026-10-v1" });
    expect(store.subs[0].consentAt).toBeInstanceOf(Date);
  });

  it("rejects missing or false consent and stores nothing", async () => {
    for (const consent of [undefined, false, "true", 1]) {
      expect((await post({ ...good, consent })).status).toBe(400);
    }
    expect(store.subs).toHaveLength(0);
  });

  it("rejects invalid emails", async () => {
    for (const email of ["", "nope", "a@b", 5, null]) expect((await post({ ...good, email })).status).toBe(400);
    expect(store.subs).toHaveLength(0);
  });

  it("silently succeeds on a filled honeypot without storing", async () => {
    const res = await post({ ...good, website: "http://spam" });
    expect(res.status).toBe(200);
    expect(store.subs).toHaveLength(0);
  });

  it("returns 429 when rate limited", async () => {
    store.limited = true;
    expect((await post(good)).status).toBe(429);
    expect(store.subs).toHaveLength(0);
  });

  it("is identical for a duplicate and does not re-email (no enumeration)", async () => {
    process.env.HOSTINGER_SMTP_HOST = "h";
    process.env.HOSTINGER_SMTP_USER = "u";
    const first = await post(good);
    const dup = await post({ ...good, email: "ADA@example.com" });
    expect(dup.status).toBe(first.status);
    expect(await dup.json()).toEqual(await first.json());
    expect(store.subs).toHaveLength(1);
    expect(sendMail).toHaveBeenCalledTimes(1);
  });

  it("re-subscribing after unsubscribe clears the suppression", async () => {
    await post(good);
    store.subs[0].unsubscribedAt = new Date();
    await post(good);
    expect(store.subs[0].unsubscribedAt).toBeNull();
  });

  it("sends a welcome email with a verifiable unsubscribe link only when SMTP is configured", async () => {
    await post(good);
    expect(sendMail).not.toHaveBeenCalled();
    process.env.HOSTINGER_SMTP_HOST = "h";
    process.env.HOSTINGER_SMTP_USER = "u";
    await post({ ...good, email: "b@example.com" });
    const arg = (sendMail.mock.calls[0] as unknown as [{ to: string; text: string }])[0];
    expect(arg.to).toBe("b@example.com");
    expect(arg.text).toContain(`/api/unsubscribe?e=b%40example.com&t=${unsubscribeToken("b@example.com")}`);
  });

  it("a mail failure never fails the signup", async () => {
    process.env.HOSTINGER_SMTP_HOST = "h";
    process.env.HOSTINGER_SMTP_USER = "u";
    sendMail.mockRejectedValueOnce(new Error("smtp down"));
    expect((await post(good)).status).toBe(200);
  });

  it("degrades to a friendly 503 when the table does not exist yet", async () => {
    store.fail = { code: "P2021" };
    const res = await post(good);
    expect(res.status).toBe(503);
    expect((await res.json()).error).toMatch(/unavailable/i);
  });
});

describe("GET /api/unsubscribe", () => {
  const get = (e: string, t: string) =>
    unsubscribe(new NextRequest(`http://localhost/api/unsubscribe?e=${encodeURIComponent(e)}&t=${t}`));

  it("suppresses with a valid token", async () => {
    await post(good);
    const res = await get("ada@example.com", unsubscribeToken("ada@example.com")!);
    expect(res.headers.get("location")).toContain("status=ok");
    expect(store.subs[0].unsubscribedAt).toBeInstanceOf(Date);
  });

  it("rejects a forged token and another address's token", async () => {
    await post(good);
    await post({ ...good, email: "other@example.com" });
    for (const t of ["garbage", "", unsubscribeToken("other@example.com")!]) {
      const res = await get("ada@example.com", t);
      expect(res.headers.get("location")).toContain("status=invalid");
    }
    expect(store.subs.every((s) => !s.unsubscribedAt)).toBe(true);
  });
});

describe("klaviyo adapter", () => {
  it("no-ops without env vars (no fetch)", async () => {
    const f = vi.fn();
    vi.stubGlobal("fetch", f);
    expect(await forwardToKlaviyo("a@b.com")).toBe(false);
    expect(f).not.toHaveBeenCalled();
  });

  it("posts a subscription job to the configured list", async () => {
    process.env.KLAVIYO_PRIVATE_KEY = "pk_x";
    process.env.KLAVIYO_LIST_ID = "LIST1";
    const f = vi.fn(async () => new Response(null, { status: 202 }));
    vi.stubGlobal("fetch", f);
    expect(await forwardToKlaviyo("a@b.com")).toBe(true);
    const [url, init] = f.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toContain("klaviyo.com/api/profile-subscription-bulk-create-jobs");
    expect((init.headers as Record<string, string>).Authorization).toBe("Klaviyo-API-Key pk_x");
    const body = JSON.parse(init.body as string);
    expect(body.data.relationships.list.data.id).toBe("LIST1");
    expect(body.data.attributes.profiles.data[0].attributes.email).toBe("a@b.com");
  });

  it("swallows API errors and network failures", async () => {
    process.env.KLAVIYO_PRIVATE_KEY = "pk_x";
    process.env.KLAVIYO_LIST_ID = "LIST1";
    vi.stubGlobal("fetch", vi.fn(async () => new Response(null, { status: 500 })));
    expect(await forwardToKlaviyo("a@b.com")).toBe(false);
    vi.stubGlobal("fetch", vi.fn(async () => { throw new Error("net"); }));
    expect(await forwardToKlaviyo("a@b.com")).toBe(false);
  });
});

describe("helpers", () => {
  it("neutralises CSV formula injection and quotes", () => {
    expect(csvCell("=HYPERLINK(1)")).toBe(`"'=HYPERLINK(1)"`);
    expect(csvCell('a"b')).toBe('"a""b"');
  });
  it("normalizes emails", () => {
    expect(normalizeEmail("  A@B.co ")).toBe("a@b.co");
    expect(normalizeEmail("a b@c.co")).toBeNull();
  });
});
