# Spec: Social sign-in (Google first)

Status: DRAFT for owner review. Phase 1 (Specify). No code yet.

## Problem
Owner: "I should be able to create, change and log in with existing Gmail, Facebook etc." Today: admin login is email + bcrypt password (`app/api/admin/auth/login`), DB-backed session (`lib/auth.ts`, 12 h), RBAC `User` table (ADMIN/MEMBER/VIEWER), audit log. Customers have **no accounts**: checkout is guest-only and `app/account` is a preview page (PRD F14, section 6). Two different surfaces, so scope is split.

## Scope
**In (Phase A, admin):** "Continue with Google" on `/admin/login` for admins that already exist. Password login stays.
**In (Phase B, admin):** link / unlink a Google identity from the admin's own profile; an ADMIN can pre-invite an email for social sign-in.
**In (Phase C, customer, conditional on Q1):** optional customer accounts via Google (Apple/Facebook if Q3 says yes) so `/account` becomes real. Guest checkout stays the default; an account is never required to buy.
**Out:** magic link, SMS, SAML/SSO, social login at checkout, Google scopes beyond `openid email profile`, subscription management itself (separate spec), live-mode Stripe.

## Providers
Google first (OIDC, `email_verified` claim, no review for basic scopes). Facebook: OAuth2 not OIDC, email may be missing or unverified, app review needed: optional, Phase C only. Apple: only mandatory for native apps; this is web-only, so optional.

## Meaning of "create / change / log in"
- **Create:** customers self-sign-up by first social login (Phase C). Admins are never self-created: an ADMIN invites an email (existing `app/api/admin/users`); the invitee may then sign in with Google.
- **Log in:** button on `/admin/login` (customer sign-in page in Phase C).
- **Change:** (a) switch the linked Google account (unlink, then link; needs a fresh sign-in), (b) change email (re-verified), (c) change or set password (exists: `app/api/admin/auth/password`).

## Security requirements (non-negotiable)
1. **No auto-link on email match.** A social identity attaches to an existing `User` only when (a) the provider reports `email_verified=true`, AND (b) the email equals a pre-existing admin row (the allowlist), AND (c) the first link is confirmed by a signed-in session or a one-time emailed token to that address. Otherwise reject with a generic error.
2. **Admin social login is allowlist-only.** An unknown Google account never creates an admin. Role comes from the existing row, never from the provider.
3. Stable key is `(provider, providerSubject)`, never email alone.
4. State + PKCE + nonce on every flow; exact redirect-URI match; one-time state cookie, 10 min TTL.
5. Sessions stay DB-backed so deleting a row or changing a role takes effect immediately; same cookie hardening as today.
6. Every link, unlink, social login and failure writes an AuditLog row (no tokens).
7. Providers with unverified or absent email never link to admins.

## Failure behaviour
- DB down: callback fails with the standard 503 + Retry-After via `withApiErrorHandling` and the breaker; login page shows the existing generic "try again" message.
- Provider down or user cancels: back to `/admin/login?error=social` with a neutral message. Password login is unaffected by provider outages.

## Acceptance
- An existing admin with a matching verified Google email can link once (confirmed), then sign in with Google; the session is identical to a password session.
- Unknown or unverified Google accounts get nothing and leave an audit row.
- Password login, rate limits and all existing `tests/admin-auth.test.ts` behaviour unchanged.
- No new process or thread pressure on Hostinger (plan.md).

## Open questions
Six, each with a recommended default: plan.md section 9.

## Decision change 2026-11-02

No email confirmation. A verified Google email that matches a pre-existing (admin-created) user binds the Google `sub` to that user and signs in immediately, as in Auth.js/Firebase/Okta; the admin allowlist is the control. The confirm route, link token and pending-link audit action were removed. This supersedes the earlier "never link automatically" default in this spec and plan.md.
