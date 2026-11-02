# Plan: Social sign-in

Phase 2 (How), grounded in spec.md. Repo facts read: `lib/auth.ts` (HMAC-signed cookie -> `Session` row), `withRole`, `lib/api-error.ts` + `lib/db-breaker.ts`, `lib/audit.ts` (`recordAuthEvent`), `lib/rate-limit.ts`, Prisma `User{email,passwordHash,role}`.

## 1. Library choice
| Option | Hostinger fit (~120 process cap) | Verdict |
|---|---|---|
| Auth.js v5 | Brings its own session/adapter model; would sit beside or replace our proven `Session` + `withRole`; Prisma adapter adds queries on the engine that has crashed under the cap; edge/middleware assumptions | No |
| Lucia | Deprecated as a library (now a learning resource) | No |
| Hand-rolled OIDC with `oauth4webapi` (or `openid-client`) | Pure JS, no extra process or DB engine; plugs into existing `createSession`/`withRole`; two small route handlers; we own the link rules | **Chosen** |
Inferred, not measured: library maintenance status and bundle size; verify at implement time.

## 2. Flow (Google)
`GET /api/auth/google/start`: generate state, nonce, PKCE verifier; keep them in a signed httpOnly cookie `chiarel_oauth` (Lax, 10 min, path-scoped); 302 to Google, `scope=openid email profile`.
`GET /api/auth/google/callback`: check state, exchange code with verifier, validate ID token (iss, aud, exp, nonce, JWKS signature), require `email_verified`. Then:
1. `Identity(provider, subject)` exists -> `createSession` -> audit `auth.social_login` -> redirect `/admin`.
2. Else signed-in session with `intent=link` (re-auth within 5 min) -> create Identity -> audit `auth.social_link`.
3. Else verified email matches an existing admin: do NOT link; email a one-time 15 min signed token (`lib/mail.ts`); link on click; audit `auth.social_link_pending`.
4. Else reject generically; audit `auth.social_login_failed`.
Callback uses `withApiErrorHandling`, but the authorization code is single use, so it must not be auto-retried: use a non-retrying variant.

## 3. Sessions
Reuse `createSession` and the cookie unchanged (`chiarel_admin_session`, 12 h). Provider tokens are not stored; no refresh tokens, no Google API calls. Customers (Phase C) get a separate cookie and table so a customer cookie can never satisfy `withRole`.

## 4. Data model (diff-and-backfill)
```
model Identity {
  id String @id @default(cuid()); createdAt DateTime @default(now())
  provider String; subject String; email String
  userId String; user User @relation(fields:[userId], references:[id], onDelete: Cascade)
  @@unique([provider, subject]); @@index([userId])
}
```
Additive only. `User.passwordHash` stays required (Q4 default). Phase C adds `CustomerAccount` and a nullable `customerId` on Identity. Practice: hand-written SQL in `prisma/migrations/<ts>_social_identity`, run `prisma migrate diff` against prod first (prod has had untracked objects twice), staging first, no backfill needed.

## 5. Redirect URIs and config
| Env | Callback |
|---|---|
| local | `http://localhost:3000/api/auth/google/callback` |
| staging | `https://staging.chiarel.com/api/auth/google/callback` |
| prod | `https://chiarel.com/api/auth/google/callback` |
Built from `lib/site-origin.ts`, never from the request Host. Env vars (hPanel only, never committed): `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `OAUTH_STATE_SECRET`. Flag `SOCIAL_LOGIN_ENABLED=1`; unset = button hidden, routes 404. One OAuth client for prod, one for staging + local.

## 6. Owner steps: Google Cloud Console
1. Create project "Chiarel". APIs & Services > OAuth consent screen > External.
2. App name `CHIAREL`; support email = business mailbox; app home `https://chiarel.com`; privacy `https://chiarel.com/privacy`; terms `https://chiarel.com/terms` (both pages exist); authorized domain `chiarel.com`; developer contact email; logo optional.
3. Scopes: `openid`, `userinfo.email`, `userinfo.profile` only (non-sensitive, no verification review).
4. Publish to Production (Testing mode caps 100 users).
5. Credentials > OAuth client ID > Web application; add the callback URIs above.
6. Put ID and secret in hPanel env vars, rebuild/restart. Never paste the secret in chat or git.
**Facebook (Phase C only):** developers.facebook.com > Create app (Consumer) > Facebook Login for Web; valid redirect `.../api/auth/facebook/callback`; privacy URL, terms URL, a data-deletion instructions URL (add a section to `/privacy`), app icon, category; set Live; `email` permission (standard access). Business verification may be requested.

## 7. DB-outage behaviour
`/admin/login` and the start route need no DB. The callback runs under the breaker: open breaker = immediate 503 + Retry-After and the generic retry message. JWKS fetch has a 3 s timeout and in-memory cache so a Google blip cannot hold processes. No workers or background jobs. Add a line to `claudedocs/runbooks/database-outage.md`.

## 8. Tests
`tests/social-auth.test.ts` with a mock OIDC issuer (no network), reusing the in-memory db store pattern of `tests/admin-auth.test.ts`. Cases: state mismatch, replayed code, bad nonce/aud/iss, unverified email, unknown email, verified match does NOT link without confirmation, confirmed link works, role never from provider, cannot unlink last method, breaker open -> 503, audit rows, rate limit. Mutation-check the no-auto-link rule. Playwright smoke against the mock issuer.

## Rollout
A: flag off -> staging -> link owner's account -> prod flag on. B: profile link/unlink and invites. C: only after Q1 and the Stripe live-mode decision. Rollback = unset the flag; Identity rows are inert.

## Risks
Takeover via email match (rules 1-3); Google account compromise = admin compromise (Q2); consent-screen misconfig blocks sign-in (test on staging); Facebook review delay; prod schema drift (diff first); OAuth cookie lost behind Hostinger proxy (verify `secure`/host on staging).

## 9. Open questions for the owner
1. Customer accounts at all? Recommend: **admin only now**; revisit when subscriptions need a portal.
2. Admin second factor? Recommend: keep password, add optional TOTP later; Google sign-in inherits Google 2-step.
3. Providers beyond Google? Recommend: **Google only**; Facebook/Apple only if customer accounts ship.
4. Social-only admins (no password)? Recommend: **no**; keep a password as break-glass.
5. Who may be invited for social sign-in? Recommend: only emails an ADMIN pre-invites; Gmail and Workspace both fine.
6. Link confirmation method? Recommend: emailed one-time link (works before first login) over password re-entry.
