import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { createHash, generateKeyPairSync, sign as cryptoSign, type KeyObject } from "crypto";

process.env.ADMIN_SESSION_SECRET = "unit-test-secret-unit-test-secret";
const CLIENT_ID = "test-client.apps.example";
const CLIENT_SECRET = "test-client-secret";
const STATE_SECRET = "oauth-state-secret-oauth-state-secret";
const ISSUER = "https://accounts.google.com";

type U = { id: string; email: string; role: "ADMIN" | "MEMBER" | "VIEWER"; passwordHash: string };
type I = { id: string; provider: string; subject: string; email: string; userId: string };
const store = {
  users: [] as U[],
  identities: [] as I[],
  sessions: [] as { id: string; userId: string; expiresAt: Date }[],
  audit: [] as { action: string; actorEmail: string; summary?: string }[],
  mails: [] as { to: string; subject: string; text: string }[],
  limited: [] as string[],
  dbError: null as unknown,
  mailFails: false,
  nextId: 1,
};

vi.mock("@/lib/rate-limit", () => ({
  isRateLimited: (key: string) => store.limited.some((p) => key.startsWith(p)),
  clientIp: () => "9.9.9.9",
}));
vi.mock("@/lib/mail", () => ({
  sendMail: async (m: { to: string; subject: string; text: string }) => {
    if (store.mailFails) throw new Error("smtp down");
    store.mails.push(m);
  },
}));
vi.mock("@/lib/db", async () => {
  // Like the real proxy, asking for the database while the breaker is open fails at once.
  const { dbBreaker } = await import("@/lib/db-client");
  const { DbUnavailableError } = await import("@/lib/db-resilience");
  const gate = () => {
    if (!dbBreaker.tryAcquire()) throw new DbUnavailableError(dbBreaker.retryAfterSeconds());
    if (store.dbError) throw store.dbError;
  };
  return {
    db: {
      auditLog: {
        create: async ({ data }: { data: { action: string; actorEmail: string; summary?: string } }) => {
          store.audit.push(data);
          return data;
        },
      },
      session: {
        create: async ({ data }: { data: { userId: string; expiresAt: Date } }) => {
          const s = { id: `sess_${store.nextId++}`, ...data };
          store.sessions.push(s);
          return s;
        },
        findUnique: async ({ where }: { where: { id: string } }) => {
          const s = store.sessions.find((x) => x.id === where.id);
          return s ? { ...s, user: store.users.find((u) => u.id === s.userId)! } : null;
        },
        delete: async () => undefined,
      },
      user: {
        findUnique: async ({ where }: { where: { id?: string; email?: string } }) => {
          gate();
          const u = store.users.find((x) => (where.id ? x.id === where.id : x.email === where.email));
          return u ? { ...u } : null;
        },
      },
      identity: {
        findUnique: async ({ where }: { where: { provider_subject: { provider: string; subject: string } } }) => {
          gate();
          const k = where.provider_subject;
          const i = store.identities.find((x) => x.provider === k.provider && x.subject === k.subject);
          return i ? { ...i, user: { ...store.users.find((u) => u.id === i.userId)! } } : null;
        },
        create: async ({ data }: { data: Omit<I, "id"> }) => {
          if (store.identities.some((x) => x.provider === data.provider && x.subject === data.subject)) {
            throw Object.assign(new Error("unique"), { code: "P2002" });
          }
          const i = { id: `ident_${store.nextId++}`, ...data };
          store.identities.push(i);
          return i;
        },
      },
    },
  };
});

const oauthLib = await import("@/lib/oauth-google");
const { dbBreaker } = await import("@/lib/db-client");
const auth = await import("@/lib/auth");
const startRoute = await import("@/app/api/auth/google/start/route");
const callbackRoute = await import("@/app/api/auth/google/callback/route");
const confirmRoute = await import("@/app/api/auth/google/confirm/route");

// ---- mock OIDC issuer: token endpoint + JWKS, no network -------------------

const keys = generateKeyPairSync("rsa", { modulusLength: 2048 });
const otherKeys = generateKeyPairSync("rsa", { modulusLength: 2048 });
const jwk = { ...keys.publicKey.export({ format: "jwk" }), kid: "k1", alg: "RS256", use: "sig" };

const b64 = (o: unknown) => Buffer.from(JSON.stringify(o)).toString("base64url");
function jwt(claims: Record<string, unknown>, key: KeyObject = keys.privateKey, kid = "k1") {
  const head = `${b64({ alg: "RS256", typ: "JWT", kid })}.${b64(claims)}`;
  return `${head}.${cryptoSign("RSA-SHA256", Buffer.from(head), key).toString("base64url")}`;
}

type Issued = { nonce: string; challenge: string; claims: Record<string, unknown>; key: KeyObject; kid: string };
const issuer = { codes: new Map<string, Issued>(), tokenCalls: 0, jwksCalls: 0, jwksFails: false, lastJwksSignal: undefined as AbortSignal | undefined };

const mockFetch = (async (input: unknown, init?: RequestInit) => {
  const url = String(input);
  if (url === "https://www.googleapis.com/oauth2/v3/certs") {
    issuer.jwksCalls++;
    issuer.lastJwksSignal = init?.signal ?? undefined;
    if (issuer.jwksFails) throw new DOMException("timed out", "TimeoutError");
    return Response.json({ keys: [jwk] });
  }
  if (url === "https://oauth2.googleapis.com/token") {
    issuer.tokenCalls++;
    const p = new URLSearchParams(String(init?.body));
    const code = p.get("code") ?? "";
    const issued = issuer.codes.get(code);
    issuer.codes.delete(code); // single use
    const verifierHash = createHash("sha256").update(p.get("code_verifier") ?? "").digest("base64url");
    if (
      !issued ||
      p.get("grant_type") !== "authorization_code" ||
      p.get("redirect_uri") !== oauthLib.redirectUri() ||
      verifierHash !== issued.challenge ||
      p.get("client_secret") !== CLIENT_SECRET ||
      p.get("client_id") !== CLIENT_ID
    ) {
      return Response.json({ error: "invalid_grant" }, { status: 400 });
    }
    const now = Math.floor(Date.now() / 1000);
    const claims = { iss: ISSUER, aud: CLIENT_ID, iat: now, exp: now + 300, nonce: issued.nonce, ...issued.claims };
    return Response.json({ access_token: "at", token_type: "Bearer", expires_in: 3600, id_token: jwt(claims, issued.key, issued.kid) });
  }
  return new Response("nope", { status: 404 });
}) as unknown as typeof fetch;

// ---- helpers ---------------------------------------------------------------

const get = (url: string, cookie?: string) =>
  new NextRequest(`http://localhost${url}`, { headers: cookie ? { cookie } : {} });

async function startFlow() {
  const res = await startRoute.GET(get("/api/auth/google/start"));
  const loc = new URL(res.headers.get("location")!);
  return {
    res,
    loc,
    cookie: res.cookies.get("chiarel_oauth")!.value,
    state: loc.searchParams.get("state")!,
    nonce: loc.searchParams.get("nonce")!,
    challenge: loc.searchParams.get("code_challenge")!,
  };
}

type Overrides = { claims?: Record<string, unknown>; key?: KeyObject; kid?: string; state?: string };
async function signInWithGoogle(claims: Record<string, unknown>, o: Overrides = {}) {
  const f = await startFlow();
  const code = `code_${store.nextId++}`;
  issuer.codes.set(code, {
    nonce: f.nonce,
    challenge: f.challenge,
    claims: { ...claims, ...(o.claims ?? {}) },
    key: o.key ?? keys.privateKey,
    kid: o.kid ?? "k1",
  });
  const cb = () => callbackRoute.GET(get(`/api/auth/google/callback?code=${code}&state=${o.state ?? f.state}`, `chiarel_oauth=${f.cookie}`));
  return { res: await cb(), replay: cb, flow: f, code };
}

const addUser = (id: string, role: U["role"] = "ADMIN", email = `${id}@chiarel.test`) =>
  store.users.push({ id, email, role, passwordHash: "x" });
const link = (userId: string, subject: string) =>
  store.identities.push({ id: `i_${store.nextId++}`, provider: "google", subject, email: "x", userId });
const loc = (res: Response) => new URL(res.headers.get("location")!);
const failedAudits = () => store.audit.filter((a) => a.action === "auth.social_login_failed");

function expectNoSignIn(res: Response) {
  expect(res.status).toBe(303);
  expect(loc(res).pathname).toBe("/admin/login");
  expect(res.headers.get("set-cookie") ?? "").not.toContain("chiarel_admin_session=");
  expect(store.sessions).toHaveLength(0);
}

beforeEach(() => {
  Object.assign(store, { users: [], identities: [], sessions: [], audit: [], mails: [], limited: [], dbError: null, mailFails: false, nextId: 1 });
  Object.assign(issuer, { codes: new Map(), tokenCalls: 0, jwksCalls: 0, jwksFails: false, lastJwksSignal: undefined });
  process.env.GOOGLE_CLIENT_ID = CLIENT_ID;
  process.env.GOOGLE_CLIENT_SECRET = CLIENT_SECRET;
  process.env.OAUTH_STATE_SECRET = STATE_SECRET;
  delete process.env.SOCIAL_LOGIN_ENABLED;
  delete process.env.OAUTH_REDIRECT_ORIGIN;
  dbBreaker.success();
  oauthLib.__setProviderForTests({ fetch: mockFetch });
  vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => {
  dbBreaker.success();
  vi.restoreAllMocks();
});

const GOOD = { sub: "g-sub-1", email: "a@chiarel.test", email_verified: true };

// ---- tests -----------------------------------------------------------------

describe("feature flag", () => {
  it.each(["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET", "OAUTH_STATE_SECRET"])("is off when %s is unset", async (name) => {
    delete process.env[name];
    expect(oauthLib.googleSignInEnabled()).toBe(false);
    expect((await startRoute.GET(get("/api/auth/google/start"))).status).toBe(404);
    expect((await callbackRoute.GET(get("/api/auth/google/callback?code=x&state=y"))).status).toBe(404);
    expect((await confirmRoute.GET(get("/api/auth/google/confirm?token=x"))).status).toBe(404);
  });

  it("has a kill switch", () => {
    process.env.SOCIAL_LOGIN_ENABLED = "0";
    expect(oauthLib.googleSignInEnabled()).toBe(false);
  });
});

describe("start", () => {
  it("redirects to Google with state, nonce and an S256 challenge, and sets a hardened cookie", async () => {
    const f = await startFlow();
    expect(f.res.status).toBe(302);
    expect(f.loc.origin + f.loc.pathname).toBe("https://accounts.google.com/o/oauth2/v2/auth");
    expect(f.loc.searchParams.get("client_id")).toBe(CLIENT_ID);
    expect(f.loc.searchParams.get("redirect_uri")).toBe("https://chiarel.com/api/auth/google/callback");
    expect(f.loc.searchParams.get("response_type")).toBe("code");
    expect(f.loc.searchParams.get("scope")).toBe("openid email profile");
    expect(f.loc.searchParams.get("code_challenge_method")).toBe("S256");
    expect(f.state.length).toBeGreaterThan(20);
    expect(f.nonce.length).toBeGreaterThan(20);
    const c = f.res.cookies.get("chiarel_oauth")!;
    expect(c).toMatchObject({ httpOnly: true, sameSite: "lax", path: "/api/auth/google", maxAge: 600 });
  });

  it("builds the redirect URI from config, never from the request Host", async () => {
    const res = await startRoute.GET(
      new NextRequest("http://evil.example/api/auth/google/start", { headers: { host: "evil.example" } })
    );
    expect(new URL(res.headers.get("location")!).searchParams.get("redirect_uri")).toBe("https://chiarel.com/api/auth/google/callback");
    process.env.OAUTH_REDIRECT_ORIGIN = "https://staging.chiarel.com";
    const staged = await startFlow();
    expect(staged.loc.searchParams.get("redirect_uri")).toBe("https://staging.chiarel.com/api/auth/google/callback");
  });

  it("is rate limited", async () => {
    store.limited = ["google-start:"];
    const res = await startRoute.GET(get("/api/auth/google/start"));
    expect(loc(res).searchParams.get("notice")).toBe("rate_limited");
  });
});

describe("callback: signing in", () => {
  it("signs in an already linked identity, with the role from the database, and audits it", async () => {
    addUser("m", "MEMBER", "a@chiarel.test");
    link("m", "g-sub-1");
    // The provider claiming a role changes nothing.
    const { res } = await signInWithGoogle({ ...GOOD, role: "ADMIN", hd: "chiarel.com" });
    expect(res.status).toBe(303);
    expect(loc(res).pathname).toBe("/admin");
    const cookie = res.cookies.get("chiarel_admin_session")!;
    expect(cookie).toMatchObject({ httpOnly: true, sameSite: "lax" });
    expect(store.sessions).toHaveLength(1);
    const user = await auth.getSessionUser(get("/x", `chiarel_admin_session=${cookie.value}`));
    expect(user).toMatchObject({ id: "m", role: "MEMBER" });
    expect(store.audit.map((a) => a.action)).toEqual(["auth.social_login"]);
  });

  it("signs in by subject even if the Google email has since changed", async () => {
    addUser("a");
    link("a", "g-sub-1");
    const { res } = await signInWithGoogle({ ...GOOD, email: "renamed@elsewhere.test" });
    expect(loc(res).pathname).toBe("/admin");
  });

  it("exchanges the code exactly once and never retries on a database failure", async () => {
    store.dbError = Object.assign(new Error("can't reach"), { code: "P1001" });
    const { res } = await signInWithGoogle(GOOD);
    expect(res.status).toBe(503);
    expect(res.headers.get("content-type")).toContain("text/html");
    expect(issuer.tokenCalls).toBe(1);
    expect(store.sessions).toHaveLength(0);
  });

  it("answers an open breaker with an immediate 503 and Retry-After, without crashing", async () => {
    dbBreaker.failure();
    dbBreaker.failure();
    dbBreaker.failure();
    addUser("a");
    link("a", "g-sub-1");
    const { res } = await signInWithGoogle(GOOD);
    expect(res.status).toBe(503);
    expect(Number(res.headers.get("retry-after"))).toBeGreaterThan(0);
    expect(await res.text()).toContain("temporarily unavailable");
    expect(store.sessions).toHaveLength(0);
  });
});

describe("callback: rejections are neutral and sign nobody in", () => {
  beforeEach(() => {
    addUser("a");
    link("a", "g-sub-1");
  });

  async function rejected(claims: Record<string, unknown>, o: Overrides = {}) {
    const { res } = await signInWithGoogle({ ...GOOD, ...claims }, o);
    expectNoSignIn(res);
    expect(loc(res).searchParams.get("notice")).toBe("failed");
    expect(failedAudits()).toHaveLength(1);
  }

  it("rejects a state mismatch", async () => {
    const { res } = await signInWithGoogle(GOOD, { state: "not-the-state" });
    expectNoSignIn(res);
    expect(issuer.tokenCalls).toBe(0);
  });

  it("rejects a missing, tampered or foreign-secret state cookie", async () => {
    const f = await startFlow();
    const noCookie = await callbackRoute.GET(get(`/api/auth/google/callback?code=c&state=${f.state}`));
    expectNoSignIn(noCookie);
    const tampered = await callbackRoute.GET(get(`/api/auth/google/callback?code=c&state=${f.state}`, `chiarel_oauth=${f.cookie}x`));
    expectNoSignIn(tampered);
    const forged = oauthLib.signValue("some-other-secret", "oauth", { s: f.state, n: f.nonce, v: "v", exp: Date.now() + 60_000 });
    expectNoSignIn(await callbackRoute.GET(get(`/api/auth/google/callback?code=c&state=${f.state}`, `chiarel_oauth=${forged}`)));
    expect(issuer.tokenCalls).toBe(0);
  });

  it("rejects an expired state cookie", async () => {
    const f = await startFlow();
    const expired = oauthLib.signValue(STATE_SECRET, "oauth", { s: f.state, n: f.nonce, v: "v", exp: Date.now() - 1 });
    expectNoSignIn(await callbackRoute.GET(get(`/api/auth/google/callback?code=c&state=${f.state}`, `chiarel_oauth=${expired}`)));
  });

  it("rejects a provider error response", async () => {
    const f = await startFlow();
    const res = await callbackRoute.GET(get(`/api/auth/google/callback?error=access_denied&state=${f.state}`, `chiarel_oauth=${f.cookie}`));
    expectNoSignIn(res);
  });

  it("rejects a replayed code", async () => {
    const first = await signInWithGoogle(GOOD);
    expect(loc(first.res).pathname).toBe("/admin");
    const again = await first.replay();
    expect(loc(again).pathname).toBe("/admin/login");
    expect(store.sessions).toHaveLength(1);
  });

  it("rejects a wrong nonce", () => rejected({ nonce: "someone-elses-nonce" }));
  it("rejects a wrong audience", () => rejected({ aud: "another-client" }));
  it("rejects a wrong issuer", () => rejected({ iss: "https://evil.example" }));
  it("rejects an expired token", () => rejected({ exp: Math.floor(Date.now() / 1000) - 3600 }));
  it("rejects a bad signature", () => rejected({}, { key: otherKeys.privateKey }));
  it("rejects an unknown signing key id", () => rejected({}, { kid: "nope" }));
  it("rejects an unverified email", () => rejected({ email_verified: false }));
  it("rejects a token with no email_verified claim", () => rejected({ email_verified: undefined }));
  it("rejects a token with no subject", () => rejected({ sub: undefined }));

  it("fails closed when the key set cannot be fetched in time, passing a timeout signal", async () => {
    issuer.jwksFails = true;
    const { res } = await signInWithGoogle(GOOD);
    expectNoSignIn(res);
    expect(issuer.lastJwksSignal).toBeInstanceOf(AbortSignal);
  });

  it("caches the key set between sign-ins", async () => {
    await signInWithGoogle(GOOD);
    await signInWithGoogle(GOOD);
    expect(issuer.jwksCalls).toBe(1);
  });
});

describe("callback: no automatic linking", () => {
  it("a verified email matching an existing user does NOT link or sign in; it emails a confirmation", async () => {
    addUser("a", "ADMIN", "a@chiarel.test");
    const { res } = await signInWithGoogle(GOOD);
    expectNoSignIn(res);
    expect(loc(res).searchParams.get("notice")).toBe("eligible");
    expect(store.identities).toHaveLength(0);
    expect(store.mails).toHaveLength(1);
    expect(store.mails[0].to).toBe("a@chiarel.test");
    expect(store.mails[0].text).toContain("/api/auth/google/confirm?token=");
    expect(store.audit.map((a) => a.action)).toEqual(["auth.social_link_pending"]);
  });

  it("an unknown email gets the same visible outcome and no email, identity or session", async () => {
    addUser("a", "ADMIN", "a@chiarel.test");
    const known = await signInWithGoogle(GOOD);
    const unknown = await signInWithGoogle({ ...GOOD, sub: "g-sub-2", email: "stranger@gmail.test" });
    expect(loc(unknown.res).search).toBe(loc(known.res).search);
    expect(store.mails).toHaveLength(1); // only the known address was mailed
    expect(store.identities).toHaveLength(0);
    expect(failedAudits()[0].summary).toBe("Google sign-in failed (unknown_email)");
  });

  it("never creates a user", async () => {
    await signInWithGoogle({ ...GOOD, email: "new@gmail.test" });
    expect(store.users).toHaveLength(0);
  });

  it("still reports neutrally if the confirmation email cannot be sent", async () => {
    addUser("a");
    store.mailFails = true;
    const { res } = await signInWithGoogle(GOOD);
    expect(loc(res).searchParams.get("notice")).toBe("eligible");
    expect(store.identities).toHaveLength(0);
  });

  it("caps confirmation emails per user and per request", async () => {
    addUser("a");
    store.limited = ["google-link-mail:"];
    const { res } = await signInWithGoogle(GOOD);
    expect(loc(res).searchParams.get("notice")).toBe("rate_limited");
    expect(store.mails).toHaveLength(0);
    store.limited = ["google-cb:"];
    const cb = await signInWithGoogle(GOOD);
    expect(loc(cb.res).searchParams.get("notice")).toBe("rate_limited");
    expect(issuer.tokenCalls).toBe(1); // the second request never reached the provider
  });
});

describe("link confirmation", () => {
  const cfg = () => oauthLib.googleConfig()!;
  const tokenFromMail = () => new URL(store.mails[0].text.match(/https:\/\/\S+/)![0]).searchParams.get("token")!;
  const post = (token: string) =>
    confirmRoute.POST(
      new NextRequest("http://localhost/api/auth/google/confirm", {
        method: "POST",
        body: new URLSearchParams({ token }),
        headers: { "content-type": "application/x-www-form-urlencoded" },
      })
    );

  it("links only on POST; a GET (link preview, email scanner) changes nothing", async () => {
    addUser("a");
    await signInWithGoogle(GOOD);
    const token = tokenFromMail();
    const page = await confirmRoute.GET(get(`/api/auth/google/confirm?token=${encodeURIComponent(token)}`));
    expect(page.status).toBe(200);
    expect(await page.text()).toContain("<form");
    expect(store.identities).toHaveLength(0);
  });

  it("then lets that Google account sign in, and is harmless if clicked twice", async () => {
    addUser("a");
    await signInWithGoogle(GOOD);
    const token = tokenFromMail();
    const res = await post(token);
    expect(loc(res).searchParams.get("notice")).toBe("linked");
    expect(store.identities).toEqual([expect.objectContaining({ provider: "google", subject: "g-sub-1", userId: "a" })]);
    expect(store.audit.map((a) => a.action)).toContain("auth.social_link");
    expect(loc(await post(token)).searchParams.get("notice")).toBe("linked");
    expect(store.identities).toHaveLength(1);

    const { res: login } = await signInWithGoogle(GOOD);
    expect(loc(login).pathname).toBe("/admin");
  });

  it("rejects tampered, expired, wrong-purpose and garbage tokens", async () => {
    addUser("a");
    const good = oauthLib.createLinkToken(cfg(), { uid: "a", sub: "s", email: "a@chiarel.test" });
    const expired = oauthLib.signValue(STATE_SECRET, "link", { uid: "a", sub: "s", email: "a@chiarel.test", exp: Date.now() - 1 });
    const wrongPurpose = oauthLib.signValue(STATE_SECRET, "oauth", { uid: "a", sub: "s", email: "a@chiarel.test", exp: Date.now() + 60_000 });
    for (const t of [good + "x", expired, wrongPurpose, "garbage", ""]) {
      expect(loc(await post(t)).searchParams.get("notice")).toBe("link_invalid");
    }
    expect(store.identities).toHaveLength(0);
  });

  it("rejects a token whose user changed email since it was sent", async () => {
    addUser("a");
    const token = oauthLib.createLinkToken(cfg(), { uid: "a", sub: "s", email: "old@chiarel.test" });
    expect(loc(await post(token)).searchParams.get("notice")).toBe("link_invalid");
    expect(store.identities).toHaveLength(0);
  });

  it("refuses to move a Google account that is already linked to someone else", async () => {
    addUser("a");
    addUser("b");
    link("b", "s");
    const token = oauthLib.createLinkToken(cfg(), { uid: "a", sub: "s", email: "a@chiarel.test" });
    expect(loc(await post(token)).searchParams.get("notice")).toBe("link_invalid");
    expect(store.identities.map((i) => i.userId)).toEqual(["b"]);
  });
});
