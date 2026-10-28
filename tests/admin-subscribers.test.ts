import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

process.env.ADMIN_SESSION_SECRET = "unit-test-secret-unit-test-secret";

type U = { id: string; email: string; role: "ADMIN" | "MEMBER" | "VIEWER"; passwordHash: string };
type S = { id: string; userId: string; expiresAt: Date };
type Sub = {
  id: string;
  email: string;
  source: string;
  consentAt: Date;
  consentTextVersion: string;
  createdAt: Date;
  unsubscribedAt: Date | null;
};
const store = {
  users: [] as U[],
  sessions: [] as S[],
  audit: [] as Record<string, any>[],
  subs: [] as Sub[],
  nextId: 1,
  lastWhere: undefined as any,
  raceOnce: false,
  failAudit: false,
};

vi.mock("@/lib/rate-limit", () => ({ isRateLimited: () => false, clientIp: () => "9.9.9.9" }));
vi.mock("@/lib/db", () => {
  const match = (s: Sub, w: any = {}) =>
    (w.unsubscribedAt === undefined || (w.unsubscribedAt === null ? s.unsubscribedAt === null : s.unsubscribedAt !== null)) &&
    (!w.source || s.source === w.source) &&
    (!w.email || s.email.includes(w.email.contains));
  const db: any = {
    $transaction: async (arg: any) => (Array.isArray(arg) ? Promise.all(arg) : arg(db)),
    auditLog: {
      create: async ({ data }: any) => {
        if (store.failAudit) throw new Error("audit down");
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
    emailSubscriber: {
      findMany: async (args: any) => {
        store.lastWhere = args.where;
        return store.subs
          .filter((s) => match(s, args.where))
          .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime() || 0)
          .slice(0, args.take)
          .map((s) => ({ ...s }));
      },
      count: async (args?: any) => store.subs.filter((s) => match(s, args?.where)).length,
      groupBy: async () => {
        const m = new Map<string, number>();
        for (const s of store.subs) m.set(s.source, (m.get(s.source) ?? 0) + 1);
        return [...m].map(([source, n]) => ({ source, _count: { _all: n } }));
      },
      findUnique: async ({ where }: any) => {
        const s = store.subs.find((x) => x.id === where.id);
        return s ? { ...s } : null;
      },
      updateMany: async ({ where, data }: any) => {
        const s = store.subs.find((x) => x.id === where.id && x.unsubscribedAt === null);
        if (!s || store.raceOnce) {
          store.raceOnce = false;
          return { count: 0 };
        }
        Object.assign(s, data);
        return { count: 1 };
      },
    },
  };
  return { db };
});

const auth = await import("@/lib/auth");
const listRoute = await import("@/app/api/admin/subscribers/list/route");
const idRoute = await import("@/app/api/admin/subscribers/[id]/route");
const csvRoute = await import("@/app/api/admin/subscribers/route");
const { presentSubscriber } = await import("@/lib/admin-subscribers");

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

const sub = (over: Partial<Sub> = {}): Sub => ({
  id: "sub1",
  email: "jane.doe@example.com",
  source: "footer",
  consentAt: new Date("2026-10-01T10:00:00Z"),
  consentTextVersion: "v1",
  createdAt: new Date("2026-10-01T10:00:00Z"),
  unsubscribedAt: null,
  ...over,
});

beforeEach(() => {
  store.users = [];
  store.sessions = [];
  store.audit = [];
  store.subs = [];
  store.nextId = 1;
  store.lastWhere = undefined;
  store.raceOnce = false;
  store.failAudit = false;
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("presentSubscriber", () => {
  it("a Viewer sees a masked email and no consent detail", () => {
    const v = presentSubscriber(sub(), "VIEWER");
    expect(v).toMatchObject({ email: "j***@example.com", status: "active", redacted: true });
    const dump = JSON.stringify(v);
    expect(dump).not.toContain("jane.doe");
    expect(dump).not.toContain("consentTextVersion");
  });

  it("Admin and Member see the full record with consent", () => {
    expect(presentSubscriber(sub(), "MEMBER")).toMatchObject({
      email: "jane.doe@example.com",
      consentTextVersion: "v1",
      redacted: false,
    });
  });

  it("reports unsubscribed status", () => {
    expect(presentSubscriber(sub({ unsubscribedAt: new Date() }), "ADMIN").status).toBe("unsubscribed");
  });
});

describe("GET /api/admin/subscribers/list", () => {
  const get = async (user: string | null, qs = "") =>
    listRoute.GET(req("GET", `/api/admin/subscribers/list${qs}`, { cookie: user ? await cookieFor(user) : undefined }));

  it("needs a signed-in user", async () => {
    expect((await get(null)).status).toBe(401);
  });

  it("gives Admin and Member full rows and a Viewer masked rows", async () => {
    addUser("a", "ADMIN");
    addUser("m", "MEMBER");
    addUser("v", "VIEWER");
    store.subs.push(sub());
    for (const u of ["a", "m"]) {
      expect((await (await get(u)).json()).subscribers[0].email).toBe("jane.doe@example.com");
    }
    const viewer = await (await get("v")).json();
    expect(viewer.subscribers[0].email).toBe("j***@example.com");
    expect(JSON.stringify(viewer)).not.toContain("jane.doe");
  });

  it("a Viewer's search cannot probe emails, an Admin's can", async () => {
    addUser("a", "ADMIN");
    addUser("v", "VIEWER");
    store.subs.push(sub());
    const v = await (await get("v", "?q=jane")).json();
    expect(JSON.stringify(store.lastWhere)).not.toMatch(/email/);
    expect(v.subscribers).toHaveLength(1);
    const a = await (await get("a", "?q=nobody")).json();
    expect(JSON.stringify(store.lastWhere)).toMatch(/email/);
    expect(a.subscribers).toHaveLength(0);
  });

  it("filters by status and source, and counts are overall", async () => {
    addUser("a", "ADMIN");
    store.subs.push(
      sub({ id: "s1", email: "a@x.com" }),
      sub({ id: "s2", email: "b@x.com", source: "popup", unsubscribedAt: new Date() }),
      sub({ id: "s3", email: "c@x.com", source: "popup" })
    );
    const active = await (await get("a", "?status=active")).json();
    expect(active.subscribers.map((s: any) => s.id)).toEqual(["s1", "s3"]);
    const gone = await (await get("a", "?status=unsubscribed")).json();
    expect(gone.subscribers.map((s: any) => s.id)).toEqual(["s2"]);
    const popup = await (await get("a", "?source=popup")).json();
    expect(popup.subscribers.map((s: any) => s.id)).toEqual(["s2", "s3"]);
    expect(popup.counts).toMatchObject({ total: 3, active: 2, unsubscribed: 1 });
    expect(popup.counts.bySource).toEqual(
      expect.arrayContaining([
        { source: "footer", count: 1 },
        { source: "popup", count: 2 },
      ])
    );
  });

  it("pages with a cursor when there are more rows than take", async () => {
    addUser("a", "ADMIN");
    for (let i = 0; i < 3; i++) store.subs.push(sub({ id: `s${i}`, email: `${i}@x.com` }));
    const res = await (await get("a", "?take=2")).json();
    expect(res.subscribers).toHaveLength(2);
    expect(res.nextCursor).toBe("s1");
  });
});

describe("PATCH /api/admin/subscribers/[id]", () => {
  const patch = async (user: string | null, id: string, body: unknown) =>
    idRoute.PATCH(req("PATCH", "/x", { cookie: user ? await cookieFor(user) : undefined, body }), ctx(id));

  it("needs sign-in and is closed to a Viewer", async () => {
    addUser("v", "VIEWER");
    store.subs.push(sub());
    expect((await patch(null, "sub1", { action: "unsubscribe" })).status).toBe(401);
    expect((await patch("v", "sub1", { action: "unsubscribe" })).status).toBe(403);
    expect(store.subs[0].unsubscribedAt).toBeNull();
    expect(store.audit).toHaveLength(0);
  });

  it.each(["ADMIN", "MEMBER"] as const)("%s unsubscribes someone, audited with a masked email", async (role) => {
    addUser("u", role);
    store.subs.push(sub());
    const res = await patch("u", "sub1", { action: "unsubscribe" });
    expect(res.status).toBe(200);
    expect((await res.json()).subscriber.status).toBe("unsubscribed");
    expect(store.subs[0].unsubscribedAt).toBeInstanceOf(Date);
    expect(store.audit).toHaveLength(1);
    expect(store.audit[0]).toMatchObject({ action: "subscriber.unsubscribe", entityId: "sub1", actorEmail: "u@x.com" });
    expect(JSON.stringify(store.audit)).not.toContain("jane.doe");
    expect(store.audit[0].summary).toContain("j***@example.com");
  });

  it("is idempotent: a repeat keeps the original date and writes no audit entry", async () => {
    addUser("a", "ADMIN");
    const original = new Date("2026-09-01T00:00:00Z");
    store.subs.push(sub({ unsubscribedAt: original }));
    const res = await patch("a", "sub1", { action: "unsubscribe" });
    expect(res.status).toBe(200);
    expect((await res.json()).unchanged).toBe(true);
    expect(store.subs[0].unsubscribedAt).toBe(original);
    expect(store.audit).toHaveLength(0);
  });

  it("treats losing a race as unchanged, with no audit entry", async () => {
    addUser("a", "ADMIN");
    store.subs.push(sub());
    store.raceOnce = true;
    const res = await patch("a", "sub1", { action: "unsubscribe" });
    expect(res.status).toBe(200);
    expect(store.audit).toHaveLength(0);
  });

  it("has no resubscribe: any other action is rejected and changes nothing", async () => {
    addUser("a", "ADMIN");
    const at = new Date("2026-09-01T00:00:00Z");
    store.subs.push(sub({ unsubscribedAt: at }));
    for (const body of [{ action: "resubscribe" }, { action: "subscribe" }, { unsubscribedAt: null }, {}]) {
      expect((await patch("a", "sub1", body)).status).toBe(400);
    }
    expect(store.subs[0].unsubscribedAt).toBe(at);
    expect(store.audit).toHaveLength(0);
  });

  it("404s an unknown subscriber", async () => {
    addUser("a", "ADMIN");
    expect((await patch("a", "nope", { action: "unsubscribe" })).status).toBe(404);
  });

  it("does not unsubscribe when the audit entry cannot be written", async () => {
    addUser("a", "ADMIN");
    store.subs.push(sub());
    store.failAudit = true;
    // The mock transaction is not atomic, so assert the route reports failure
    // rather than success; real atomicity is covered by the real-database run.
    expect((await patch("a", "sub1", { action: "unsubscribe" })).status).toBe(503);
  });
});

describe("GET /api/admin/subscribers (CSV export)", () => {
  const exp = async (user: string | null) =>
    csvRoute.GET(req("GET", "/api/admin/subscribers", { cookie: user ? await cookieFor(user) : undefined }));

  it("stays Admin only", async () => {
    addUser("m", "MEMBER");
    addUser("v", "VIEWER");
    expect((await exp(null)).status).toBe(401);
    expect((await exp("m")).status).toBe(403);
    expect((await exp("v")).status).toBe(403);
    expect(store.audit).toHaveLength(0);
  });

  it("returns the CSV and records the export in the audit log", async () => {
    addUser("a", "ADMIN");
    store.subs.push(sub({ id: "s1" }), sub({ id: "s2", email: "=evil@x.com", unsubscribedAt: new Date("2026-10-05T00:00:00Z") }));
    const res = await exp("a");
    const text = await res.text();
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("text/csv");
    expect(res.headers.get("cache-control")).toBe("no-store");
    expect(text).toContain('"\'=evil@x.com"');
    expect(text.trim().split("\n")).toHaveLength(3);
    expect(store.audit[0]).toMatchObject({ action: "subscribers.export", after: { count: 2 } });
  });

  it("returns no file when the audit entry cannot be written", async () => {
    addUser("a", "ADMIN");
    store.subs.push(sub());
    store.failAudit = true;
    const res = await exp("a");
    expect(res.status).toBe(503);
    expect(await res.text()).not.toContain("jane.doe");
  });
});
