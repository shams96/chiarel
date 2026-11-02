# Tasks: Social sign-in (implement only after spec and plan are approved)

## Owner (blocking)
- [ ] Answer open questions 1-6 (plan.md section 9)
- [ ] Create Google OAuth consent screen and clients (plan.md section 6)
- [ ] Set `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `OAUTH_STATE_SECRET` in staging hPanel, then prod

## Phase A: admin Google login
- [ ] Prisma `Identity` model + additive SQL migration; `migrate diff` vs prod; apply to staging
- [ ] `lib/oauth-google.ts`: state/nonce/PKCE, token exchange, ID-token validation, JWKS cache (3 s timeout)
- [ ] `app/api/auth/google/start` and `/callback` (flag-gated, non-retrying error wrapper)
- [ ] Link-confirmation token + email (`lib/mail.ts`) and confirm route
- [ ] Audit actions: `auth.social_login`, `_failed`, `_link`, `_link_pending`, `_unlink`
- [ ] Rate limits on start/callback via `lib/rate-limit.ts`
- [ ] "Continue with Google" button on `app/admin/login/page.tsx` (hidden when flag off), neutral error states
- [ ] `tests/social-auth.test.ts` with mock issuer; mutation-check the no-auto-link rule
- [ ] Update `claudedocs/runbooks/database-outage.md`; add `social-login.md` runbook (provider outage, rotate secret, unlink a user)
- [ ] predeploy-security-audit pass; verify on staging (real Hostinger runtime); enable in prod

## Phase B
- [ ] Admin profile: link/unlink Google (re-auth), refuse unlinking the last method
- [ ] Invite flow for social sign-in; email-change re-verification

## Phase C (only if Q1 = yes)
- [ ] Separate spec: `CustomerAccount`, `chiarel_session`, real `/account`, Facebook/Apple, data-deletion page
