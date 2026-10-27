# Admin password change and production bootstrap

Extends [admin-rbac](../admin-rbac/SPEC.md). Compressed spec + plan + tasks for a small, security-sensitive feature.

## Problem

Production (`chiarel.com/admin/login`) has zero users, so nobody can sign in, and no signed-in user can change their own password. Accounts exist only through the one-time seed or an existing Admin.

## Solved when

1. An Admin account exists in production and can sign in at `/admin/login`.
2. Any signed-in user (ADMIN, MEMBER, VIEWER) can change their own password in the UI.
3. Nobody can change another user's password through this path.
4. The initial password is temporary and never committed or logged.

Out of scope: email-based forgot-password (no mailer in the admin surface), 2FA, forced rotation flag (no schema change, to avoid a production migration), Admin resetting another user's password.

## Plan

- `POST /api/admin/auth/password`, wrapped in `withRole(["ADMIN","MEMBER","VIEWER"])` so the deny-by-default guard test covers it.
  - Target is always the session user. No user id is accepted from the request.
  - Requires the current password (a stolen cookie alone cannot take the account over).
  - New password at least 12 characters (same rule as account creation) and different from the current one.
  - Throttled per user id: 5 attempts per 15 minutes.
  - On success every other session for that user is deleted; the current one stays.
- `/admin/account` page, linked from `/admin/users`.
- `scripts/create-admin.mjs`: creates or resets one account from `BOOTSTRAP_ADMIN_EMAIL` / `BOOTSTRAP_ADMIN_PASSWORD` in the environment, run from the operator's machine. The password is read from the environment, never from argv, never printed.
- Runbook: `claudedocs/runbooks/admin-access.md`.

## Tasks

1. Route + tests (auth required, each role, wrong current, short/unchanged, session revocation, throttle).
2. Account page + link.
3. Bootstrap script.
4. Runbook.
5. Security review of the route, full test suite, tsc, lint, build.
6. PR, merge, deploy, create the production Admin, verify sign-in and a password change against production.

## Known limits

- Rate limiting is in-process memory (existing `lib/rate-limit`): per server instance, resets on restart.
- Sessions last 12 hours.
- No forced change on first login: the operator is told to change it immediately.
