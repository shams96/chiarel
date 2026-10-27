# Admin console P0: plan and tasks

Grounded in [SPEC.md](./SPEC.md) (A0.1 audit log, A0.2 admin shell, A0.3 session hygiene) and the existing patterns: `withRole` + `withApiErrorHandling` on every route, DB-backed sessions, Prisma migrations.

## Architecture decisions

**1. Audit log is a table written in the same transaction as the change.**
`AuditLog(id, createdAt, actorId?, actorEmail, action, entityType, entityId?, summary?, before Json?, after Json?, ip?)`. No foreign key to `User`: a deleted user must not delete the evidence, so the actor's email is snapshotted. Indexes on `createdAt`, `(actorId, createdAt)`, `(action, createdAt)`.
Data-changing admin routes use `db.$transaction([write, audit])`, so a change cannot commit without its audit row, and the audit row cannot exist for a change that rolled back. Append-only by construction: there is no update or delete route, and the only reader is `GET /api/admin/audit` (ADMIN).
Auth events (login, failed login, logout, password change) are logged best-effort: an audit outage must not lock the owner out. Failed logins store the attempted email, bounded by the existing login rate limits.

**2. Secrets never enter the log.** `before`/`after` carry only whitelisted fields (id, email, role, credit state). Helper `userSnapshot()` is the single place that picks them; it cannot return `passwordHash`. Tested.

**3. Admin shell is a client component, authorised by the API.** `GET /api/admin/me` (any role) returns email and role; the shell renders navigation from it. Hiding a link is convenience only; every route still enforces `withRole`. The login page renders without the shell.

**4. Session hygiene.** Admin can sign another user out everywhere and set a temporary password for another user (both revoke that user's sessions and are audited). Not applicable to self: self-service uses `/admin/account`, which avoids an admin locking out their own session by accident.

**5. Migration is additive only** (`CREATE TABLE`, indexes). Production drift rule: run `db:prod:status` before and after, and diff first. Applied to production only after the owner confirms.

## Tasks

1. Schema + migration + local apply.
2. `lib/audit.ts` (record helper, `userSnapshot`, client IP).
3. Instrument: user create / role change / delete, Founding 100 credit issue, login, failed login, logout, password change.
4. New routes: `GET /api/admin/me`, `GET /api/admin/audit`, `DELETE /api/admin/users/[id]/sessions`, `POST /api/admin/users/[id]/password`.
5. Also: cap passwords at 72 bytes on user creation (gap found in the password work).
6. UI: admin shell with role-based nav, dashboard at `/admin`, audit log page, users page actions, login redirects to `/admin`.
7. Tests per route, including that no entry contains a hash; mutation checks; tsc, lint, full suite, build.
8. Runbook update; security pass; PR; migration; deploy; verify on production.

## Known limits

- The in-memory rate limiter is per server instance.
- The audit log has no retention or export yet (P3 if needed).
