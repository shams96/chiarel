import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

process.env.ADMIN_SESSION_SECRET = "unit-test-secret-unit-test-secret";

type U = { id: string; email: string; role: "ADMIN" | "MEMBER" | "VIEWER"; passwordHash: string };
type O = Record<string, any>;
const store = { users: [] as U[], sessions: [] as any[], orders: [] as O[], nextId: 1, lastFindMany: undefined as any };

vi.mock("@/lib/rate-limit", () => ({ isRateLimited: () => false, clientIp: () => "9.9.9.9" }));
vi.mock("@/lib/dispute-monitoring", () => ({
  computeDisputeRateReport: async () => ({
    paymentsLastMonth: 4,
    disputesThisMonth: 1,
    visaRatio: 0.25,
    mastercardRatio: 0.25,
    visaTier: "over-threshold",
    mastercardTier: "over-threshold",
    overallTier: "over-threshold",
  }),
}));
vi.mock("@/lib/db", () => {
  const disputed = (w: any = {}) =>
    store.orders
      .filter((o) => o.disputeId != null)
      .filter((o) => (w.disputeClosedAt === null ? o.disputeClosedAt == null : w.disputeClosedAt?.not === null ? o.disputeClosedAt != null : true));
  const db: any = {
    session: {
      create: async ({ data }: any) => {
        const s = { id: `s${store.nextId++}`, ...data };
        store.sessions.push(s);
        return s;
      },
      findUnique: async ({ where }: any) => {
        const s = store.sessions.find((x) => x.id === where.id);
        return s ? { ...s, user: store.users.find((u) => u.id === s.userId) } : null;
      },
      delete: async () => undefined,
    },
    user: { findUnique: async () => null },
    order: {
      findMany: async (args: any) => {
        store.lastFindMany = args;
        let rows = disputed(args.where).sort((a, b) => (b.disputeOpenedAt?.getTime() ?? 0) - (a.disputeOpenedAt?.getTime() ?? 0));
        if (args.cursor) rows = rows.slice(rows.findIndex((o) => o.id === args.cursor.id) + (args.skip ?? 0));
        return rows.slice(0, args.take).map((o) => ({ ...o, items: (o.items ?? []).map((i: O) => ({ ...i, product: { name: `Product ${i.productSlug}` } })) }));
      },
      count: async ({ where }: any) => disputed(where).length,
      aggregate: async ({ where }: any) => ({ _sum: { disputeAmount: disputed(where).reduce((s, o) => s + (o.disputeAmount ?? 0), 0) } }),
    },
  };
  return { db };
});

const auth = await import("@/lib/auth");
const route = await import("@/app/api/admin/disputes/route");
const { evidenceChecklist, stripePaymentUrl, presentDispute } = await import("@/lib/admin-disputes");

function addUser(id: string, role: U["role"]) {
  store.users.push({ id, email: `${id}@x.com`, role, passwordHash: "x" });
}
const get = async (user: string | null, qs = "") =>
  route.GET(
    new NextRequest(`http://localhost/api/admin/disputes${qs}`, {
      headers: user ? { cookie: `chiarel_admin_session=${await auth.createSession(user)}` } : {},
    })
  );

const full = (over: O = {}): O => ({
  id: "ord_aaaaaaaa11111111",
  createdAt: new Date("2026-10-01T10:00:00Z"),
  email: "jane@example.test",
  firstName: "Jane",
  lastName: "Doe",
  address: "1 High St",
  city: "Rome",
  state: null,
  zip: "00100",
  country: "IT",
  total: 158,
  status: "paid",
  fulfilmentStatus: "delivered",
  termsAcceptedAt: new Date("2026-10-01T10:00:00Z"),
  termsVersion: "2026-09",
  trackingCarrier: "UPS",
  trackingNumber: "1Z999",
  shippedAt: new Date("2026-10-02T10:00:00Z"),
  deliveredAt: new Date("2026-10-05T10:00:00Z"),
  stripePaymentIntentId: "pi_3Abc123",
  disputeId: "dp_1",
  disputeStatus: "needs_response",
  disputeReason: "product_not_received",
  disputeAmount: 158,
  disputeOpenedAt: new Date("2026-10-20T10:00:00Z"),
  disputeClosedAt: null,
  items: [{ qty: 1, unitPrice: 148, mode: "one-time", productSlug: "essence" }],
  ...over,
});

beforeEach(() => {
  store.users = [];
  store.sessions = [];
  store.orders = [];
  store.nextId = 1;
  store.lastFindMany = undefined;
  delete process.env.STRIPE_SECRET_KEY;
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("evidenceChecklist", () => {
  it("is complete when every record exists", () => {
    const c = evidenceChecklist(full() as any);
    expect(c).toMatchObject({ complete: true, missing: [] });
    expect(c.items).toHaveLength(7);
    expect(c.items.find((i) => i.key === "tracking")?.detail).toBe("UPS 1Z999");
    expect(c.items.find((i) => i.key === "items")?.detail).toBe("1 x essence");
  });

  it.each([
    ["terms", { termsAcceptedAt: null }],
    ["terms", { termsVersion: null }],
    ["terms", { termsVersion: "  " }],
    ["tracking", { trackingNumber: null }],
    ["tracking", { trackingCarrier: "" }],
    ["shipped", { shippedAt: null }],
    ["delivered", { deliveredAt: null }],
    ["email", { email: " " }],
    ["address", { address: "" }],
    ["address", { city: "" }],
    ["address", { country: "" }],
    ["items", { items: [] }],
  ])("flags %s missing when %j", (key, over) => {
    const c = evidenceChecklist(full(over) as any);
    expect(c.missing).toEqual([key]);
    expect(c.complete).toBe(false);
  });

  it("lists every gap on a bare order", () => {
    const c = evidenceChecklist(
      full({ termsAcceptedAt: null, termsVersion: null, trackingCarrier: null, trackingNumber: null, shippedAt: null, deliveredAt: null }) as any
    );
    expect(c.missing).toEqual(["terms", "tracking", "shipped", "delivered"]);
  });
});

describe("stripePaymentUrl", () => {
  it("adds /test in test mode and not in live mode", () => {
    expect(stripePaymentUrl("pi_3Abc123", "test")).toBe("https://dashboard.stripe.com/test/payments/pi_3Abc123");
    expect(stripePaymentUrl("pi_3Abc123", "live")).toBe("https://dashboard.stripe.com/payments/pi_3Abc123");
  });

  it("gives no link without a payment intent, with an unknown key mode, or with anything but a pi_ id", () => {
    expect(stripePaymentUrl(null, "test")).toBeNull();
    expect(stripePaymentUrl("pi_3Abc123", "unknown")).toBeNull();
    for (const bad of ["cs_test_1", "pi_", "pi_x/../../evil", "pi_x?y=1", "pi_x y", "https://evil.test/pi_x", "PI_x"]) {
      expect(stripePaymentUrl(bad, "test")).toBeNull();
    }
  });
});

describe("presentDispute", () => {
  it("shapes an open and a closed dispute", () => {
    const open = presentDispute(full() as any, "test");
    expect(open).toMatchObject({ open: true, amount: 158, status: "needs_response", evidenceComplete: true, customer: "Jane Doe" });
    expect(open.stripeUrl).toContain("/test/payments/pi_3Abc123");
    const closed = presentDispute(full({ disputeClosedAt: new Date(), disputeStatus: "won", stripePaymentIntentId: null }) as any, "live");
    expect(closed).toMatchObject({ open: false, status: "won", stripeUrl: null });
  });
});

describe("GET /api/admin/disputes", () => {
  it("needs sign-in, and Viewer is refused", async () => {
    addUser("v", "VIEWER");
    store.orders.push(full());
    expect((await get(null)).status).toBe(401);
    expect((await get("v")).status).toBe(403);
  });

  it.each(["ADMIN", "MEMBER"] as const)("lets a %s read disputes", async (role) => {
    addUser("u", role);
    store.orders.push(full());
    const res = await get("u");
    expect(res.status).toBe(200);
    const j = await res.json();
    expect(j.disputes).toHaveLength(1);
    expect(j.report).toMatchObject({ disputesThisMonth: 1, overallTier: "over-threshold" });
  });

  it("returns only disputed orders, with summary counts and the amount still open", async () => {
    addUser("a", "ADMIN");
    store.orders.push(
      full({ id: "o_open" }),
      full({ id: "o_closed", disputeId: "dp_2", disputeClosedAt: new Date(), disputeStatus: "won" }),
      full({ id: "o_clean", disputeId: null, disputeStatus: null, disputeAmount: null, disputeOpenedAt: null })
    );
    const j = await (await get("a")).json();
    expect(j.disputes.map((d: O) => d.orderId).sort()).toEqual(["o_closed", "o_open"]);
    expect(j.summary).toEqual({ open: 1, closed: 1, openAmount: 158 });
  });

  it("filters open and closed", async () => {
    addUser("a", "ADMIN");
    store.orders.push(full({ id: "o_open" }), full({ id: "o_closed", disputeId: "dp_2", disputeClosedAt: new Date() }));
    const open = await (await get("a", "?status=open")).json();
    expect(open.disputes.map((d: O) => d.orderId)).toEqual(["o_open"]);
    const closed = await (await get("a", "?status=closed")).json();
    expect(closed.disputes.map((d: O) => d.orderId)).toEqual(["o_closed"]);
  });

  it("pages with a cursor and caps take at 100", async () => {
    addUser("a", "ADMIN");
    for (let i = 0; i < 5; i++) store.orders.push(full({ id: `o${i}`, disputeId: `dp${i}`, disputeOpenedAt: new Date(Date.UTC(2026, 9, 1 + i)) }));
    const first = await (await get("a", "?take=2")).json();
    expect(first.disputes.map((d: O) => d.orderId)).toEqual(["o4", "o3"]);
    const second = await (await get("a", `?take=2&cursor=${first.nextCursor}`)).json();
    expect(second.disputes.map((d: O) => d.orderId)).toEqual(["o2", "o1"]);
    const last = await (await get("a", `?take=2&cursor=${second.nextCursor}`)).json();
    expect(last.disputes.map((d: O) => d.orderId)).toEqual(["o0"]);
    expect(last.nextCursor).toBeNull();
    await get("a", "?take=9999");
    expect(store.lastFindMany.take).toBe(101);
  });

  it("builds the Stripe link from the key mode", async () => {
    addUser("a", "ADMIN");
    store.orders.push(full());
    process.env.STRIPE_SECRET_KEY = "sk_test_x";
    expect((await (await get("a")).json()).disputes[0].stripeUrl).toContain("/test/payments/");
    process.env.STRIPE_SECRET_KEY = "sk_live_x";
    const live = (await (await get("a")).json()).disputes[0].stripeUrl;
    expect(live).toBe("https://dashboard.stripe.com/payments/pi_3Abc123");
    delete process.env.STRIPE_SECRET_KEY;
    expect((await (await get("a")).json()).disputes[0].stripeUrl).toBeNull();
  });

  it("has no write path", () => {
    expect(Object.keys(route)).toEqual(["GET"]);
  });
});
