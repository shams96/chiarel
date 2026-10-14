import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest, NextResponse } from "next/server";
import { readdirSync, readFileSync, statSync } from "fs";
import path from "path";
import bcrypt from "bcryptjs";

process.env.ADMIN_SESSION_SECRET = "unit-test-secret-unit-test-secret";

type U = { id: string; email: string; role: "ADMIN" | "MEMBER" | "VIEWER"; passwordHash: string; createdAt: Date };
type S = { id: string; userId: string; expiresAt: Date };
const store = { users: [] as U[], sessions: [] as S[], nextId: 1, limited: false };

const pick = (u: U, select?: Record<string, boolean>) =>
  select ? Object.fromEntries(Object.keys(select).map((k) => [k, (u as Record<string, unknown>)[k]])) : u;

vi.mock("@/lib/rate-limit", () => ({ isRateLimited: () => store.limited, clientIp: () => "9.9.9.9" }));
vi.mock("@/lib/db", () => ({
  db: {
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
      delete: async ({ where }: { where: { id: string } }) => {
        const before = store.sessions.length;
        store.sessions = store.sessions.filter((s) => s.id !== where.id);
        if (store.sessions.length === before) throw new Error("not found");
      },
    },
    user: {
      findUnique: async ({ where }: { where: { id?: string; email?: string } }) =>
        store.users.find((u) => (where.id ? u.id === where.id : u.email === where.email)) ?? null,
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
  store.nextId = 1;
  store.limited = false;
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
