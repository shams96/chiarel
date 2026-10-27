import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

process.env.ADMIN_SESSION_SECRET = "unit-test-secret-unit-test-secret";

type U = { id: string; email: string; role: "ADMIN" | "MEMBER" | "VIEWER"; passwordHash: string };
type S = { id: string; userId: string; expiresAt: Date };
type O = Record<string, any>;
const store = {
  users: [] as U[],
  sessions: [] as S[],
  audit: [] as Record<string, any>[],
  orders: [] as O[],
  nextId: 1,
  lastWhere: undefined as any,
  staleOnce: false,
};

vi.mock("@/lib/rate-limit", () => ({ isRateLimited: () => false, clientIp: () => "9.9.9.9" }));
vi.mock("@/lib/admin-dashboard", async (orig) => ({
  ...(await orig<typeof import("@/lib/admin-dashboard")>()),
  getDashboard: async () => ({ ok: true }),
}));
vi.mock("@/lib/db", () => {
  const withItems = (o: O) => ({
    ...o,
    items: (o.items ?? []).map((i: O) => ({ ...i, product: { name: `Product ${i.productSlug}` } })),
  });
  const db: any = {
    $transaction: async (arg: any) => (Array.isArray(arg) ? Promise.all(arg) : arg(db)),
    auditLog: {
      create: async ({ data }: any) => {
        const e = { id: `a${store.nextId++}`, createdAt: new Date(), ...data };
        store.audit.push(e);
        return e;
      },
    },
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
        store.lastWhere = args.where;
        const w = args.where ?? {};
        const rows = store.orders
          .filter((o) => !w.status || o.status === w.status)
          .filter((o) => {
            const f = w.fulfilmentStatus;
            if (!f) return true;
            return typeof f === "string" ? o.fulfilmentStatus === f : f.in.includes(o.fulfilmentStatus);
          })
          .slice(0, args.take);
        return args.include ? rows.map(withItems) : rows.map((o) => ({ ...o, _count: { items: (o.items ?? []).length } }));
      },
      findUnique: async ({ where, include }: any) => {
        const o = store.orders.find((x) => x.id === where.id);
        return o ? (include ? withItems(o) : { ...o }) : null;
      },
      updateMany: async ({ where, data }: any) => {
        const o = store.orders.find((x) => x.id === where.id && x.fulfilmentStatus === where.fulfilmentStatus);
        if (!o || store.staleOnce) {
          store.staleOnce = false;
          return { count: 0 };
        }
        Object.assign(o, data);
        return { count: 1 };
      },
    },
  };
  return { db };
});

const auth = await import("@/lib/auth");
const ordersRoute = await import("@/app/api/admin/orders/route");
const orderRoute = await import("@/app/api/admin/orders/[id]/route");
const exportRoute = await import("@/app/api/admin/orders/export/route");
const dashRoute = await import("@/app/api/admin/dashboard/route");
const { planOrderUpdate, allowedNext, FULFILMENT_STATUSES } = await import("@/lib/order-fulfilment");
const { maskEmail, presentOrder, exportRow } = await import("@/lib/admin-orders");
const { shapeWindow, paymentsMode } = await import("@/lib/admin-dashboard");

function addUser(id: string, role: U["role"]) {
  store.users.push({ id, email: `${id}@x.com`, role, passwordHash: "x" });
}
const cookieFor = (id: string) => auth.createSession(id);
const req = (method: string, url: string, opts: { cookie?: string; body?: unknown } = {}) =>
  new NextRequest(`http://localhost${url}`, {
    method,
    body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
    headers: opts.cookie ? { cookie: `chiarel_admin_session=${opts.cookie}` } : {},
  });
const ctx = (id: string) => ({ params: Promise.resolve({ id }) });

const baseOrder = (over: O = {}): O => ({
  id: "ord_abcdefgh12345678",
  createdAt: new Date("2026-10-20T10:00:00Z"),
  email: "jane.doe@example.com",
  firstName: "Jane",
  lastName: "Doe",
  address: "1 High St",
  city: "Rome",
  state: null,
  zip: "00100",
  country: "IT",
  subtotal: 148,
  savings: 0,
  shipping: 10,
  total: 158,
  status: "paid",
  fulfilmentStatus: "unfulfilled",
  bonusSample: false,
  trackingCarrier: null,
  trackingNumber: null,
  shippedAt: null,
  deliveredAt: null,
  internalNote: null,
  stripeSessionId: "cs_test_1",
  stripePaymentIntentId: "pi_test_1",
  disputeId: null,
  disputeStatus: null,
  disputeReason: null,
  disputeAmount: null,
  disputeOpenedAt: null,
  disputeClosedAt: null,
  founding100Credit: null,
  founding100CreditIssuedAt: null,
  termsAcceptedAt: null,
  termsVersion: null,
  items: [{ id: "i1", productSlug: "essence", mode: "one-time", qty: 1, unitPrice: 148 }],
  ...over,
});

beforeEach(() => {
  store.users = [];
  store.sessions = [];
  store.audit = [];
  store.orders = [];
  store.nextId = 1;
  store.lastWhere = undefined;
  store.staleOnce = false;
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("fulfilment state machine", () => {
  const plan = (o: Partial<O>, input: O, role: U["role"] = "MEMBER") =>
    planOrderUpdate({ status: "paid", fulfilmentStatus: "unfulfilled", trackingCarrier: null, trackingNumber: null, ...o }, input, role);

  it("allows only the documented moves", () => {
    expect(allowedNext("unfulfilled")).toEqual(["packed", "cancelled"]);
    expect(allowedNext("packed")).toEqual(["unfulfilled", "shipped", "cancelled"]);
    expect(allowedNext("shipped")).toEqual(["delivered"]);
    expect(allowedNext("delivered")).toEqual([]);
    expect(allowedNext("cancelled")).toEqual([]);
  });

  it("rejects every move that is not allowed, for every pair", () => {
    for (const from of FULFILMENT_STATUSES) {
      for (const to of FULFILMENT_STATUSES) {
        if (from === to) continue;
        const r = plan({ fulfilmentStatus: from, trackingCarrier: "UPS", trackingNumber: "1Z" }, { fulfilmentStatus: to }, "ADMIN");
        expect(r.ok).toBe(allowedNext(from).includes(to));
      }
    }
  });

  it("requires carrier and tracking to ship, and stamps shippedAt", () => {
    expect(plan({ fulfilmentStatus: "packed" }, { fulfilmentStatus: "shipped" })).toMatchObject({ ok: false, status: 400 });
    expect(plan({ fulfilmentStatus: "packed" }, { fulfilmentStatus: "shipped", trackingCarrier: "UPS" })).toMatchObject({ ok: false });
    const r = plan({ fulfilmentStatus: "packed" }, { fulfilmentStatus: "shipped", trackingCarrier: " UPS ", trackingNumber: "1Z999" });
    expect(r.ok && r.data).toMatchObject({ fulfilmentStatus: "shipped", trackingCarrier: "UPS", trackingNumber: "1Z999" });
    expect(r.ok && r.data.shippedAt).toBeInstanceOf(Date);
  });

  it("stamps deliveredAt", () => {
    const r = plan({ fulfilmentStatus: "shipped" }, { fulfilmentStatus: "delivered" });
    expect(r.ok && r.data.deliveredAt).toBeInstanceOf(Date);
  });

  it("only a paid order can be packed or shipped; cancel and undo are exempt", () => {
    expect(plan({ status: "pending" }, { fulfilmentStatus: "packed" })).toMatchObject({ ok: false, status: 409 });
    expect(plan({ status: "pending" }, { fulfilmentStatus: "cancelled" }, "ADMIN").ok).toBe(true);
  });

  it("only an Admin can cancel", () => {
    expect(plan({}, { fulfilmentStatus: "cancelled" }, "MEMBER")).toMatchObject({ ok: false, status: 403 });
    expect(plan({}, { fulfilmentStatus: "cancelled" }, "ADMIN").ok).toBe(true);
  });

  it("tracking can only be edited on shipped or delivered orders", () => {
    expect(plan({}, { trackingNumber: "X" })).toMatchObject({ ok: false, status: 400 });
    expect(plan({ fulfilmentStatus: "shipped", trackingCarrier: "UPS", trackingNumber: "1" }, { trackingNumber: "2" }).ok).toBe(true);
  });

  it("validates inputs and reports a no-op as unchanged", () => {
    expect(plan({}, { fulfilmentStatus: "teleported" })).toMatchObject({ ok: false, status: 400 });
    expect(plan({}, { internalNote: "x".repeat(1001) })).toMatchObject({ ok: false, status: 400 });
    expect(plan({}, { fulfilmentStatus: "unfulfilled" })).toMatchObject({ ok: true, changed: false });
    expect(plan({}, { internalNote: "  call before delivery " })).toMatchObject({ ok: true, changed: true, data: { internalNote: "call before delivery" } });
  });
});

describe("shaping", () => {
  it("masks emails", () => {
    expect(maskEmail("jane.doe@example.com")).toBe("j***@example.com");
    expect(maskEmail("nope")).toBe("***");
  });

  it("a Viewer's order has no name, address, full email, Stripe ids or note", () => {
    const shaped = presentOrder(baseOrder({ internalNote: "secret note" }) as any, "VIEWER");
    const dump = JSON.stringify(shaped);
    for (const leak of ["Jane", "Doe", "High St", "jane.doe", "cs_test_1", "pi_test_1", "secret note", "00100", "Rome"]) {
      expect(dump).not.toContain(leak);
    }
    expect(shaped).toMatchObject({ redacted: true, email: "j***@example.com", total: 158 });
  });

  it("Admin and Member see the full order", () => {
    expect(presentOrder(baseOrder() as any, "MEMBER")).toMatchObject({ redacted: false, firstName: "Jane", address: "1 High St" });
  });

  it("CSV cells cannot run as spreadsheet formulas", () => {
    const row = exportRow(baseOrder({ firstName: "=HYPERLINK(1)", address: "+1 evil", city: "@x" }) as any);
    expect(row).toContain(`"'=HYPERLINK(1) Doe"`);
    expect(row).toContain(`"'+1 evil"`);
    expect(row).toContain(`"'@x"`);
    expect(row).toContain("1 x essence");
  });

  it("dashboard maths", () => {
    expect(shapeWindow(0, null)).toEqual({ orders: 0, revenue: 0, averageOrder: 0 });
    expect(shapeWindow(3, 100)).toEqual({ orders: 3, revenue: 100, averageOrder: 33.33 });
    expect(paymentsMode("sk_test_abc")).toBe("test");
    expect(paymentsMode("sk_live_abc")).toBe("live");
    expect(paymentsMode(undefined)).toBe("unknown");
  });
});

describe("GET /api/admin/orders", () => {
  const get = async (user: string | null, qs = "") =>
    ordersRoute.GET(req("GET", `/api/admin/orders${qs}`, { cookie: user ? await cookieFor(user) : undefined }));

  it("needs a signed-in user", async () => {
    expect((await get(null)).status).toBe(401);
  });

  it("gives Admin the customer, and a Viewer a redacted row", async () => {
    addUser("a", "ADMIN");
    addUser("v", "VIEWER");
    store.orders.push(baseOrder());
    const admin = (await (await get("a")).json()).orders[0];
    expect(admin).toMatchObject({ name: "Jane Doe", email: "jane.doe@example.com", itemCount: 1 });
    const viewer = (await (await get("v")).json()).orders[0];
    expect(viewer).toMatchObject({ name: null, email: "j***@example.com" });
    expect(JSON.stringify(viewer)).not.toContain("Doe");
  });

  it("a Viewer's search cannot probe emails, surnames or tracking numbers", async () => {
    addUser("a", "ADMIN");
    addUser("v", "VIEWER");
    await get("v", "?q=jane");
    const viewerClauses = JSON.stringify(store.lastWhere);
    expect(viewerClauses).not.toMatch(/email|lastName|trackingNumber/);
    await get("a", "?q=jane");
    expect(JSON.stringify(store.lastWhere)).toMatch(/email/);
  });

  it("applies the fulfilment and payment filters", async () => {
    addUser("a", "ADMIN");
    store.orders.push(baseOrder({ id: "o1" }), baseOrder({ id: "o2", fulfilmentStatus: "packed" }), baseOrder({ id: "o3", status: "pending" }));
    const packed = (await (await get("a", "?fulfilment=packed")).json()).orders;
    expect(packed.map((o: O) => o.id)).toEqual(["o2"]);
    const paid = (await (await get("a", "?payment=paid")).json()).orders;
    expect(paid.map((o: O) => o.id)).toEqual(["o1", "o2"]);
  });
});

describe("GET and PATCH /api/admin/orders/[id]", () => {
  const get = async (user: string | null, id: string) =>
    orderRoute.GET(req("GET", "/x", { cookie: user ? await cookieFor(user) : undefined }), ctx(id));
  const patch = async (user: string | null, id: string, body: unknown) =>
    orderRoute.PATCH(req("PATCH", "/x", { cookie: user ? await cookieFor(user) : undefined, body }), ctx(id));
  const ID = "ord_abcdefgh12345678";

  it("404s an unknown order and 401s the signed-out", async () => {
    addUser("a", "ADMIN");
    expect((await get(null, ID)).status).toBe(401);
    expect((await get("a", "nope")).status).toBe(404);
    expect((await patch("a", "nope", { internalNote: "x" })).status).toBe(404);
  });

  it("detail shows items with product names, and a Viewer gets no controls", async () => {
    addUser("m", "MEMBER");
    addUser("v", "VIEWER");
    store.orders.push(baseOrder());
    const m = await (await get("m", ID)).json();
    expect(m.order.items[0].productName).toBe("Product essence");
    expect(m.allowedNext).toEqual(["packed", "cancelled"]);
    const v = await (await get("v", ID)).json();
    expect(v.allowedNext).toEqual([]);
    expect(v.order.redacted).toBe(true);
  });

  it("a Viewer cannot change anything", async () => {
    addUser("v", "VIEWER");
    store.orders.push(baseOrder());
    expect((await patch("v", ID, { fulfilmentStatus: "packed" })).status).toBe(403);
    expect(store.orders[0].fulfilmentStatus).toBe("unfulfilled");
    expect(store.audit).toHaveLength(0);
  });

  it("a Member packs and ships an order; each step is audited with before and after", async () => {
    addUser("m", "MEMBER");
    store.orders.push(baseOrder());
    expect((await patch("m", ID, { fulfilmentStatus: "packed" })).status).toBe(200);
    const shipped = await patch("m", ID, { fulfilmentStatus: "shipped", trackingCarrier: "UPS", trackingNumber: "1Z999" });
    expect(shipped.status).toBe(200);
    expect(store.orders[0]).toMatchObject({ fulfilmentStatus: "shipped", trackingCarrier: "UPS", trackingNumber: "1Z999" });
    expect(store.audit.map((e) => e.action)).toEqual(["order.fulfilment_change", "order.fulfilment_change"]);
    expect(store.audit[1].before.fulfilmentStatus).toBe("packed");
    expect(store.audit[1].after).toMatchObject({ fulfilmentStatus: "shipped", trackingNumber: "1Z999" });
    expect(store.audit[1].summary).toContain("packed to shipped");
    expect(JSON.stringify(store.audit)).not.toContain("jane.doe");
  });

  it("refuses an illegal move and a Member's cancel, writing nothing", async () => {
    addUser("m", "MEMBER");
    addUser("a", "ADMIN");
    store.orders.push(baseOrder());
    expect((await patch("m", ID, { fulfilmentStatus: "delivered" })).status).toBe(409);
    expect((await patch("m", ID, { fulfilmentStatus: "cancelled" })).status).toBe(403);
    expect(store.audit).toHaveLength(0);
    expect((await patch("a", ID, { fulfilmentStatus: "cancelled" })).status).toBe(200);
    expect(store.orders[0].fulfilmentStatus).toBe("cancelled");
  });

  it("returns 409 and writes no audit entry when someone else moved the order first", async () => {
    addUser("m", "MEMBER");
    store.orders.push(baseOrder());
    store.staleOnce = true;
    const res = await patch("m", ID, { fulfilmentStatus: "packed" });
    expect(res.status).toBe(409);
    expect(store.orders[0].fulfilmentStatus).toBe("unfulfilled");
    expect(store.audit).toHaveLength(0);
  });

  it("saves a note without changing fulfilment, and reports a no-op", async () => {
    addUser("m", "MEMBER");
    store.orders.push(baseOrder());
    expect((await patch("m", ID, { internalNote: "gift wrap" })).status).toBe(200);
    expect(store.orders[0].internalNote).toBe("gift wrap");
    expect(store.audit[0].action).toBe("order.update");
    const again = await (await patch("m", ID, { fulfilmentStatus: "unfulfilled" })).json();
    expect(again.unchanged).toBe(true);
    expect(store.audit).toHaveLength(1);
  });

  it("cannot pack an unpaid order", async () => {
    addUser("m", "MEMBER");
    store.orders.push(baseOrder({ status: "pending" }));
    expect((await patch("m", ID, { fulfilmentStatus: "packed" })).status).toBe(409);
  });
});

describe("GET /api/admin/orders/export", () => {
  const exp = async (user: string | null, qs = "") =>
    exportRoute.GET(req("GET", `/api/admin/orders/export${qs}`, { cookie: user ? await cookieFor(user) : undefined }));

  it("is Admin and Member only", async () => {
    addUser("v", "VIEWER");
    addUser("m", "MEMBER");
    expect((await exp(null)).status).toBe(401);
    expect((await exp("v")).status).toBe(403);
    expect((await exp("m")).status).toBe(200);
  });

  it("exports paid orders still to ship, and records the export in the audit log", async () => {
    addUser("a", "ADMIN");
    store.orders.push(
      baseOrder({ id: "o1" }),
      baseOrder({ id: "o2", fulfilmentStatus: "shipped" }),
      baseOrder({ id: "o3", status: "pending" }),
      baseOrder({ id: "o4", fulfilmentStatus: "packed" })
    );
    const res = await exp("a");
    const text = await res.text();
    expect(res.headers.get("content-type")).toContain("text/csv");
    expect(res.headers.get("cache-control")).toBe("no-store");
    const ids = text.trim().split("\r\n").slice(1).map((l) => l.split(",")[0]);
    expect(ids).toEqual(['"o1"', '"o4"']);
    expect(store.audit[0]).toMatchObject({ action: "orders.export", after: { count: 2 } });
  });

  it("returns no file when the audit entry cannot be written", async () => {
    addUser("a", "ADMIN");
    store.orders.push(baseOrder());
    const db = (await import("@/lib/db")).db as any;
    const original = db.auditLog.create;
    db.auditLog.create = async () => {
      throw new Error("audit down");
    };
    const res = await exp("a");
    db.auditLog.create = original;
    expect(res.status).toBe(503);
    expect(await res.text()).not.toContain("jane.doe");
  });
});

describe("GET /api/admin/dashboard", () => {
  it.each(["ADMIN", "MEMBER", "VIEWER"] as const)("is readable by a %s", async (role) => {
    addUser("u", role);
    const res = await dashRoute.GET(req("GET", "/x", { cookie: await cookieFor("u") }));
    expect(res.status).toBe(200);
  });

  it("needs a signed-in user", async () => {
    expect((await dashRoute.GET(req("GET", "/x"))).status).toBe(401);
  });
});
