import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

process.env.ADMIN_SESSION_SECRET = "unit-test-secret-unit-test-secret";

type U = { id: string; email: string; role: "ADMIN" | "MEMBER" | "VIEWER"; passwordHash: string };
type S = { id: string; userId: string; expiresAt: Date };
const store = {
  users: [] as U[],
  sessions: [] as S[],
  audit: [] as Record<string, any>[],
  rows: [] as Record<string, any>[],
  orders: [] as Record<string, any>[],
  lastQuery: undefined as any,
  nextId: 1,
};

vi.mock("@/lib/rate-limit", () => ({ isRateLimited: () => false, clientIp: () => "9.9.9.9" }));
vi.mock("@/lib/db", () => {
  const db: any = {
    $transaction: async (arg: any) => (Array.isArray(arg) ? Promise.all(arg) : arg(db)),
    $queryRaw: async (q: any) => {
      store.lastQuery = q;
      const take = q.values[q.values.length - 2];
      const offset = q.values[q.values.length - 1];
      return store.rows.slice(offset, offset + take);
    },
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
    order: {
      findMany: async (args: any) => {
        store.lastQuery = args;
        const want = args.where.email.equals;
        return store.orders
          .filter((o) => o.email.toLowerCase() === want)
          .map((o) => ({ ...o, _count: { items: 1 } }));
      },
    },
  };
  return { db };
});

const auth = await import("@/lib/auth");
const listRoute = await import("@/app/api/admin/customers/route");
const ordersRoute = await import("@/app/api/admin/customers/orders/route");
const exportRoute = await import("@/app/api/admin/customers/export/route");
const { customerCsvRow, presentCustomer, parseSort, clampInt } = await import("@/lib/admin-customers");

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

const cust = (over: Record<string, any> = {}) => ({
  email: "jane.doe@example.com",
  orders: 2,
  ltv: 300,
  firstOrder: new Date("2026-09-01T00:00:00Z"),
  lastOrder: new Date("2026-10-01T00:00:00Z"),
  country: "US",
  subscribed: true,
  hasPlan: false,
  ...over,
});

beforeEach(() => {
  store.users = [];
  store.sessions = [];
  store.audit = [];
  store.rows = [];
  store.orders = [];
  store.lastQuery = undefined;
  store.nextId = 1;
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("helpers", () => {
  it("clamps paging inputs and falls back on junk", () => {
    expect(clampInt("500", 50, 1, 100)).toBe(100);
    expect(clampInt("-3", 0, 0, 10000)).toBe(0);
    expect(clampInt("abc", 50, 1, 100)).toBe(50);
    expect(clampInt(null, 50, 1, 100)).toBe(50);
    expect(clampInt("99999999", 0, 0, 10000)).toBe(10000);
    expect(parseSort("ltv")).toBe("ltv");
    expect(parseSort("drop table")).toBe("last");
  });

  it("masks a Viewer's customer and keeps the figures", () => {
    const v = presentCustomer(cust(), "VIEWER");
    expect(v).toMatchObject({ email: "j***@example.com", ltv: 300, redacted: true });
    expect(JSON.stringify(v)).not.toContain("jane.doe");
    expect(presentCustomer(cust(), "MEMBER")).toMatchObject({ email: "jane.doe@example.com", redacted: false });
  });

  it("CSV cells cannot run as spreadsheet formulas", () => {
    const row = customerCsvRow(cust({ email: "=HYPERLINK(1)@evil.test" }) as any);
    expect(row.startsWith(`"'=HYPERLINK(1)@evil.test"`)).toBe(true);
    expect(row).toContain(`"yes"`);
  });
});

describe("GET /api/admin/customers", () => {
  const get = async (user: string | null, qs = "") =>
    listRoute.GET(req("GET", `/api/admin/customers${qs}`, { cookie: user ? await cookieFor(user) : undefined }));

  it("needs a signed-in user", async () => {
    expect((await get(null)).status).toBe(401);
  });

  it("gives Admin and Member the email, and a Viewer a masked one", async () => {
    addUser("a", "ADMIN");
    addUser("m", "MEMBER");
    addUser("v", "VIEWER");
    store.rows.push(cust());
    expect((await (await get("a")).json()).customers[0].email).toBe("jane.doe@example.com");
    expect((await (await get("m")).json()).customers[0].email).toBe("jane.doe@example.com");
    const viewer = await (await get("v")).json();
    expect(viewer.customers[0].email).toBe("j***@example.com");
    expect(JSON.stringify(viewer)).not.toContain("jane.doe");
  });

  it("a Viewer cannot search, so the box cannot probe emails", async () => {
    addUser("a", "ADMIN");
    addUser("v", "VIEWER");
    await get("v", "?q=jane");
    expect(JSON.stringify(store.lastQuery.values)).not.toContain("jane");
    expect(store.lastQuery.sql).not.toContain("HAVING");
    await get("a", "?q=Jane");
    expect(store.lastQuery.values).toContain("jane");
    expect(store.lastQuery.sql).toContain("HAVING");
  });

  it("passes the search as a bound value, never inside the SQL text", async () => {
    addUser("a", "ADMIN");
    const evil = "x'); DROP TABLE \"Order\"; --";
    await get("a", `?q=${encodeURIComponent(evil)}`);
    expect(store.lastQuery.sql).not.toContain("DROP TABLE");
    expect(store.lastQuery.values).toContain(evil.toLowerCase());
  });

  it("caps take and offset, and only sorts by a whitelisted column", async () => {
    addUser("a", "ADMIN");
    await get("a", "?take=9999&offset=99999999&sort=ltv;drop");
    const v = store.lastQuery.values;
    expect(v[v.length - 2]).toBe(101); // take 100 + 1 to detect more
    expect(v[v.length - 1]).toBe(10000);
    expect(store.lastQuery.sql).toContain("ORDER BY \"lastOrder\" DESC");
    await get("a", "?sort=ltv");
    expect(store.lastQuery.sql).toContain("ORDER BY ltv DESC");
  });

  it("pages with nextOffset only when there is more", async () => {
    addUser("a", "ADMIN");
    for (let i = 0; i < 5; i++) store.rows.push(cust({ email: `c${i}@example.com` }));
    const first = await (await get("a", "?take=2")).json();
    expect(first.customers).toHaveLength(2);
    expect(first.nextOffset).toBe(2);
    const last = await (await get("a", "?take=2&offset=4")).json();
    expect(last.customers).toHaveLength(1);
    expect(last.nextOffset).toBeNull();
  });
});

describe("POST /api/admin/customers/orders", () => {
  const post = async (user: string | null, body: unknown) =>
    ordersRoute.POST(req("POST", "/api/admin/customers/orders", { cookie: user ? await cookieFor(user) : undefined, body }));

  it("is Admin and Member only", async () => {
    addUser("a", "ADMIN");
    addUser("m", "MEMBER");
    addUser("v", "VIEWER");
    expect((await post(null, { email: "a@b.co" })).status).toBe(401);
    expect((await post("v", { email: "a@b.co" })).status).toBe(403);
    expect((await post("a", { email: "a@b.co" })).status).toBe(200);
    expect((await post("m", { email: "a@b.co" })).status).toBe(200);
  });

  it("validates the email and matches it case-insensitively", async () => {
    addUser("a", "ADMIN");
    expect((await post("a", {})).status).toBe(400);
    expect((await post("a", { email: "not an email" })).status).toBe(400);
    expect((await post("a", { email: `${"a".repeat(250)}@b.co` })).status).toBe(400);
    store.orders.push({ id: "o1", email: "Jane.Doe@Example.com", createdAt: new Date(), total: 100, status: "paid", fulfilmentStatus: "unfulfilled", country: "US" });
    store.orders.push({ id: "o2", email: "other@example.com", createdAt: new Date(), total: 5, status: "paid", fulfilmentStatus: "unfulfilled", country: "US" });
    const res = await (await post("a", { email: " JANE.doe@example.COM " })).json();
    expect(res.orders.map((o: any) => o.id)).toEqual(["o1"]);
    expect(res.orders[0]).toMatchObject({ itemCount: 1 });
  });
});

describe("GET /api/admin/customers/export", () => {
  const exp = async (user: string | null) =>
    exportRoute.GET(req("GET", "/api/admin/customers/export", { cookie: user ? await cookieFor(user) : undefined }));

  it("is Admin and Member only", async () => {
    addUser("v", "VIEWER");
    addUser("m", "MEMBER");
    expect((await exp(null)).status).toBe(401);
    expect((await exp("v")).status).toBe(403);
    expect(store.audit).toHaveLength(0);
    expect((await exp("m")).status).toBe(200);
  });

  it("returns the CSV with safe headers and records the export, without the emails", async () => {
    addUser("a", "ADMIN");
    store.rows.push(cust(), cust({ email: "two@example.com", ltv: 10 }));
    const res = await exp("a");
    const text = await res.text();
    expect(res.headers.get("content-type")).toContain("text/csv");
    expect(res.headers.get("cache-control")).toBe("no-store");
    expect(text.trim().split("\r\n")).toHaveLength(3);
    expect(store.audit[0]).toMatchObject({ action: "customers.export", entityType: "Customer", after: { count: 2 } });
    expect(JSON.stringify(store.audit)).not.toContain("example.com");
  });

  it("returns no file when the audit entry cannot be written", async () => {
    addUser("a", "ADMIN");
    store.rows.push(cust());
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
