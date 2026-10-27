import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest, NextResponse } from "next/server";
import { readdirSync, readFileSync, statSync } from "fs";
import path from "path";
import bcrypt from "bcryptjs";

process.env.ADMIN_SESSION_SECRET = "unit-test-secret-unit-test-secret";

type U = { id: string; email: string; role: "ADMIN" | "MEMBER" | "VIEWER"; passwordHash: string; createdAt: Date };
type S = { id: string; userId: string; expiresAt: Date };
type A = Record<string, unknown> & { id: string; createdAt: Date; action: string; actorEmail: string };
const store = { users: [] as U[], sessions: [] as S[], audit: [] as A[], nextId: 1, limited: false, failAudit: false };

const pick = (u: U, select?: Record<string, boolean>) =>
  select ? Object.fromEntries(Object.keys(select).map((k) => [k, (u as Record<string, unknown>)[k]])) : u;

vi.mock("@/lib/rate-limit", () => ({ isRateLimited: () => store.limited, clientIp: () => "9.9.9.9" }));
vi.mock("@/lib/db", () => ({
  db: {
    // Array form runs the already-created operations together; callback form gets the same client.
    $transaction: async (arg: unknown) =>
      Array.isArray(arg) ? Promise.all(arg) : (arg as (tx: unknown) => unknown)((await import("@/lib/db")).db),
    auditLog: {
      create: async ({ data }: { data: Record<string, unknown> }) => {
        if (store.failAudit) throw new Error("audit down");
        const e = { id: `audit_${store.nextId}`, createdAt: new Date(Date.UTC(2026, 0, 1) + store.nextId++ * 1000), ...data } as A;
        store.audit.push(e);
        return e;
      },
      findMany: async ({ where, take, cursor, skip }: { where: { action?: { startsWith: string }; actorEmail?: { contains: string } }; take: number; cursor?: { id: string }; skip?: number }) => {
        let rows = store.audit
          .filter((e) => !where.action || e.action.startsWith(where.action.startsWith))
          .filter((e) => !where.actorEmail || e.actorEmail.toLowerCase().includes(where.actorEmail.contains.toLowerCase()))
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        if (cursor) rows = rows.slice(rows.findIndex((e) => e.id === cursor.id) + (skip ?? 0));
        return rows.slice(0, take);
      },
    },
    session: {
      create: async ({ data }: { data: Omit<S, "id"> }) => {
        const s = { id: `sess_${store.nextId++}`, ...data };
        store.sessions.push(s);
        return s;
      },
      findUnique: async ({ where }: { where: { id: string } }) => {
        const s = store.sessions.find((x) => x.id === where.id);
        return s ? { ...s, user: store.users.find((u) => u.id === s.userId)! } : null;
      },
      deleteMany: async ({ where }: { where: { userId: string; id?: { not: string } } }) => {
        const before = store.sessions.length;
        store.sessions = store.sessions.filter(
          (s) => !(s.userId === where.userId && (!where.id || s.id !== where.id.not))
        );
        return { count: before - store.sessions.length };
      },
      delete: async ({ where }: { where: { id: string } }) => {
        const before = store.sessions.length;
        store.sessions = store.sessions.filter((s) => s.id !== where.id);
        if (store.sessions.length === before) throw new Error("not found");
      },
    },
    user: {
      // A copy, like Prisma returns: a later update must not rewrite an already-fetched row.
      findUnique: async ({ where }: { where: { id?: string; email?: string } }) => {
        const u = store.users.find((x) => (where.id ? x.id === where.id : x.email === where.email));
        return u ? { ...u } : null;
      },
      findMany: async ({ select }: { select?: Record<string, boolean> }) => store.users.map((u) => pick(u, select)),
      count: async ({ where }: { where: { role: string; id: { not: string } } }) =>
        store.users.filter((u) => u.role === where.role && u.id !== where.id.not).length,
      create: async ({ data, select }: { data: Omit<U, "id" | "createdAt">; select?: Record<string, boolean> }) => {
        const u = { id: `user_${store.nextId++}`, createdAt: new Date(), ...data };
        store.users.push(u);
        return pick(u, select);
      },
      update: async ({ where, data, select }: { where: { id: string }; data: Partial<U>; select?: Record<string, boolean> }) => {
        const u = store.users.find((x) => x.id === where.id)!;
        Object.assign(u, data);
        return pick(u, select);
      },
      delete: async ({ where }: { where: { id: string } }) => {
        store.users = store.users.filter((u) => u.id !== where.id);
      },
    },
  },
}));

const auth = await import("@/lib/auth");
const usersRoute = await import("@/app/api/admin/users/route");
const userIdRoute = await import("@/app/api/admin/users/[id]/route");
const loginRoute = await import("@/app/api/admin/auth/login/route");
const passwordRoute = await import("@/app/api/admin/auth/password/route");
const logoutRoute = await import("@/app/api/admin/auth/logout/route");
const meRoute = await import("@/app/api/admin/me/route");
const auditRoute = await import("@/app/api/admin/audit/route");
const sessionsRoute = await import("@/app/api/admin/users/[id]/sessions/route");
const resetRoute = await import("@/app/api/admin/users/[id]/password/route");

const hash = bcrypt.hashSync("correct-horse-battery", 4);
function addUser(id: string, role: U["role"], email = `${id}@x.com`) {
  store.users.push({ id, email, role, passwordHash: hash, createdAt: new Date() });
}
async function cookieFor(userId: string) {
  return auth.createSession(userId);
}
const req = (method: string, url: string, opts: { cookie?: string; body?: unknown } = {}) =>
  new NextRequest(`http://localhost${url}`, {
    method,
    body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
    headers: opts.cookie ? { cookie: `chiarel_admin_session=${opts.cookie}` } : {},
  });
const ctx = (id: string) => ({ params: Promise.resolve({ id }) });

beforeEach(() => {
  store.users = [];
  store.sessions = [];
  store.audit = [];
  store.nextId = 1;
  store.limited = false;
  store.failAudit = false;
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("withRole", () => {
  const handler = vi.fn(async () => NextResponse.json({ ok: true }));
  const guarded = auth.withRole(["ADMIN"], handler);
  beforeEach(() => handler.mockClear());

  it("returns 401 with no cookie and never runs the handler", async () => {
    expect((await guarded(req("GET", "/x"))).status).toBe(401);
    expect(handler).not.toHaveBeenCalled();
  });

  it("returns 401 for a forged or malformed cookie", async () => {
    addUser("a", "ADMIN");
    const good = await cookieFor("a");
    const [id] = good.split(".");
    for (const bad of ["garbage", `${id}.AAAA`, `${id}.`, `.${good.split(".")[1]}`, `other_id.${good.split(".")[1]}`]) {
      expect((await guarded(req("GET", "/x", { cookie: bad }))).status).toBe(401);
    }
    expect(handler).not.toHaveBeenCalled();
  });

  it("returns 401 for a correctly signed id with no session row", async () => {
    addUser("a", "ADMIN");
    const cookie = await cookieFor("a");
    store.sessions = [];
    expect((await guarded(req("GET", "/x", { cookie }))).status).toBe(401);
  });

  it("returns 401 and deletes an expired session", async () => {
    addUser("a", "ADMIN");
    const cookie = await cookieFor("a");
    store.sessions[0].expiresAt = new Date(Date.now() - 1000);
    expect((await guarded(req("GET", "/x", { cookie }))).status).toBe(401);
    expect(store.sessions).toHaveLength(0);
  });

  it("returns 403 for a role that is not allowed", async () => {
    addUser("m", "MEMBER");
    const res = await guarded(req("GET", "/x", { cookie: await cookieFor("m") }));
    expect(res.status).toBe(403);
    expect(handler).not.toHaveBeenCalled();
  });

  it("runs the handler for an allowed role and passes the user", async () => {
    addUser("a", "ADMIN");
    const res = await guarded(req("GET", "/x", { cookie: await cookieFor("a") }));
    expect(res.status).toBe(200);
    expect((handler.mock.calls[0] as unknown as [unknown, U])[1].id).toBe("a");
  });

  it("takes effect immediately when a role changes", async () => {
    addUser("a", "ADMIN");
    const cookie = await cookieFor("a");
    store.users[0].role = "VIEWER";
    expect((await guarded(req("GET", "/x", { cookie }))).status).toBe(403);
  });

  it("sets a hardened session cookie", () => {
    const res = NextResponse.json({});
    auth.setSessionCookie(res, "v");
    const c = res.cookies.get("chiarel_admin_session")!;
    expect(c).toMatchObject({ httpOnly: true, sameSite: "lax", path: "/" });
    expect(c.maxAge).toBe(12 * 60 * 60);
  });
});

describe("admin users API", () => {
  it("lists users for an ADMIN without exposing password hashes", async () => {
    addUser("a", "ADMIN");
    const res = await usersRoute.GET(req("GET", "/api/admin/users", { cookie: await cookieFor("a") }));
    expect(res.status).toBe(200);
    const { users } = await res.json();
    expect(users).toHaveLength(1);
    expect(users[0].passwordHash).toBeUndefined();
  });

  it.each(["MEMBER", "VIEWER"] as const)("blocks %s from every users route", async (role) => {
    addUser("a", "ADMIN");
    addUser("t", role);
    const cookie = await cookieFor("t");
    const body = { email: "n@x.com", password: "long-enough-password", role: "ADMIN" };
    expect((await usersRoute.GET(req("GET", "/u", { cookie }))).status).toBe(403);
    expect((await usersRoute.POST(req("POST", "/u", { cookie, body }))).status).toBe(403);
    expect((await userIdRoute.PATCH(req("PATCH", "/u/a", { cookie, body: { role: "VIEWER" } }), ctx("a"))).status).toBe(403);
    expect((await userIdRoute.DELETE(req("DELETE", "/u/a", { cookie }), ctx("a"))).status).toBe(403);
    expect(store.users.find((u) => u.id === "a")!.role).toBe("ADMIN");
    expect(store.users).toHaveLength(2);
  });

  it("blocks unauthenticated callers", async () => {
    expect((await usersRoute.GET(req("GET", "/u"))).status).toBe(401);
    expect((await usersRoute.POST(req("POST", "/u", { body: {} }))).status).toBe(401);
  });

  describe("creating users", () => {
    let cookie: string;
    beforeEach(async () => {
      addUser("a", "ADMIN");
      cookie = await cookieFor("a");
    });
    const create = (body: unknown) => usersRoute.POST(req("POST", "/u", { cookie, body }));

    it("rejects missing fields, a bad role, and a short password", async () => {
      expect((await create({ email: "", password: "x" })).status).toBe(400);
      expect((await create({ email: "n@x.com", password: "long-enough-password", role: "OWNER" })).status).toBe(400);
      expect((await create({ email: "n@x.com", password: "short", role: "MEMBER" })).status).toBe(400);
    });

    it("rejects a duplicate email", async () => {
      expect((await create({ email: "A@X.com", password: "long-enough-password", role: "MEMBER" })).status).toBe(409);
    });

    it("creates a user with a bcrypt hash and never returns it", async () => {
      const res = await create({ email: " New@X.com ", password: "long-enough-password", role: "MEMBER" });
      expect(res.status).toBe(201);
      const { user } = await res.json();
      expect(user).toMatchObject({ email: "new@x.com", role: "MEMBER" });
      expect(user.passwordHash).toBeUndefined();
      const stored = store.users.find((u) => u.email === "new@x.com")!;
      expect(stored.passwordHash).toMatch(/^\$2[aby]\$12\$/);
      expect(await bcrypt.compare("long-enough-password", stored.passwordHash)).toBe(true);
    });
  });

  describe("changing and deleting users", () => {
    let cookie: string;
    beforeEach(async () => {
      addUser("a", "ADMIN");
      addUser("b", "MEMBER");
      cookie = await cookieFor("a");
    });
    const patch = (id: string, body: unknown) => userIdRoute.PATCH(req("PATCH", `/u/${id}`, { cookie, body }), ctx(id));
    const del = (id: string) => userIdRoute.DELETE(req("DELETE", `/u/${id}`, { cookie }), ctx(id));

    it("changes another user's role", async () => {
      expect((await patch("b", { role: "VIEWER" })).status).toBe(200);
      expect(store.users.find((u) => u.id === "b")!.role).toBe("VIEWER");
    });

    it("rejects an invalid role and an unknown user", async () => {
      expect((await patch("b", { role: "ROOT" })).status).toBe(400);
      expect((await patch("nobody", { role: "VIEWER" })).status).toBe(404);
    });

    it("stops the last Admin demoting themselves", async () => {
      const res = await patch("a", { role: "MEMBER" });
      expect(res.status).toBe(400);
      expect(store.users.find((u) => u.id === "a")!.role).toBe("ADMIN");
    });

    it("lets an Admin demote themselves when another Admin exists", async () => {
      addUser("c", "ADMIN");
      expect((await patch("a", { role: "MEMBER" })).status).toBe(200);
    });

    it("cannot delete your own account", async () => {
      expect((await del("a")).status).toBe(400);
      expect(store.users.some((u) => u.id === "a")).toBe(true);
    });

    it("deletes another user and 404s for an unknown one", async () => {
      expect((await del("b")).status).toBe(200);
      expect(store.users.some((u) => u.id === "b")).toBe(false);
      expect((await del("b")).status).toBe(404);
    });
  });
});

describe("admin login", () => {
  const login = (body: unknown) => loginRoute.POST(req("POST", "/api/admin/auth/login", { body }));
  beforeEach(() => addUser("a", "ADMIN", "admin@x.com"));

  it("logs in with the right password and sets the session cookie", async () => {
    const res = await login({ email: " ADMIN@x.com ", password: "correct-horse-battery" });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ email: "admin@x.com", role: "ADMIN" });
    expect(res.cookies.get("chiarel_admin_session")?.value).toContain(".");
    expect(store.sessions).toHaveLength(1);
  });

  it("gives an identical 401 for a wrong password and an unknown email", async () => {
    const wrong = await login({ email: "admin@x.com", password: "nope" });
    const unknown = await login({ email: "ghost@x.com", password: "nope" });
    expect(wrong.status).toBe(401);
    expect(unknown.status).toBe(401);
    expect(await wrong.json()).toEqual(await unknown.json());
    expect(wrong.cookies.get("chiarel_admin_session")).toBeUndefined();
    expect(store.sessions).toHaveLength(0);
  });

  it("requires both fields", async () => {
    expect((await login({ email: "admin@x.com" })).status).toBe(400);
    expect((await login(null)).status).toBe(400);
  });

  it("returns 429 when rate limited, before checking credentials", async () => {
    store.limited = true;
    const res = await login({ email: "admin@x.com", password: "correct-horse-battery" });
    expect(res.status).toBe(429);
    expect(store.sessions).toHaveLength(0);
  });
});

// Deny-by-default guard: any new file under app/api/admin that forgets
// withRole fails here, instead of shipping an unprotected admin route.
describe("every admin API route is protected", () => {
  const root = path.resolve(__dirname, "../app/api/admin");
  const files: string[] = [];
  (function walk(dir: string) {
    for (const name of readdirSync(dir)) {
      const full = path.join(dir, name);
      if (statSync(full).isDirectory()) walk(full);
      else if (name === "route.ts") files.push(full);
    }
  })(root);

  const PUBLIC = [path.join("auth", "login"), path.join("auth", "logout")];

  it("finds the admin routes", () => {
    expect(files.length).toBeGreaterThanOrEqual(4);
  });

  it.each(files.map((f) => [path.relative(root, f), f]))("%s", (rel, file) => {
    if (PUBLIC.some((p) => rel.startsWith(p))) return;
    const src = readFileSync(file, "utf8");
    const handlers = src.match(/export (const|async function) (GET|POST|PUT|PATCH|DELETE)\b/g) ?? [];
    const guarded = src.match(/withRole\s*(<[^>]*>)?\s*\(/g) ?? [];
    expect(handlers.length).toBeGreaterThan(0);
    expect(guarded.length).toBe(handlers.length);
  });
});

describe("POST /api/admin/auth/password", () => {
  const post = async (cookie: string | undefined, body: unknown) =>
    passwordRoute.POST(req("POST", "/api/admin/auth/password", { cookie, body }));
  const NEW = "a-brand-new-passphrase";
  const OLD = "correct-horse-battery";

  it("requires a signed-in user", async () => {
    expect((await post(undefined, { currentPassword: OLD, newPassword: NEW })).status).toBe(401);
  });

  it.each(["ADMIN", "MEMBER", "VIEWER"] as const)("lets a %s change their own password", async (role) => {
    addUser("u", role);
    const res = await post(await cookieFor("u"), { currentPassword: OLD, newPassword: NEW });
    expect(res.status).toBe(200);
    expect(bcrypt.compareSync(NEW, store.users[0].passwordHash)).toBe(true);
  });

  it("only ever changes the session user, whatever the body says", async () => {
    addUser("u", "ADMIN");
    addUser("victim", "ADMIN");
    const res = await post(await cookieFor("u"), { currentPassword: OLD, newPassword: NEW, userId: "victim", email: "victim@x.com" });
    expect(res.status).toBe(200);
    expect(store.users.find((x) => x.id === "victim")!.passwordHash).toBe(hash);
  });

  it("rejects a wrong current password and leaves the hash alone", async () => {
    addUser("u", "ADMIN");
    const res = await post(await cookieFor("u"), { currentPassword: "wrong-wrong-wrong", newPassword: NEW });
    expect(res.status).toBe(400);
    expect(store.users[0].passwordHash).toBe(hash);
  });

  it("rejects missing, short and unchanged new passwords", async () => {
    addUser("u", "ADMIN");
    const cookie = await cookieFor("u");
    expect((await post(cookie, { currentPassword: OLD })).status).toBe(400);
    expect((await post(cookie, { currentPassword: OLD, newPassword: "short" })).status).toBe(400);
    expect((await post(cookie, { currentPassword: OLD, newPassword: OLD })).status).toBe(400);
    expect(store.users[0].passwordHash).toBe(hash);
  });

  it("rejects a new password longer than bcrypt reads (72 bytes)", async () => {
    addUser("u", "ADMIN");
    const res = await post(await cookieFor("u"), { currentPassword: OLD, newPassword: "x".repeat(73) });
    expect(res.status).toBe(400);
    expect(store.users[0].passwordHash).toBe(hash);
  });

  it("revokes the user's other sessions but keeps the current one", async () => {
    addUser("u", "ADMIN");
    addUser("other", "ADMIN");
    const cookie = await cookieFor("u");
    await cookieFor("u");
    await cookieFor("other");
    await post(cookie, { currentPassword: OLD, newPassword: NEW });
    expect(store.sessions.filter((s) => s.userId === "u")).toHaveLength(1);
    expect(store.sessions.filter((s) => s.userId === "other")).toHaveLength(1);
    expect((await post(cookie, { currentPassword: NEW, newPassword: "yet-another-passphrase" })).status).toBe(200);
  });

  it("throttles repeated attempts", async () => {
    addUser("u", "ADMIN");
    const cookie = await cookieFor("u");
    store.limited = true;
    expect((await post(cookie, { currentPassword: OLD, newPassword: NEW })).status).toBe(429);
  });
});

// ---- Admin console P0: audit log, shell support, session hygiene ----
describe("audit log", () => {
  const OLD = "correct-horse-battery";
  const actions = () => store.audit.map((e) => e.action);
  const last = () => store.audit[store.audit.length - 1];

  it("records user create, role change and delete with the acting admin", async () => {
    addUser("a", "ADMIN");
    const cookie = await cookieFor("a");
    const created = await (await usersRoute.POST(req("POST", "/api/admin/users", { cookie, body: { email: "n@x.com", password: "twelve-chars-ok", role: "VIEWER" } }))).json();
    await userIdRoute.PATCH(req("PATCH", "/x", { cookie, body: { role: "MEMBER" } }), ctx(created.user.id));
    await userIdRoute.DELETE(req("DELETE", "/x", { cookie }), ctx(created.user.id));
    expect(actions()).toEqual(["user.create", "user.role_change", "user.delete"]);
    expect(store.audit.every((e) => e.actorEmail === "a@x.com" && e.ip === "9.9.9.9")).toBe(true);
    expect(store.audit[1].before).toMatchObject({ role: "VIEWER" });
    expect(store.audit[1].after).toMatchObject({ role: "MEMBER" });
  });

  it("never lets a credential reach an entry", async () => {
    addUser("a", "ADMIN");
    addUser("t", "MEMBER");
    const cookie = await cookieFor("a");
    await usersRoute.POST(req("POST", "/api/admin/users", { cookie, body: { email: "n@x.com", password: "super-secret-one-1", role: "VIEWER" } }));
    await resetRoute.POST(req("POST", "/x", { cookie, body: { password: "super-secret-two-2" } }), ctx("t"));
    await userIdRoute.PATCH(req("PATCH", "/x", { cookie, body: { role: "VIEWER" } }), ctx("t"));
    await passwordRoute.POST(req("POST", "/x", { cookie, body: { currentPassword: OLD, newPassword: "super-secret-three-3" } }));
    await loginRoute.POST(req("POST", "/x", { body: { email: "a@x.com", password: "super-secret-four-4" } }));
    const dump = JSON.stringify(store.audit);
    expect(store.audit.length).toBeGreaterThanOrEqual(5);
    for (const secret of ["super-secret", "passwordHash", hash, "$2a$", "$2b$"]) expect(dump).not.toContain(secret);
  });

  it("records sign-in, failed sign-in (attempted email only) and sign-out", async () => {
    addUser("a", "ADMIN");
    const ok = await loginRoute.POST(req("POST", "/x", { body: { email: "a@x.com", password: OLD } }));
    const bad = await loginRoute.POST(req("POST", "/x", { body: { email: "A@x.com", password: "wrong-wrong-wrong" } }));
    const unknown = await loginRoute.POST(req("POST", "/x", { body: { email: "ghost@x.com", password: "whatever-whatever" } }));
    expect([ok.status, bad.status, unknown.status]).toEqual([200, 401, 401]);
    const cookie = ok.headers.get("set-cookie")!.split(";")[0].split("=").slice(1).join("=");
    await logoutRoute.POST(req("POST", "/x", { cookie }));
    expect(actions()).toEqual(["auth.login", "auth.login_failed", "auth.login_failed", "auth.logout"]);
    expect(store.audit[2]).toMatchObject({ actorId: null, actorEmail: "ghost@x.com" });
  });

  it("does not let an audit outage block sign-in or sign-out", async () => {
    addUser("a", "ADMIN");
    store.failAudit = true;
    const ok = await loginRoute.POST(req("POST", "/x", { body: { email: "a@x.com", password: OLD } }));
    expect(ok.status).toBe(200);
    const cookie = ok.headers.get("set-cookie")!.split(";")[0].split("=").slice(1).join("=");
    expect((await logoutRoute.POST(req("POST", "/x", { cookie }))).status).toBe(200);
  });

  it("records a password change without the password", async () => {
    addUser("a", "ADMIN");
    await passwordRoute.POST(req("POST", "/x", { cookie: await cookieFor("a"), body: { currentPassword: OLD, newPassword: "a-brand-new-passphrase" } }));
    expect(last()).toMatchObject({ action: "auth.password_changed", actorEmail: "a@x.com" });
  });
});

describe("GET /api/admin/audit", () => {
  const get = async (user: string | null, qs = "") =>
    auditRoute.GET(req("GET", `/api/admin/audit${qs}`, { cookie: user ? await cookieFor(user) : undefined }));

  function seed(n: number) {
    for (let i = 0; i < n; i++) {
      store.audit.push({ id: `seed_${i}`, createdAt: new Date(Date.UTC(2026, 0, 1) + i * 1000), action: i % 2 ? "user.create" : "auth.login", actorEmail: i % 2 ? "boss@x.com" : "other@x.com" } as A);
    }
  }

  it("is Admin only", async () => {
    addUser("m", "MEMBER");
    addUser("v", "VIEWER");
    expect((await get(null)).status).toBe(401);
    expect((await get("m")).status).toBe(403);
    expect((await get("v")).status).toBe(403);
  });

  it("returns newest first and pages with a cursor", async () => {
    addUser("a", "ADMIN");
    seed(5);
    const first = await (await get("a", "?take=2")).json();
    expect(first.entries.map((e: A) => e.id)).toEqual(["seed_4", "seed_3"]);
    const second = await (await get("a", `?take=2&cursor=${first.nextCursor}`)).json();
    expect(second.entries.map((e: A) => e.id)).toEqual(["seed_2", "seed_1"]);
    const third = await (await get("a", `?take=2&cursor=${second.nextCursor}`)).json();
    expect(third.entries.map((e: A) => e.id)).toEqual(["seed_0"]);
    expect(third.nextCursor).toBeNull();
  });

  it("filters by action prefix and by person", async () => {
    addUser("a", "ADMIN");
    seed(6);
    const byAction = await (await get("a", "?action=user.")).json();
    expect(byAction.entries.length).toBe(3);
    expect(byAction.entries.every((e: A) => e.action.startsWith("user."))).toBe(true);
    const byActor = await (await get("a", "?actor=OTHER")).json();
    expect(byActor.entries.length).toBe(3);
  });

  it("has no write path: the route file exports GET only", () => {
    expect(Object.keys(auditRoute)).toEqual(["GET"]);
  });
});

describe("GET /api/admin/me", () => {
  it.each(["ADMIN", "MEMBER", "VIEWER"] as const)("returns the %s email and role", async (role) => {
    addUser("u", role);
    const res = await meRoute.GET(req("GET", "/api/admin/me", { cookie: await cookieFor("u") }));
    expect(await res.json()).toEqual({ email: "u@x.com", role });
  });

  it("is 401 when signed out", async () => {
    expect((await meRoute.GET(req("GET", "/api/admin/me"))).status).toBe(401);
  });
});

describe("DELETE /api/admin/users/[id]/sessions", () => {
  const del = async (cookie: string | undefined, id: string) =>
    sessionsRoute.DELETE(req("DELETE", "/x", { cookie }), ctx(id));

  it("signs the target out everywhere, leaves others alone, and is audited", async () => {
    addUser("a", "ADMIN");
    addUser("t", "MEMBER");
    addUser("o", "MEMBER");
    const adminCookie = await cookieFor("a");
    const targetCookie = await cookieFor("t");
    await cookieFor("t");
    await cookieFor("o");
    const res = await del(adminCookie, "t");
    expect(await res.json()).toEqual({ ok: true, revoked: 2 });
    expect(store.sessions.map((s) => s.userId).sort()).toEqual(["a", "o"]);
    expect((await meRoute.GET(req("GET", "/x", { cookie: targetCookie }))).status).toBe(401);
    expect(store.audit[0]).toMatchObject({ action: "user.sessions_revoked", entityId: "t" });
  });

  it("is Admin only, refuses yourself, and 404s an unknown user", async () => {
    addUser("a", "ADMIN");
    addUser("m", "MEMBER");
    expect((await del(undefined, "a")).status).toBe(401);
    expect((await del(await cookieFor("m"), "a")).status).toBe(403);
    expect((await del(await cookieFor("a"), "a")).status).toBe(400);
    expect((await del(await cookieFor("a"), "nope")).status).toBe(404);
    expect(store.audit).toHaveLength(0);
  });
});

describe("POST /api/admin/users/[id]/password", () => {
  const post = async (cookie: string | undefined, id: string, body: unknown) =>
    resetRoute.POST(req("POST", "/x", { cookie, body }), ctx(id));

  it("sets a temporary password, signs the target out, and is audited", async () => {
    addUser("a", "ADMIN");
    addUser("t", "MEMBER");
    const targetCookie = await cookieFor("t");
    const res = await post(await cookieFor("a"), "t", { password: "temporary-passphrase" });
    expect(res.status).toBe(200);
    expect(bcrypt.compareSync("temporary-passphrase", store.users.find((u) => u.id === "t")!.passwordHash)).toBe(true);
    expect((await meRoute.GET(req("GET", "/x", { cookie: targetCookie }))).status).toBe(401);
    expect(store.audit[0]).toMatchObject({ action: "user.password_reset", entityId: "t" });
    const login = await loginRoute.POST(req("POST", "/x", { body: { email: "t@x.com", password: "temporary-passphrase" } }));
    expect(login.status).toBe(200);
  });

  it("is Admin only, refuses yourself, and validates length", async () => {
    addUser("a", "ADMIN");
    addUser("m", "MEMBER");
    addUser("t", "MEMBER");
    expect((await post(undefined, "t", { password: "temporary-passphrase" })).status).toBe(401);
    expect((await post(await cookieFor("m"), "t", { password: "temporary-passphrase" })).status).toBe(403);
    const a = await cookieFor("a");
    expect((await post(a, "a", { password: "temporary-passphrase" })).status).toBe(400);
    expect((await post(a, "t", { password: "short" })).status).toBe(400);
    expect((await post(a, "t", { password: "x".repeat(73) })).status).toBe(400);
    expect((await post(a, "ghost", { password: "temporary-passphrase" })).status).toBe(404);
    expect(store.users.find((u) => u.id === "t")!.passwordHash).toBe(hash);
    expect(store.audit).toHaveLength(0);
  });
});

describe("user creation password cap", () => {
  it("rejects a password longer than 72 bytes", async () => {
    addUser("a", "ADMIN");
    const res = await usersRoute.POST(req("POST", "/x", { cookie: await cookieFor("a"), body: { email: "n@x.com", password: "x".repeat(73), role: "VIEWER" } }));
    expect(res.status).toBe(400);
    expect(store.users).toHaveLength(1);
  });
});
