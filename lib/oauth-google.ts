import { createHmac, createPublicKey, createVerify, timingSafeEqual } from "crypto";
import * as oauth from "oauth4webapi";
import { SITE_URL } from "@/lib/seo";

// Google sign-in for the admin console (claudedocs/specs/social-signin/, Phase A).
// Hand-rolled OIDC on oauth4webapi: no session model of its own (the callback
// reuses createSession in lib/auth.ts), no provider tokens kept, no Google API
// calls after the ID token is checked. Everything here is inert unless the three
// env vars are set.

export const PROVIDER = "google";
export const OAUTH_COOKIE = "chiarel_oauth";
export const OAUTH_COOKIE_PATH = "/api/auth/google";
export const OAUTH_COOKIE_TTL_S = 10 * 60;
export const JWKS_TIMEOUT_MS = 3000;
const TOKEN_TIMEOUT_MS = 5000;

export const AUDIT = {
  login: "auth.social_login",
  failed: "auth.social_login_failed",
  link: "auth.social_link",
  unlink: "auth.social_unlink", // used by the Phase B profile page
} as const;

const GOOGLE_AS: oauth.AuthorizationServer = {
  issuer: "https://accounts.google.com",
  authorization_endpoint: "https://accounts.google.com/o/oauth2/v2/auth",
  token_endpoint: "https://oauth2.googleapis.com/token",
  jwks_uri: "https://www.googleapis.com/oauth2/v3/certs",
  id_token_signing_alg_values_supported: ["RS256"],
};

// Tests swap the network layer and the endpoints; production never does.
let fetchImpl: typeof fetch = (...a) => fetch(...a);
let as: oauth.AuthorizationServer = GOOGLE_AS;
export function __setProviderForTests(opts: { fetch?: typeof fetch; as?: oauth.AuthorizationServer } = {}) {
  if (process.env.NODE_ENV !== "test") throw new Error("test-only");
  fetchImpl = opts.fetch ?? ((...a) => fetch(...a));
  as = opts.as ?? GOOGLE_AS;
  jwks = null;
  jwksFetchedAt = 0;
}

export type GoogleConfig = { clientId: string; clientSecret: string; stateSecret: string };

/** The three env vars, or null when sign-in with Google is off. SOCIAL_LOGIN_ENABLED=0 is a kill switch. */
export function googleConfig(): GoogleConfig | null {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const stateSecret = process.env.OAUTH_STATE_SECRET;
  if (!clientId || !clientSecret || !stateSecret) return null;
  if (process.env.SOCIAL_LOGIN_ENABLED === "0") return null;
  return { clientId, clientSecret, stateSecret };
}

export function googleSignInEnabled(): boolean {
  return googleConfig() !== null;
}

/** Built from configuration, never from the request Host header. */
export function siteOrigin(): string {
  const override = process.env.OAUTH_REDIRECT_ORIGIN;
  if (override) {
    try {
      return new URL(override).origin;
    } catch {
      /* fall through to the canonical origin */
    }
  }
  return new URL(SITE_URL).origin;
}

export function redirectUri(): string {
  return `${siteOrigin()}/api/auth/google/callback`;
}

// ---- signed values (OAuth cookie) ------------------------------

function mac(secret: string, data: string): string {
  return createHmac("sha256", secret).update(data).digest("base64url");
}

export function signValue(secret: string, purpose: string, payload: Record<string, unknown>): string {
  const body = Buffer.from(JSON.stringify({ ...payload, p: purpose })).toString("base64url");
  return `${body}.${mac(secret, `${purpose}.${body}`)}`;
}

export function verifyValue<T extends Record<string, unknown>>(
  secret: string,
  purpose: string,
  value: string | undefined
): T | null {
  if (!value) return null;
  const [body, sig] = value.split(".");
  if (!body || !sig) return null;
  const expected = Buffer.from(mac(secret, `${purpose}.${body}`));
  const given = Buffer.from(sig);
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null;
  try {
    const parsed = JSON.parse(Buffer.from(body, "base64url").toString());
    if (parsed?.p !== purpose) return null;
    if (typeof parsed.exp !== "number" || parsed.exp < Date.now()) return null;
    return parsed as T;
  } catch {
    return null;
  }
}

// ---- authorization request -------------------------------------------------

export type OAuthCookie = { s: string; n: string; v: string; exp: number };

export async function buildAuthorization(cfg: GoogleConfig): Promise<{ url: string; cookie: string }> {
  const state = oauth.generateRandomState();
  const nonce = oauth.generateRandomNonce();
  const verifier = oauth.generateRandomCodeVerifier();
  const challenge = await oauth.calculatePKCECodeChallenge(verifier);

  const url = new URL(as.authorization_endpoint!);
  url.searchParams.set("client_id", cfg.clientId);
  url.searchParams.set("redirect_uri", redirectUri());
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid email profile");
  url.searchParams.set("state", state);
  url.searchParams.set("nonce", nonce);
  url.searchParams.set("code_challenge", challenge);
  url.searchParams.set("code_challenge_method", "S256");
  url.searchParams.set("prompt", "select_account");

  const cookie = signValue(cfg.stateSecret, "oauth", {
    s: state,
    n: nonce,
    v: verifier,
    exp: Date.now() + OAUTH_COOKIE_TTL_S * 1000,
  });
  return { url: url.toString(), cookie };
}

// ---- ID token verification -------------------------------------------------

type Jwk = { kid?: string; kty: string; n?: string; e?: string; alg?: string; use?: string };
let jwks: Jwk[] | null = null;
let jwksFetchedAt = 0;
const JWKS_TTL_MS = 60 * 60 * 1000;
const JWKS_REFETCH_COOLDOWN_MS = 60 * 1000;

async function loadJwks(force: boolean): Promise<Jwk[]> {
  const age = Date.now() - jwksFetchedAt;
  if (jwks && !force && age < JWKS_TTL_MS) return jwks;
  // An unknown kid triggers a refetch, but not more than once a minute, so a
  // forged kid cannot turn this route into a request amplifier toward Google.
  if (jwks && force && age < JWKS_REFETCH_COOLDOWN_MS) return jwks;
  const res = await fetchImpl(as.jwks_uri!, { signal: AbortSignal.timeout(JWKS_TIMEOUT_MS) });
  if (!res.ok) throw new Error("jwks_fetch_failed");
  const body = (await res.json()) as { keys?: Jwk[] };
  if (!Array.isArray(body.keys)) throw new Error("jwks_malformed");
  jwks = body.keys;
  jwksFetchedAt = Date.now();
  return jwks;
}

/** RS256 signature check against the issuer's published keys. Throws on any failure. */
export async function verifyIdTokenSignature(idToken: string): Promise<void> {
  const parts = idToken.split(".");
  if (parts.length !== 3) throw new Error("id_token_malformed");
  const header = JSON.parse(Buffer.from(parts[0], "base64url").toString());
  if (header.alg !== "RS256" || typeof header.kid !== "string") throw new Error("id_token_alg");
  let key = (await loadJwks(false)).find((k) => k.kid === header.kid);
  if (!key) key = (await loadJwks(true)).find((k) => k.kid === header.kid);
  if (!key || key.kty !== "RSA") throw new Error("id_token_unknown_key");
  const publicKey = createPublicKey({ key: key as never, format: "jwk" });
  const ok = createVerify("RSA-SHA256")
    .update(`${parts[0]}.${parts[1]}`)
    .verify(publicKey, Buffer.from(parts[2], "base64url"));
  if (!ok) throw new Error("id_token_signature");
}

export type GoogleProfile = { subject: string; email: string };

/**
 * Validates the callback and returns the verified identity. Throws on anything
 * wrong: state mismatch or provider error, failed code exchange (including a
 * replayed code), bad signature/iss/aud/exp/nonce, or an unverified email.
 * `requestUrl` is the full callback URL as received.
 */
export async function completeAuthorization(
  cfg: GoogleConfig,
  requestUrl: URL,
  cookie: OAuthCookie
): Promise<GoogleProfile> {
  const client: oauth.Client = { client_id: cfg.clientId };
  const params = oauth.validateAuthResponse(as, client, requestUrl, cookie.s);
  const response = await oauth.authorizationCodeGrantRequest(
    as,
    client,
    oauth.ClientSecretPost(cfg.clientSecret),
    params,
    redirectUri(),
    cookie.v,
    { [oauth.customFetch]: fetchImpl, signal: AbortSignal.timeout(TOKEN_TIMEOUT_MS) }
  );
  const result = await oauth.processAuthorizationCodeResponse(as, client, response, {
    expectedNonce: cookie.n,
    requireIdToken: true,
  });
  await verifyIdTokenSignature(result.id_token as string);
  const claims = oauth.getValidatedIdTokenClaims(result);
  const email = typeof claims?.email === "string" ? claims.email.trim().toLowerCase() : "";
  if (!claims || !claims.sub || !email) throw new Error("id_token_claims");
  if (claims.email_verified !== true) throw new Error("email_not_verified");
  return { subject: claims.sub, email };
}
