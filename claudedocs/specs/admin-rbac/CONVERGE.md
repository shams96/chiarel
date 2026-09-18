# Admin RBAC — Converge

Checked against SPEC.md's "what solved looks like," not just against the plan.

- ✅ **"A `User` record with a `role` field is the only source of truth"** — confirmed;
  no other place in the code makes an authorization decision.
- ✅ **"Every internal API route explicitly declares which role(s) may call it"** —
  the four shipped routes (`login`, `logout`, `users` GET/POST, `users/[id]` PATCH/DELETE)
  all use `withRole`; `login`/`logout` are intentionally unauthenticated (you can't
  require a session to create one) but that's a deliberate, reviewable exception
  stated in the code, not an oversight.
- ✅ **"Rejected server-side regardless of what the UI shows"** — verified directly
  with `curl`, bypassing the UI entirely: 401 with no session, 403 with the wrong
  role, 200 with the right one. The UI was never part of the test.
- ✅ **"Deny-by-default... a route missing a role check is visibly wrong"** —
  `withRole`'s allowed-roles argument is required with no default/bypass variant;
  confirmed by reading the wrapper, not just asserting it.
- ✅ **Storefront untouched** — the confirmed scope boundary from SPEC.md. Verified:
  `git diff --stat` shows zero changes to `app/api/cart`, `app/api/checkout`,
  `app/api/products`, `app/api/founding-list`, or `app/api/webhooks/stripe`.

## Honest gaps, not glossed over

- **No password reset flow.** If an Admin forgets their password, there's currently
  no self-service recovery — the only path is another Admin deleting and recreating
  the account, or a direct DB fix. Not in SPEC.md's scope, but worth naming now
  rather than discovering it at a bad moment. Flagging as a candidate for a small
  follow-up spec if it becomes a real problem.
- **No audit log of role changes.** SPEC.md explicitly scoped out row-level
  permissions, but a log of "who changed whose role, when" wasn't discussed either
  way. Not built. Low cost to add later (a `RoleChangeLog` table) if you want it —
  not adding it speculatively now.
- **Session TTL (12h) is a judgment call, not a spec'd number.** Reasonable for an
  internal tool, but arbitrary — say if you want it shorter/longer.
- **No rate limiting on `/api/admin/auth/login`.** A brute-force attempt against a
  known email isn't currently throttled. Worth closing before this is
  internet-reachable with real accounts — flagging for the predeploy-security-audit
  pass rather than building it speculatively into this spec's scope.
- **The `/admin` routes themselves aren't currently linked from anywhere** —
  reachable only by typing the URL. That's fine for now (matches "not
  customer-facing"), but means there's no discovery path for a new team member
  without being told the URL directly.

## Test artifacts

Verified live against `localhost:4600` with `curl` (bypassing the UI to test the real
boundary): unauthenticated access (401), wrong-role access to an Admin-only route
(403), correct-role access (200), logout genuinely invalidating the session server-side
(not just clearing the client cookie — confirmed the *same* cookie fails after logout),
and the last-Admin self-demotion guard. All test accounts and sessions created during
verification were deleted afterward; no test data remains in the database.
