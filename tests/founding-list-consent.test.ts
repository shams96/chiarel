import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

type Signup = { name: string; email: string; phone: string | null };
type Consent = { phone: string; consentText: string; consentTextVersion: string };
const store = { signups: [] as Signup[], consents: [] as Consent[] };

// Like Prisma, a query is lazy: it runs when awaited or when handed to $transaction.
const lazy = (run: () => void) => {
  let done: Promise<void> | null = null;
  const exec = () => (done ??= Promise.resolve().then(run));
  return Object.assign(exec(), { exec });
};

vi.mock("@/lib/rate-limit", () => ({ isRateLimited: () => false, clientIp: () => "1.2.3.4" }));
vi.mock("@/lib/db", () => ({
  db: {
    foundingSignup: {
      count: async () => store.signups.length,
      create: ({ data }: { data: Signup }) => lazy(() => void store.signups.push(data)),
    },
    smsConsent: {
      create: ({ data }: { data: Consent }) => lazy(() => void store.consents.push(data)),
    },
    $transaction: async (ops: Promise<void>[]) => {
      await Promise.all(ops);
    },
  },
}));

const { POST } = await import("@/app/api/founding-list/route");
const post = (body: unknown, headers: Record<string, string> = {}) =>
  POST(new NextRequest("http://localhost/api/founding-list", { method: "POST", headers, body: JSON.stringify(body) }));
const base = { name: "Ada", email: "ada@example.com", dateOfBirth: "1990-05-20", source: "founding-100" };

beforeEach(() => {
  store.signups = [];
  store.consents = [];
  vi.spyOn(console, "error").mockImplementation(() => {});
  delete process.env.FOUNDING_LIST_WEBHOOK_URL;
});

describe("POST /api/founding-list consent and age", () => {
  it("blocks under-13 and stores nothing", async () => {
    const y = new Date().getUTCFullYear() - 9;
    const res = await post({ ...base, dateOfBirth: `${y}-01-01`, phone: "415-555-2671", smsConsent: true });
    expect(res.status).toBe(403);
    expect(store.signups).toHaveLength(0);
    expect(store.consents).toHaveLength(0);
  });
  it("drops the phone when the text box is not ticked", async () => {
    const res = await post({ ...base, phone: "415-555-2671", smsConsent: false });
    expect(res.status).toBe(200);
    expect(store.signups[0].phone).toBeNull();
    expect(store.consents).toHaveLength(0);
  });
  it("saves phone and a consent record together on a tick", async () => {
    const res = await post({ ...base, phone: "(415) 555-2671", smsConsent: true }, { "user-agent": "vitest" });
    expect(res.status).toBe(200);
    expect(store.signups[0].phone).toBe("+14155552671");
    expect(store.consents).toHaveLength(1);
    expect(store.consents[0].consentText).toContain("not a condition of any purchase");
    expect(store.consents[0].consentTextVersion).toBeTruthy();
  });
  it("rejects a ticked box with a bad number and saves nothing", async () => {
    const res = await post({ ...base, phone: "123", smsConsent: true });
    expect(res.status).toBe(400);
    expect(store.signups).toHaveLength(0);
  });
});
