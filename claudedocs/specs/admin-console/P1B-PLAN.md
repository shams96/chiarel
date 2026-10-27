# Admin console P1 part 2: customers, subscribers, disputes

Covers A1.3, A1.4, A1.5 of [SPEC.md](./SPEC.md). **No schema change**: customers derive from `Order`, subscribers use `EmailSubscriber`, disputes use the `dispute*` columns on `Order`. So no production migration is needed and deploy order is not a concern.

## Shared rules (all three)
- Every route is wrapped in `withApiErrorHandling(withRole([...], ...))`. Roles below. A guard test already fails any admin route without `withRole`.
- **Viewer** gets a masked, read-only shape where allowed (`maskEmail` from `lib/admin-orders.ts`), cannot search by email, cannot export, cannot drill down. Where Viewer is not listed the route is Admin and Member only.
- Any export of personal data is written to the audit log BEFORE the file is returned (no record, no file), via `auditEntry`. Any data change writes its audit entry in the same `db.$transaction`. Audit `summary` and `before/after` never contain a full email (use `maskEmail`) or a credential.
- No personal data in URLs: lookups by email use a JSON POST body, not a path or query string.
- Pagination: cursor on id, newest first or documented order, `take` capped at 100. Offset is allowed only where a raw SQL aggregate makes a cursor impractical (customers); cap it.
- Pages are plain client components in the existing admin style (see `app/admin/orders/page.tsx`), no brand styling. The API enforces roles; the page renders what it is given.
- Tests: Vitest, mock `@/lib/db` like `tests/admin-orders.test.ts`; cover 401/403 per role, redaction, validation, audit entries, and run at least 3 mutation checks per area (break the code, see a test fail, restore). tsc and eslint clean.

## A1.3 Customers (Admin, Member full; Viewer masked list only)
Derived from paid orders, grouped by `lower(email)`. Columns: email, order count, lifetime value (sum of `total` for paid, not cancelled), first and last order date, country (latest order), newsletter subscribed (matched on lower(email) against `EmailSubscriber` with `unsubscribedAt` null), has subscription items (any `OrderItem.mode` that is not one-time). Search (Admin/Member only) by email or surname; sort by last order or lifetime value. `POST /api/admin/customers/orders {email}` returns that customer's orders (Admin/Member). `GET /api/admin/customers/export` CSV (Admin/Member), audited. Use parameterised `Prisma.sql` for the aggregate.

## A1.4 Subscribers
- `GET /api/admin/subscribers/list`: Admin, Member, Viewer (Viewer masked, no search). Filters: status active or unsubscribed, source; search by email (Admin/Member); counts summary.
- `PATCH /api/admin/subscribers/[id]` `{action:"unsubscribe"}`: Admin and Member. Sets `unsubscribedAt` only if null. There is deliberately NO resubscribe action: consent must come from the person. Audited.
- Existing `GET /api/admin/subscribers` (CSV, Admin only) stays where it is and gains an audit entry written before the file is returned.

## A1.5 Disputes (Admin, Member)
`GET /api/admin/disputes`: orders with a `disputeId`, newest first, with status, reason, amount, opened/closed, order id, masked-by-role-not-needed email (Admin/Member see full), and an **evidence checklist** computed from the order: terms acceptance record (`termsAcceptedAt` + `termsVersion`), carrier + tracking number, shipped date, delivered date, customer email, shipping address, itemised order. Missing items are flagged. Also returns the current dispute-rate report from `computeDisputeRateReport` in `lib/dispute-monitoring.ts` and a Stripe dashboard link per dispute (`https://dashboard.stripe.com/test/payments/<pi>` in test mode, no `/test` in live, chosen by `paymentsMode()` in `lib/admin-dashboard.ts`; omit if no payment intent). Read-only.

## Ownership (parallel work, no overlapping files)
- Customers agent: `lib/admin-customers.ts`, `app/api/admin/customers/**`, `app/admin/customers/page.tsx`, `tests/admin-customers.test.ts`.
- Subscribers agent: `lib/admin-subscribers.ts`, `app/api/admin/subscribers/**`, `app/admin/subscribers/page.tsx`, `tests/admin-subscribers.test.ts`.
- Disputes agent: `lib/admin-disputes.ts`, `app/api/admin/disputes/**`, `app/admin/disputes/page.tsx`, `tests/admin-disputes.test.ts`.
- Lead only: `components/admin/AdminShell.tsx` (nav), `app/admin/page.tsx` (dashboard links), runbook, this plan, git, PR.
