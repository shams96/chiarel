# Admin RBAC — Tasks

Ordered per PLAN.md's sequencing. Each task is independently testable before the next starts.

1. **Schema**: add `Role` enum, `User`, `Session` models to `prisma/schema.prisma`; run `prisma migrate dev` (or `db push` if migrations aren't otherwise used in this repo — check existing convention first).
2. **Dependency**: add `bcrypt` + `@types/bcrypt` to `package.json`.
3. **Bootstrap**: extend `prisma/seed.ts` with the env-var-gated Admin upsert; add `BOOTSTRAP_ADMIN_EMAIL`/`BOOTSTRAP_ADMIN_PASSWORD` to `.env.example`.
4. **`lib/auth.ts`**: `getSessionUser`, `withRole`, session cookie helpers (set/clear), session-creation helper used by login.
5. **`app/api/admin/auth/login/route.ts`**: validate credentials, create session, set cookie.
6. **`app/api/admin/auth/logout/route.ts`**: delete session, clear cookie.
7. **`app/api/admin/users/route.ts`** (GET list, POST create) + **`app/api/admin/users/[id]/route.ts`** (PATCH role, DELETE) — all wrapped `withRole(["ADMIN"], ...)`.
8. **`app/admin/login/page.tsx`**: plain login form, no brand styling needed (internal tool).
9. **`app/admin/users/page.tsx`**: minimal Admin-only user list/management UI (calls the routes from #7; UI hides nothing security-relevant, since the API is the real boundary — this page just needs to not be broken for an Admin to use).
10. **Verify**: lint, typecheck, then an end-to-end manual check — bootstrap an Admin, log in, confirm a Member/Viewer session gets 403 from `/api/admin/users`, confirm logout invalidates the session (subsequent request 401).

Not included here: the dispute-dashboard routes (`/api/admin/disputes`) — those belong to the `dispute-risk-mitigation` spec's own tasks and will use `withRole` once this ships, per PLAN.md item 4's matrix.
