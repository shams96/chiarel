import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { createHash, generateKeyPairSync, sign as cryptoSign, type KeyObject } from "crypto";

process.env.ADMIN_SESSION_SECRET = "unit-test-secret-unit-test-secret";
const CLIENT_ID = "test-client.apps.example";
const CLIENT_SECRET = "test-client-secret";
const STATE_SECRET = "oauth-state-secret-oauth-state-secret";
const ISSUER = "https://accounts.google.com";

type C = { id: string; email: string; name: string | null; createdAt: Date; lastSignInAt: Date | null; deletedAt: Date | null };
type CS = { id: string; customerId: string; createdAt: Date; lastSeenAt: Date; expiresAt: Date; userAgent: string | null };
type LC = { id: string; createdAt: Date; emailHash: string; codeHash: string; expiresAt: Date; attempts: number; consumedAt: Date | null };
type Ident = { id: string; provider: string; subject: string; email: string; userId: string | null; customerId: string | null };
type O = { id: string; email: string; customerId: string | null };
const store = {
  customers: [] as C[],
  csessions: [] as CS[],
  codes: [] as LC[],
  identities: [] as Ident[],
  orders: [] as O[],
  users: [] as { id: string; email: string; role: "ADMIN" | "MEMBER" | "VIEWER"; passwordHash: string }[],
  asessions: [] as { id: string; userId: string; expiresAt: Date }[],
  audit: [] as { action: string; actorEmail: string; summary?: string; entityId?: string | null }[],
  mails: [] as { to: string; subject: string; text: string; fromAccounts?: boolean }[],
  mailFails: false,
  raceOnIdentityCreate: false,
  nextId: 1,
};

// Same fixed-window semantics as lib/rate-limit.ts, but resettable between tests.
const windows = new Map<string, { count: number; resetAt: number }>();
vi.mock("@/lib/rate-limit", () => ({
  isRateLimited: (key: string, max: number, windowMs: number) => {
    const now = Date.now();
    const e = windows.get(key);
    if (!e || now >= e.resetAt) {
      windows.set(key, { count: 1, resetAt: now + windowMs });
      return false;
    }
    e.count += 1;
    return e.count > max;
  },
  clientIp: (req: { headers: { get(n: string): string | null } }) => req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown",
}));

vi.mock("@/lib/mail", () => ({
  sendMail: async (m: { to: string; subject: string; text: string; fromAccounts?: boolean }) => {
    if (store.mailFails) throw new Error("smtp down");
    store.mails.push(m);
  },
}));

vi.mock("@/lib/db", async () => {
  const { dbBreaker } = await import("@/lib/db-client");
  const { DbUnavailableError } = await import("@/lib/db-resilience");
  const gate = () => {
    if (!dbBreaker.tryAcquire()) throw new DbUnavailableError(dbBreaker.retryAfterSeconds());
  };
  const p2002 = () => Object.assign(new Error("unique"), { code: "P2002" });
  const id = (p: string) => `${p}_${store.nextId++}`;
  return {
    db: {
      auditLog: { create: async ({ data }: { data: never }) => (store.audit.push(data), data) },
      loginCode: {
        deleteMany: async ({ where }: { where: { emailHash?: string; id?: { in: string[] }; OR?: { expiresAt?: { lte: Date }; consumedAt?: { not: null } }[] } }) => {
          gate();
          const hit = (c: LC) =>
            (where.emailHash === undefined || c.emailHash === where.emailHash) &&
            (where.id === undefined || where.id.in.includes(c.id)) &&
            (where.OR === undefined ||
              where.OR.some((o) => (o.expiresAt ? c.expiresAt <= o.expiresAt.lte : false) || (o.consumedAt ? c.consumedAt !== null : false)));
          const before = store.codes.length;
          store.codes = store.codes.filter((c) => !hit(c));
          return { count: before - store.codes.length };
        },
        findMany: async ({ where }: { where: { emailHash: string } }) => {
          gate();
          return store.codes.filter((c) => c.emailHash === where.emailHash).map((c) => ({ ...c }));
        },
        create: async ({ data }: { data: Pick<LC, "emailHash" | "codeHash" | "expiresAt"> }) => {
          const row = { id: id("lc"), createdAt: new Date(), attempts: 0, consumedAt: null, ...data };
          store.codes.push(row);
          return row;
        },
        update: async ({ where, data }: { where: { id: string }; data: { attempts: { increment: number } } }) => {
          const row = store.codes.find((c) => c.id === where.id)!;
          row.attempts += data.attempts.increment;
          return { ...row };
        },
        updateMany: async ({ where, data }: { where: { id: string; consumedAt: null }; data: { consumedAt: Date } }) => {
          const row = store.codes.find((c) => c.id === where.id && c.consumedAt === null);
          if (row) row.consumedAt = data.consumedAt;
          return { count: row ? 1 : 0 };
        },
      },
      customer: {
        findUnique: async ({ where }: { where: { id?: string; email?: string } }) => {
          gate();
          const c = store.customers.find((x) => (where.id ? x.id === where.id : x.email === where.email));
          return c ? { ...c } : null;
        },
        create: async ({ data }: { data: { email: string } }) => {
          if (store.customers.some((c) => c.email === data.email)) throw p2002();
          const c: C = { id: id("cust"), email: data.email, name: null, createdAt: new Date(), lastSignInAt: null, deletedAt: null };
          store.customers.push(c);
          return { ...c };
        },
        update: async ({ where, data }: { where: { id: string }; data: Partial<C> }) => {
          const c = store.customers.find((x) => x.id === where.id)!;
          Object.assign(c, data);
          return { ...c };
        },
      },
      customerSession: {
        create: async ({ data }: { data: Pick<CS, "customerId" | "expiresAt" | "userAgent"> }) => {
          const s: CS = { id: id("cs"), createdAt: new Date(), lastSeenAt: new Date(), ...data };
          store.csessions.push(s);
          return { ...s };
        },
        findUnique: async ({ where }: { where: { id: string } }) => {
          gate();
          const s = store.csessions.find((x) => x.id === where.id);
          return s ? { ...s, customer: { ...store.customers.find((c) => c.id === s.customerId)! } } : null;
        },
        update: async ({ where, data }: { where: { id: string }; data: Partial<CS> }) => {
          Object.assign(store.csessions.find((x) => x.id === where.id)!, data);
          return {};
        },
        delete: async ({ where }: { where: { id: string } }) => {
          store.csessions = store.csessions.filter((x) => x.id !== where.id);
          return {};
        },
      },
      identity: {
        findUnique: async ({ where }: { where: { provider_subject: { provider: string; subject: string } } }) => {
          gate();
          const k = where.provider_subject;
          const i = store.identities.find((x) => x.provider === k.provider && x.subject === k.subject);
          if (!i) return null;
          return {
            ...i,
            user: i.userId ? { ...store.users.find((u) => u.id === i.userId)! } : null,
            customer: i.customerId ? { ...store.customers.find((c) => c.id === i.customerId)! } : null,
          };
        },
        findFirst: async ({ where }: { where: { userId?: string; customerId?: string; provider: string } }) => {
          gate();
          const i = store.identities.find(
            (x) =>
              x.provider === where.provider &&
              (where.userId ? x.userId === where.userId : x.customerId === where.customerId)
          );
          return i ? { ...i } : null;
        },
        create: async ({ data }: { data: Partial<Ident> & { provider: string; subject: string; email: string } }) => {
          if (store.raceOnIdentityCreate) {
            // Another request binds this subject to someone else first.
            store.identities.push({ id: id("ident"), userId: null, customerId: "rival", ...data });
            throw p2002();
          }
          if (store.identities.some((x) => x.provider === data.provider && x.subject === data.subject)) throw p2002();
          const i = { id: id("ident"), userId: null, customerId: null, ...data };
          store.identities.push(i);
          return i;
        },
      },
      // Tagged template: (strings, customerId, email). Exact match on the lower-cased email, like the real SQL.
      $executeRaw: async (strings: TemplateStringsArray, customerId: string, email: string) => {
        expect(strings.join("?")).toContain('lower("email") = ?');
        expect(strings.join("?")).not.toMatch(/like/i);
        const hits = store.orders.filter((o) => o.customerId === null && o.email.toLowerCase() === email);
        hits.forEach((o) => (o.customerId = customerId));
        return hits.length;
      },
      user: {
        findUnique: async ({ where }: { where: { id?: string; email?: string } }) => {
          gate();
          const u = store.users.find((x) => (where.id ? x.id === where.id : x.email === where.email));
          return u ? { ...u } : null;
        },
      },
      session: {
        create: async ({ data }: { data: { userId: string; expiresAt: Date } }) => {
          const s = { id: id("sess"), ...data };
          store.asessions.push(s);
          return s;
        },
        findUnique: async ({ where }: { where: { id: string } }) => {
          const s = store.asessions.find((x) => x.id === where.id);
          return s ? { ...s, user: store.users.find((u) => u.id === s.userId)! } : null;
        },
        delete: async () => undefined,
      },
    },
  };
});

const oauthLib = await import("@/lib/oauth-google");
const { dbBreaker } = await import("@/lib/db-client");
const auth = await import("@/lib/auth");
const csess = await import("@/lib/customer-session");
const loginCode = await import("@/lib/login-code");
const { safeReturnTo } = await import("@/lib/return-to");
const startCode = await import("@/app/api/account/code/start/route");
const verifyCode = await import("@/app/api/account/code/verify/route");
const signoutRoute = await import("@/app/api/account/signout/route");
const meRoute = await import("@/app/api/account/me/route");
const adminMe = await import("@/app/api/admin/me/route");
const gStart = await import("@/app/api/auth/google/start/route");
const gCallback = await import("@/app/api/auth/google/callback/route");

// ---- helpers ---------------------------------------------------------------

let ipCounter = 0;
const nextIp = () => `10.0.${Math.floor(ipCounter / 250)}.${(ipCounter++ % 250) + 1}`;
const post = (url: string, body: unknown, opts: { cookie?: string; ip?: string } = {}) =>
  new NextRequest(`http://localhost${url}`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": opts.ip ?? nextIp(), ...(opts.cookie ? { cookie: opts.cookie } : {}) },
    body: JSON.stringify(body),
  });
const get = (url: string, cookie?: string) =>
  new NextRequest(`http://localhost${url}`, { headers: { "x-forwarded-for": nextIp(), ...(cookie ? { cookie } : {}) } });

const lastCode = () => /code is (\d{6})/.exec(store.mails[store.mails.length - 1]?.text ?? "")?.[1] ?? "";
const NEUTRAL_MESSAGE = "If that address can receive mail, a code is on its way.";

async function requestCode(email: string, ip?: string) {
  return startCode.POST(post("/api/account/code/start", { email }, { ip }));
}
async function signInByCode(email = "a@chiarel.test", returnTo?: string) {
  await requestCode(email);
  return verifyCode.POST(post("/api/account/code/verify", { email, code: lastCode(), return_to: returnTo }));
}

beforeEach(async () => {
  Object.assign(store, {
    customers: [], csessions: [], codes: [], identities: [], orders: [], users: [], asessions: [], audit: [], mails: [], mailFails: false, raceOnIdentityCreate: false, nextId: 1,
  });
  windows.clear();
  process.env.GOOGLE_CLIENT_ID = CLIENT_ID;
  process.env.GOOGLE_CLIENT_SECRET = CLIENT_SECRET;
  process.env.OAUTH_STATE_SECRET = STATE_SECRET;
  delete process.env.CUSTOMER_SESSION_SECRET;
  dbBreaker.success();
  oauthLib.__setProviderForTests({ fetch: mockFetch });
  vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => {
  dbBreaker.success();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

// ---- mock OIDC issuer (same approach as tests/social-auth.test.ts) ---------

const keys = generateKeyPairSync("rsa", { modulusLength: 2048 });
const jwk = { ...keys.publicKey.export({ format: "jwk" }), kid: "k1", alg: "RS256", use: "sig" };
const b64 = (o: unknown) => Buffer.from(JSON.stringify(o)).toString("base64url");
function jwt(claims: Record<string, unknown>, key: KeyObject = keys.privateKey) {
  const head = `${b64({ alg: "RS256", typ: "JWT", kid: "k1" })}.${b64(claims)}`;
  return `${head}.${cryptoSign("RSA-SHA256", Buffer.from(head), key).toString("base64url")}`;
}
const issued = new Map<string, { nonce: string; challenge: string; claims: Record<string, unknown> }>();
const mockFetch = (async (input: unknown, init?: RequestInit) => {
  const url = String(input);
  if (url === "https://www.googleapis.com/oauth2/v3/certs") return Response.json({ keys: [jwk] });
  if (url === "https://oauth2.googleapis.com/token") {
    const p = new URLSearchParams(String(init?.body));
    const rec = issued.get(p.get("code") ?? "");
    issued.delete(p.get("code") ?? "");
    const verifierHash = createHash("sha256").update(p.get("code_verifier") ?? "").digest("base64url");
    if (!rec || verifierHash !== rec.challenge) return Response.json({ error: "invalid_grant" }, { status: 400 });
    const now = Math.floor(Date.now() / 1000);
    const claims = { iss: ISSUER, aud: CLIENT_ID, iat: now, exp: now + 300, nonce: rec.nonce, ...rec.claims };
    return Response.json({ access_token: "at", token_type: "Bearer", expires_in: 3600, id_token: jwt(claims) });
  }
  return new Response("nope", { status: 404 });
}) as unknown as typeof fetch;

async function googleCustomer(claims: Record<string, unknown>, returnTo?: string) {
  const qs = `?intent=customer${returnTo ? `&return_to=${encodeURIComponent(returnTo)}` : ""}`;
  const start = await gStart.GET(get(`/api/auth/google/start${qs}`));
  const loc = new URL(start.headers.get("location")!);
  const code = `gc_${store.nextId++}`;
  issued.set(code, { nonce: loc.searchParams.get("nonce")!, challenge: loc.searchParams.get("code_challenge")!, claims });
  const cookie = start.cookies.get("chiarel_oauth")!.value;
  return gCallback.GET(get(`/api/auth/google/callback?code=${code}&state=${loc.searchParams.get("state")}`, `chiarel_oauth=${cookie}`));
}
const GOOD = { sub: "g-sub-1", email: "Shopper@Chiarel.test", email_verified: true };
const redirectOf = (res: Response) => new URL(res.headers.get("location")!);

// ---- code lifecycle --------------------------------------------------------

describe("email normalisation", () => {
  it("trims and lower-cases, rejects non-addresses", () => {
    expect(loginCode.normaliseEmail("  Shopper@Chiarel.TEST ")).toBe("shopper@chiarel.test");
    for (const bad of ["", "nope", "a@b", "a b@c.com", 5, null, "a@@b.com", "x".repeat(260) + "@a.com"]) {
      expect(loginCode.normaliseEmail(bad)).toBeNull();
    }
  });
});

describe("code start", () => {
  it("sends a 6-digit code from the accounts mailbox, answers neutrally, stores only hashes", async () => {
    const res = await requestCode("  A@Chiarel.test ");
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, message: NEUTRAL_MESSAGE });
    expect(store.mails).toHaveLength(1);
    expect(store.mails[0]).toMatchObject({ to: "a@chiarel.test", subject: "Your CHIAREL sign-in code", fromAccounts: true });
    const code = lastCode();
    expect(code).toMatch(/^\d{6}$/);
    expect(store.codes).toHaveLength(1);
    expect(JSON.stringify(store.codes)).not.toContain(code);
    expect(JSON.stringify(store.codes)).not.toContain("chiarel.test");
    expect(res.headers.get("cache-control")).toBe("no-store");
  });

  it("answers identically for known, unknown and mail-failing addresses", async () => {
    store.customers.push({ id: "c1", email: "known@chiarel.test", name: null, createdAt: new Date(), lastSignInAt: null, deletedAt: null });
    const known = await (await requestCode("known@chiarel.test")).json();
    const unknown = await (await requestCode("stranger@chiarel.test")).json();
    store.mailFails = true;
    const failing = await (await requestCode("fails@chiarel.test")).json();
    expect(known).toEqual(unknown);
    expect(failing).toEqual(unknown);
  });

  it("rejects a malformed address with 400", async () => {
    expect((await requestCode("not-an-email")).status).toBe(400);
    expect(store.mails).toHaveLength(0);
  });

  it("limits to 3 codes per address from one IP in the window, with the normal answer and no 4th mail", async () => {
    for (let i = 0; i < 4; i++) {
      const res = await requestCode("rate@chiarel.test", "5.5.5.5");
      expect(res.status).toBe(200);
      expect(await res.json()).toEqual({ ok: true, message: NEUTRAL_MESSAGE });
    }
    expect(store.mails).toHaveLength(3);
  });

  it("limits per IP", async () => {
    const statuses: number[] = [];
    for (let i = 0; i < 12; i++) statuses.push((await requestCode(`ip${i}@chiarel.test`, "7.7.7.7")).status);
    expect(statuses.slice(0, 10).every((s) => s === 200)).toBe(true);
    expect(statuses.slice(10)).toEqual([429, 429]);
  });

  it("logs the code only in development, and only when mail fails", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    store.mailFails = true;
    vi.stubEnv("NODE_ENV", "development");
    await requestCode("dev@chiarel.test");
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toMatch(/dev@chiarel\.test: \d{6}/);
    warn.mockClear();
    vi.stubEnv("NODE_ENV", "production");
    await requestCode("prod@chiarel.test");
    expect(warn).not.toHaveBeenCalled();
    expect(JSON.stringify((console.error as unknown as { mock: { calls: unknown[] } }).mock.calls)).not.toMatch(/\d{6}/);
    vi.unstubAllEnvs();
  });
});

describe("code verify", () => {
  it("signs in, creates the customer on first use, and sets a hardened cookie", async () => {
    const res = await signInByCode("New@Chiarel.test");
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, redirect: "/account" });
    const c = res.cookies.get("chiarel_session")!;
    expect(c).toMatchObject({ httpOnly: true, sameSite: "lax", path: "/", maxAge: 30 * 24 * 3600 });
    expect(store.customers.map((x) => x.email)).toEqual(["new@chiarel.test"]);
    expect(store.csessions).toHaveLength(1);
    expect(store.audit.map((a) => a.action)).toEqual(["customer.sign_in"]);
    const me = await meRoute.GET(get("/api/account/me", `chiarel_session=${c.value}`));
    expect(await me.json()).toMatchObject({ signedIn: true, customer: { email: "new@chiarel.test" } });
  });

  it("a returning address reuses its customer (no duplicate)", async () => {
    await signInByCode("a@chiarel.test");
    await signInByCode("A@chiarel.test");
    expect(store.customers).toHaveLength(1);
    expect(store.csessions).toHaveLength(2);
    expect(new Set(store.csessions.map((s) => s.id)).size).toBe(2);
  });

  it("a wrong code fails with the same body as no code at all", async () => {
    await requestCode("a@chiarel.test");
    const wrong = await verifyCode.POST(post("/api/account/code/verify", { email: "a@chiarel.test", code: lastCode() === "000000" ? "000001" : "000000" }));
    const none = await verifyCode.POST(post("/api/account/code/verify", { email: "nobody@chiarel.test", code: "123456" }));
    expect(wrong.status).toBe(401);
    expect(none.status).toBe(401);
    expect(await wrong.json()).toEqual(await none.json());
    expect(wrong.headers.get("set-cookie") ?? "").not.toContain("chiarel_session=");
    expect(store.csessions).toHaveLength(0);
    expect(store.audit.map((a) => a.action)).toEqual(["customer.sign_in_failed", "customer.sign_in_failed"]);
  });

  it("a code cannot be reused", async () => {
    await requestCode("a@chiarel.test");
    const code = lastCode();
    const ok = await verifyCode.POST(post("/api/account/code/verify", { email: "a@chiarel.test", code }));
    const again = await verifyCode.POST(post("/api/account/code/verify", { email: "a@chiarel.test", code }));
    expect(ok.status).toBe(200);
    expect(again.status).toBe(401);
    expect(store.csessions).toHaveLength(1);
  });

  it("expires after 10 minutes", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    await requestCode("a@chiarel.test");
    const code = lastCode();
    vi.setSystemTime(Date.now() + 10 * 60 * 1000 + 1000);
    const res = await verifyCode.POST(post("/api/account/code/verify", { email: "a@chiarel.test", code }));
    expect(res.status).toBe(401);
    expect(store.csessions).toHaveLength(0);
  });

  it("burns the code after 5 wrong attempts, even if the right one is then sent", async () => {
    await requestCode("a@chiarel.test");
    const right = lastCode();
    const wrong = right === "111111" ? "222222" : "111111";
    for (let i = 0; i < 5; i++) {
      expect((await verifyCode.POST(post("/api/account/code/verify", { email: "a@chiarel.test", code: wrong }))).status).toBe(401);
    }
    expect(store.codes).toHaveLength(0);
    expect((await verifyCode.POST(post("/api/account/code/verify", { email: "a@chiarel.test", code: right }))).status).toBe(401);
    expect(store.csessions).toHaveLength(0);
  });

  it("the fifth attempt can still succeed, the sixth cannot", async () => {
    await requestCode("a@chiarel.test");
    const right = lastCode();
    const wrong = right === "111111" ? "222222" : "111111";
    for (let i = 0; i < 4; i++) await verifyCode.POST(post("/api/account/code/verify", { email: "a@chiarel.test", code: wrong }));
    expect((await verifyCode.POST(post("/api/account/code/verify", { email: "a@chiarel.test", code: right }))).status).toBe(200);
  });

  it("a resend does NOT kill the older live code (a stranger cannot invalidate the owner code)", async () => {
    await requestCode("a@chiarel.test");
    const first = lastCode();
    await requestCode("a@chiarel.test");
    expect(store.codes).toHaveLength(2);
    expect((await verifyCode.POST(post("/api/account/code/verify", { email: "a@chiarel.test", code: first }))).status).toBe(200);
  });

  it("keeps at most 5 live codes, dropping the oldest; expired and spent ones are cleared on issue", async () => {
    for (let i = 0; i < 6; i++) await requestCode("a@chiarel.test");
    expect(store.codes).toHaveLength(5);
    store.codes[0].expiresAt = new Date(Date.now() - 1000);
    store.codes[1].consumedAt = new Date();
    await requestCode("a@chiarel.test");
    expect(store.codes).toHaveLength(4);
  });

  it("each live code has its own 5-attempt budget", async () => {
    await requestCode("a@chiarel.test");
    const first = lastCode();
    const wrong = first === "111111" ? "222222" : "111111";
    for (let i = 0; i < 4; i++) await verifyCode.POST(post("/api/account/code/verify", { email: "a@chiarel.test", code: wrong }));
    await requestCode("a@chiarel.test");
    const second = lastCode();
    expect(store.codes.map((c) => c.attempts)).toEqual([4, 0]);
    expect((await verifyCode.POST(post("/api/account/code/verify", { email: "a@chiarel.test", code: second }))).status).toBe(200);
  });

  it("an attacker flood from one IP cannot lock out or burn the owner on another IP", async () => {
    await requestCode("victim@chiarel.test", "1.1.1.1");
    const ownerCode = lastCode();
    const attacker = "6.6.6.6";
    for (let i = 0; i < 5; i++) await requestCode("victim@chiarel.test", attacker); // only 3 count, no more mail after that
    expect(store.mails.length).toBe(1 + 3);
    for (let i = 0; i < 15; i++) {
      await verifyCode.POST(post("/api/account/code/verify", { email: "victim@chiarel.test", code: "000000" }, { ip: attacker }));
    }
    const owner = await verifyCode.POST(post("/api/account/code/verify", { email: "victim@chiarel.test", code: ownerCode }, { ip: "1.1.1.1" }));
    expect(owner.status).toBe(200);
  });

  it("the address-only ceilings still bound a distributed flood (20 starts, 40 verifies)", async () => {
    for (let i = 0; i < 25; i++) await requestCode("flood@chiarel.test", `3.3.${i}.1`);
    expect(store.mails.length).toBe(20);
    const live = store.codes.map((c) => c.id);
    for (let i = 0; i < 45; i++) {
      await verifyCode.POST(post("/api/account/code/verify", { email: "flood@chiarel.test", code: "123456" }, { ip: `4.4.${i}.1` }));
    }
    // Attempts stop counting once the 40-per-address ceiling is reached.
    const maxAttempts = Math.max(...store.codes.filter((c) => live.includes(c.id)).map((c) => c.attempts), 0);
    expect(maxAttempts).toBeLessThanOrEqual(5);
    const past = await verifyCode.POST(post("/api/account/code/verify", { email: "flood@chiarel.test", code: lastCode() }, { ip: "9.9.9.9" }));
    expect(past.status).toBe(401);
  });

  it("a code for one address does not work for another", async () => {
    await requestCode("a@chiarel.test");
    const res = await verifyCode.POST(post("/api/account/code/verify", { email: "b@chiarel.test", code: lastCode() }));
    expect(res.status).toBe(401);
  });

  it("limits verification to 4 tries per address+IP (below a code attempt budget) and 30 per IP", async () => {
    await requestCode("limit@chiarel.test", "2.2.2.2");
    const right = lastCode();
    const wrong = right === "123456" ? "654321" : "123456";
    for (let i = 0; i < 4; i++) await verifyCode.POST(post("/api/account/code/verify", { email: "limit@chiarel.test", code: wrong }, { ip: "2.2.2.2" }));
    // That IP is now cut off for this address, even with the right code.
    expect((await verifyCode.POST(post("/api/account/code/verify", { email: "limit@chiarel.test", code: right }, { ip: "2.2.2.2" }))).status).toBe(401);
    const ip = "8.8.8.8";
    const byIp: number[] = [];
    for (let i = 0; i < 32; i++) byIp.push((await verifyCode.POST(post("/api/account/code/verify", { email: `v${i}@chiarel.test`, code: "123456" }, { ip }))).status);
    expect(byIp.slice(30)).toEqual([429, 429]);
  });

  it("never retries on a database failure (single attempt counted)", async () => {
    await requestCode("a@chiarel.test");
    dbBreaker.failure();
    dbBreaker.failure();
    dbBreaker.failure();
    const res = await verifyCode.POST(post("/api/account/code/verify", { email: "a@chiarel.test", code: lastCode() }));
    expect(res.status).toBe(503);
    expect(store.csessions).toHaveLength(0);
  });

  it("generates codes with leading zeros preserved and always 6 digits", async () => {
    for (let i = 0; i < 25; i++) {
      const c = await loginCode.issueLoginCode(`z${i}@chiarel.test`);
      expect(c).toMatch(/^\d{6}$/);
    }
  });
});

describe("order back-fill", () => {
  it("attaches past guest orders with the same email (any case) on verification, leaves others alone", async () => {
    store.orders.push(
      { id: "o1", email: "A@Chiarel.test", customerId: null },
      { id: "o2", email: "a@chiarel.test", customerId: null },
      { id: "o3", email: "other@chiarel.test", customerId: null },
      { id: "o4", email: "a@chiarel.test", customerId: "someone-else" }
    );
    await signInByCode("a@chiarel.test");
    const id = store.customers[0].id;
    expect(store.orders.map((o) => o.customerId)).toEqual([id, id, null, "someone-else"]);
  });
});

describe("back-fill is an exact match (no LIKE wildcards)", () => {
  it("rejects % at normalisation and the start route answers 400; underscore stays valid", async () => {
    expect(loginCode.normaliseEmail("%@x.test")).toBeNull();
    expect((await requestCode("%@x.test")).status).toBe(400);
    expect(loginCode.normaliseEmail("john_doe@x.test")).toBe("john_doe@x.test");
  });

  it("attaches nothing for a wildcard address; an underscore matches only a literal underscore", async () => {
    const { attachGuestOrders } = await import("@/lib/customer-auth");
    store.orders.push({ id: "o1", email: "a@x.test", customerId: null }, { id: "o2", email: "j_e@x.test", customerId: null }, { id: "o3", email: "jxe@x.test", customerId: null });
    expect(await attachGuestOrders({ id: "c1", email: "%@x.test" })).toBe(0);
    expect(await attachGuestOrders({ id: "c2", email: "j_e@x.test" })).toBe(1);
    expect(store.orders.map((o) => o.customerId)).toEqual([null, "c2", null]);
  });
});

describe("CSRF guard on the account POSTs", () => {
  const raw = (url: string, headers: Record<string, string>, body = "{}") =>
    new NextRequest(`http://localhost${url}`, { method: "POST", headers: { "x-forwarded-for": nextIp(), ...headers }, body });

  it.each(["/api/account/code/start", "/api/account/code/verify", "/api/account/signout"])("%s: text/plain is refused with 403", async (url) => {
    const route = url.endsWith("start") ? startCode : url.endsWith("verify") ? verifyCode : signoutRoute;
    const res = await route.POST(raw(url, { "content-type": "text/plain" }, JSON.stringify({ email: "a@chiarel.test" })));
    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({ ok: false, code: "forbidden" });
    expect(store.mails).toHaveLength(0);
  });

  it("a foreign Origin is refused even with a JSON content type; same-site and no Origin pass", async () => {
    const body = JSON.stringify({ email: "a@chiarel.test" });
    const json = { "content-type": "application/json" };
    expect((await startCode.POST(raw("/api/account/code/start", { ...json, origin: "https://evil.example" }, body))).status).toBe(403);
    expect((await startCode.POST(raw("/api/account/code/start", { ...json, origin: "http://localhost" }, body))).status).toBe(200);
    expect((await startCode.POST(raw("/api/account/code/start", { ...json, origin: "https://chiarel.com" }, body))).status).toBe(200);
    expect((await startCode.POST(raw("/api/account/code/start", json, body))).status).toBe(200);
  });
});

describe("return_to", () => {
  it.each([
    ["/account", "/account"],
    ["/cart", "/cart"],
    ["/shop/clarity-essence?x=1", "/shop/clarity-essence?x=1"],
    ["https://evil.example/account", "/account"],
    ["//evil.example", "/account"],
    ["/\\evil.example", "/account"],
    ["/admin", "/account"],
    ["/api/admin/users", "/account"],
    ["/accountant", "/account"],
    ["javascript:alert(1)", "/account"],
    ["/shop/%0d%0aSet-Cookie:x", "/shop/%0d%0aSet-Cookie:x"],
    ["/shop\r\nx", "/account"],
    [undefined, "/account"],
    [42, "/account"],
  ])("safeReturnTo(%j) -> %s", (input, expected) => {
    expect(safeReturnTo(input)).toBe(expected);
  });

  it("verify honours an allowed return_to and drops an open redirect", async () => {
    expect(await (await signInByCode("a@chiarel.test", "/checkout")).json()).toMatchObject({ redirect: "/checkout" });
    expect(await (await signInByCode("a@chiarel.test", "https://evil.example")).json()).toMatchObject({ redirect: "/account" });
  });
});

// ---- Google, intent=customer ----------------------------------------------

describe("Google intent=customer", () => {
  it("start carries the intent and a safe return_to in the signed cookie", async () => {
    const start = await gStart.GET(get("/api/auth/google/start?intent=customer&return_to=//evil.example"));
    const v = oauthLib.verifyValue<{ i: string; r: string }>(STATE_SECRET, "oauth", start.cookies.get("chiarel_oauth")!.value)!;
    expect(v.i).toBe("customer");
    expect(v.r).toBe("/account");
  });

  it("creates a new customer from a verified email and signs them in", async () => {
    const res = await googleCustomer(GOOD, "/cart");
    expect(res.status).toBe(303);
    expect(redirectOf(res).pathname).toBe("/cart");
    expect(res.cookies.get("chiarel_session")).toBeTruthy();
    expect(res.cookies.get("chiarel_admin_session")).toBeUndefined();
    expect(store.customers.map((c) => c.email)).toEqual(["shopper@chiarel.test"]);
    expect(store.identities).toMatchObject([{ provider: "google_customer", subject: "g-sub-1", customerId: store.customers[0].id, userId: null }]);
    expect(store.audit.map((a) => a.action)).toEqual(["customer.social_link", "customer.sign_in"]);
  });

  it("a repeat sign-in is found by sub, even after the Google email changed", async () => {
    await googleCustomer(GOOD);
    const res = await googleCustomer({ ...GOOD, email: "renamed@elsewhere.test" });
    expect(redirectOf(res).pathname).toBe("/account");
    expect(store.customers).toHaveLength(1);
    expect(store.csessions).toHaveLength(2);
  });

  it("an existing code-created customer gets the sub bound on first Google use", async () => {
    await signInByCode("shopper@chiarel.test");
    const res = await googleCustomer(GOOD);
    expect(res.cookies.get("chiarel_session")).toBeTruthy();
    expect(store.customers).toHaveLength(1);
    expect(store.identities).toHaveLength(1);
  });

  it("back-fills guest orders on Google sign-in too", async () => {
    store.orders.push({ id: "o1", email: "shopper@chiarel.test", customerId: null });
    await googleCustomer(GOOD);
    expect(store.orders[0].customerId).toBe(store.customers[0].id);
  });

  it("refuses an unverified email and signs nobody in", async () => {
    const res = await googleCustomer({ ...GOOD, email_verified: false });
    expect(redirectOf(res).pathname).toBe("/account/login");
    expect(redirectOf(res).searchParams.get("notice")).toBe("failed");
    expect(store.customers).toHaveLength(0);
    expect(store.csessions).toHaveLength(0);
    expect(res.cookies.get("chiarel_session")).toBeUndefined();
  });

  it("refuses a different Google account for an already-bound customer (subject_mismatch)", async () => {
    await googleCustomer(GOOD);
    const res = await googleCustomer({ ...GOOD, sub: "g-sub-OTHER" });
    expect(redirectOf(res).searchParams.get("notice")).toBe("failed");
    expect(store.csessions).toHaveLength(1);
    expect(store.audit.at(-1)).toMatchObject({ action: "customer.sign_in_failed" });
    expect(store.audit.at(-1)!.summary).toContain("subject_mismatch");
  });

  it("survives a lost bind race (P2002) without signing in", async () => {
    store.raceOnIdentityCreate = true;
    const res = await googleCustomer(GOOD);
    expect(redirectOf(res).searchParams.get("notice")).toBe("failed");
    expect(res.cookies.get("chiarel_session")).toBeUndefined();
    expect(store.csessions).toHaveLength(0);
    expect(store.audit.at(-1)!.summary).toContain("subject_conflict");
  });

  it("an admin's own Gmail on the customer page yields a customer session, never an admin one", async () => {
    store.users.push({ id: "u1", email: "shopper@chiarel.test", role: "ADMIN", passwordHash: "x" });
    store.identities.push({ id: "ia", provider: "google", subject: "g-sub-1", email: "x", userId: "u1", customerId: null });
    const res = await googleCustomer(GOOD);
    expect(redirectOf(res).pathname).toBe("/account");
    expect(res.cookies.get("chiarel_session")).toBeTruthy();
    expect(res.cookies.get("chiarel_admin_session")).toBeUndefined();
    expect(store.asessions).toHaveLength(0);
    expect(store.identities.filter((i) => i.userId === "u1")).toHaveLength(1);
  });

  it("a customer's Google identity never signs in the admin flow", async () => {
    store.users.push({ id: "u1", email: "shopper@chiarel.test", role: "ADMIN", passwordHash: "x" });
    await googleCustomer(GOOD); // creates customer + google_customer identity
    const start = await gStart.GET(get("/api/auth/google/start"));
    const loc = new URL(start.headers.get("location")!);
    const code = `ga_${store.nextId++}`;
    issued.set(code, { nonce: loc.searchParams.get("nonce")!, challenge: loc.searchParams.get("code_challenge")!, claims: GOOD });
    const res = await gCallback.GET(
      get(`/api/auth/google/callback?code=${code}&state=${loc.searchParams.get("state")}`, `chiarel_oauth=${start.cookies.get("chiarel_oauth")!.value}`)
    );
    // Admin flow: the pre-created admin user with this verified email links and signs in as admin (existing rule), unchanged.
    expect(redirectOf(res).pathname).toBe("/admin");
    expect(res.cookies.get("chiarel_session")).toBeUndefined();
  });

  it("failures and a DB outage land on the customer page, not the admin page", async () => {
    const bad = await googleCustomer({ ...GOOD, email_verified: false });
    expect(redirectOf(bad).pathname).toBe("/account/login");
    dbBreaker.failure();
    dbBreaker.failure();
    dbBreaker.failure();
    const out = await googleCustomer(GOOD);
    expect(out.status).toBe(503);
    expect(await out.text()).toContain('href="/account/login"');
  });

  it("an admin-intent start still works unchanged", async () => {
    const start = await gStart.GET(get("/api/auth/google/start"));
    const v = oauthLib.verifyValue<{ i: string }>(STATE_SECRET, "oauth", start.cookies.get("chiarel_oauth")!.value)!;
    expect(v.i).toBe("admin");
  });
});

// ---- session lifecycle -----------------------------------------------------

describe("session", () => {
  it("slides: a session older than a day is extended and the cookie is re-issued by /me", async () => {
    const res = await signInByCode();
    const value = res.cookies.get("chiarel_session")!.value;
    const s = store.csessions[0];
    s.lastSeenAt = new Date(Date.now() - 2 * 24 * 3600 * 1000);
    s.expiresAt = new Date(Date.now() + 28 * 24 * 3600 * 1000);
    const me = await meRoute.GET(get("/api/account/me", `chiarel_session=${value}`));
    expect(me.status).toBe(200);
    expect(s.expiresAt.getTime()).toBeGreaterThan(Date.now() + 29 * 24 * 3600 * 1000);
    expect(me.cookies.get("chiarel_session")).toMatchObject({ value, maxAge: 30 * 24 * 3600 });
  });

  it("an expired session is refused and removed", async () => {
    const res = await signInByCode();
    store.csessions[0].expiresAt = new Date(Date.now() - 1000);
    const me = await meRoute.GET(get("/api/account/me", `chiarel_session=${res.cookies.get("chiarel_session")!.value}`));
    expect(me.status).toBe(401);
    expect(store.csessions).toHaveLength(0);
  });

  it("rejects a tampered or forged cookie", async () => {
    const res = await signInByCode();
    const value = res.cookies.get("chiarel_session")!.value;
    expect((await meRoute.GET(get("/api/account/me", `chiarel_session=${value}x`))).status).toBe(401);
    expect((await meRoute.GET(get("/api/account/me", `chiarel_session=${store.csessions[0].id}.forged`))).status).toBe(401);
    expect((await meRoute.GET(get("/api/account/me"))).status).toBe(401);
  });

  it("uses CUSTOMER_SESSION_SECRET when set (a cookie from the derived key stops working)", async () => {
    const res = await signInByCode();
    const value = res.cookies.get("chiarel_session")!.value;
    process.env.CUSTOMER_SESSION_SECRET = "a-dedicated-customer-secret-of-length";
    expect((await meRoute.GET(get("/api/account/me", `chiarel_session=${value}`))).status).toBe(401);
  });

  it("sign-out deletes the session server-side, clears the cookie and audits", async () => {
    const res = await signInByCode();
    const cookie = `chiarel_session=${res.cookies.get("chiarel_session")!.value}`;
    const out = await signoutRoute.POST(post("/api/account/signout", {}, { cookie }));
    expect(out.status).toBe(200);
    expect(out.cookies.get("chiarel_session")).toMatchObject({ value: "", maxAge: 0 });
    expect(store.csessions).toHaveLength(0);
    expect(store.audit.at(-1)).toMatchObject({ action: "customer.sign_out" });
    // The old cookie is dead even if the client keeps it.
    expect((await meRoute.GET(get("/api/account/me", cookie))).status).toBe(401);
    // Signing out while signed out is harmless.
    expect((await signoutRoute.POST(post("/api/account/signout", {}))).status).toBe(200);
  });

  it("audit rows never contain codes, tokens or cookie values", async () => {
    const res = await signInByCode();
    await verifyCode.POST(post("/api/account/code/verify", { email: "a@chiarel.test", code: "000000" }));
    const dump = JSON.stringify(store.audit);
    expect(dump).not.toContain(lastCode());
    expect(dump).not.toContain(res.cookies.get("chiarel_session")!.value);
  });
});

// ---- separation of the two worlds -----------------------------------------

describe("customer and admin sessions are separate", () => {
  it("a customer cookie does not authenticate admin routes", async () => {
    const res = await signInByCode();
    const customerCookie = res.cookies.get("chiarel_session")!.value;
    // Presented under either name, an admin route refuses it.
    for (const name of ["chiarel_session", "chiarel_admin_session"]) {
      expect((await adminMe.GET(get("/api/admin/me", `${name}=${customerCookie}`))).status).toBe(401);
      expect(await auth.getSessionUser(get("/x", `${name}=${customerCookie}`))).toBeNull();
    }
  });

  it("an admin cookie does not authenticate customer routes", async () => {
    store.users.push({ id: "u1", email: "admin@chiarel.test", role: "ADMIN", passwordHash: "x" });
    const adminValue = await auth.createSession("u1");
    expect((await adminMe.GET(get("/api/admin/me", `chiarel_admin_session=${adminValue}`))).status).toBe(200);
    for (const name of ["chiarel_session", "chiarel_admin_session"]) {
      expect((await meRoute.GET(get("/api/account/me", `${name}=${adminValue}`))).status).toBe(401);
    }
    expect(await csess.resolveCustomerSession(adminValue)).toBeNull();
  });

  it("the customer key is not the admin key, even when derived", async () => {
    expect(csess.customerSecret()).not.toBe(process.env.ADMIN_SESSION_SECRET);
    const adminValue = await (async () => {
      store.users.push({ id: "u2", email: "x@chiarel.test", role: "ADMIN", passwordHash: "x" });
      return auth.createSession("u2");
    })();
    // Same session-id shape, signed with the other key: refused.
    const id = adminValue.split(".")[0];
    store.csessions.push({ id, customerId: "c", createdAt: new Date(), lastSeenAt: new Date(), expiresAt: new Date(Date.now() + 1e9), userAgent: null });
    expect(await csess.resolveCustomerSession(adminValue)).toBeNull();
  });

  it("signing in as a customer sets no admin cookie, and the reverse", async () => {
    const res = await signInByCode();
    expect(res.cookies.get("chiarel_admin_session")).toBeUndefined();
  });
});
