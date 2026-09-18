# Admin RBAC (Admin / Member / Viewer) — Spec

**Trigger:** user wants role-based access control for Chiarel's internal/admin surface —
3 roles, enforced only at the API layer (UI is never the security boundary), with a
deny-by-default posture: an API route without an explicit role check is a bug, not an
oversight to fix later.

## Confirmed scope boundary (asked, not assumed)

This applies to **internal/admin routes only** — the dispute-monitoring dashboard
planned in `claudedocs/specs/dispute-risk-mitigation/`, and any future internal
tooling. It does **not** apply to the existing public storefront API
(`app/api/cart`, `app/api/checkout`, `app/api/products`, `app/api/founding-list`,
`app/api/webhooks/stripe`) — those stay open to anonymous customers exactly as they
work today. Applying role checks there would end guest checkout, which nobody asked
for and would break real purchases.

## Confirmed current state

- **No `User` model, authentication, or session system exists anywhere in this
  codebase** (checked: no NextAuth, no session table, no password field — the only
  "session" references in the code are Stripe Checkout Sessions, an unrelated
  concept). This is greenfield — RBAC requires building minimal auth first, since you
  can't check a role without first knowing who's asking.
- **Six API routes exist today, zero of them internal/admin** (`find app/api -name
  route.ts`): all customer-facing or the Stripe webhook (which is already correctly
  authenticated via signature verification, not a user role — that pattern doesn't
  change).
- **An existing wrapper convention to extend, not replace**: `lib/api-error.ts`'s
  `withApiErrorHandling` — a higher-order function wrapping route handlers. The
  role-check mechanism follows this exact pattern (a `withRole(allowedRoles, handler)`
  wrapper), not a new architectural idiom introduced into the codebase.

## Research grounding (not invented from scratch)

- **Vercel** (team roles): Owner > Member > Developer > Viewer, where Viewer is
  strictly read-only across every resource — direct precedent for what "Viewer" means
  here.
- **GitHub** (org + repo roles): a role is a *named, fixed set of permissions*,
  checked server-side on every action — "to perform any actions... a person must have
  sufficient access... controlled by permissions." Matches "enforce it everywhere."
- **OWASP Top 10 (A01: Broken Access Control) / AWS IAM philosophy**: deny-by-default
  — every action requires an explicit granted permission; nothing is implicitly
  allowed by omission. This is the direct source for "enforce permission or they don't
  exist": a route with no explicit role check must be *treated* as forbidden to every
  role, not as accidentally open.

## The 3 roles, defined for this app specifically

| Role | Can do |
|---|---|
| **Admin** | Full access to every internal route: read + write + role management (assign/change other users' roles) |
| **Member** | Read + write on operational internal routes (e.g. viewing/acting on disputes, orders) — cannot manage other users' roles or account-level settings |
| **Viewer** | Read-only on every internal route — matches Vercel's Viewer precedent exactly |

Exact per-route permission mapping happens in Plan, once the actual internal routes
that need to exist are known (starting with the dispute dashboard) — this spec fixes
the *role semantics*, not yet the full route×role matrix, since that matrix will grow
as more internal features ship.

## What "solved" looks like

- A `User` record with a `role` field is the only source of truth for what an
  authenticated internal user can do.
- Every internal API route explicitly declares which role(s) may call it; there is no
  route reachable by an internal user without an explicit, reviewable permission check
  in that route's own code (not a global catch-all that's easy to forget to update).
- A request from a role without permission on a route is rejected server-side
  (401/403) regardless of what the UI shows or hides — UI-level hiding of a button is
  a convenience, never the actual control.
- Adding a new internal route without a role check should be *visibly wrong* in code
  review (e.g. every route handler must be wrapped in `withRole(...)`, so an unwrapped
  handler stands out), not silently possible.

## Out of scope (explicitly)

- The public storefront API — confirmed above, unchanged.
- Full enterprise auth features (SSO, OAuth providers, magic links, MFA) — not
  requested; minimal email+password auth is the smallest thing that makes "who is
  calling" answerable, per this project's no-enterprise-bloat default. Can be added
  later without changing the role model.
- Per-resource/row-level permissions (e.g. "Member can only see disputes for orders
  they personally handled") — the 3 roles requested are surface-level (which routes),
  not row-level; row-level scoping isn't part of this request and would be a separate,
  later spec if ever needed.
- Building out the actual internal routes themselves (the dispute dashboard, etc.) —
  that's tracked in the dispute-risk-mitigation spec; this spec only builds the
  enforcement mechanism those routes will use.
