# Admin console P1 (orders and dashboard): plan and tasks

Covers A1.1 Orders and A1.2 Dashboard from [SPEC.md](./SPEC.md). Customers, subscribers and disputes views (A1.3 to A1.5) follow as a second P1 PR.

## Architecture decisions

**1. Fulfilment is a separate state; `Order.status` is not touched.**
`status` (pending, paid) is the payment state. The customer order page, the Stripe webhook and the dispute-rate monitor all read `status === "paid"`. Adding "packed" or "shipped" to it would make a paid order look unpaid to customers and drop it from the dispute denominator. So a new column carries fulfilment:
`fulfilmentStatus`: `unfulfilled` (default) → `packed` → `shipped` → `delivered`, plus `cancelled`.
Allowed moves: unfulfilled → packed, cancelled; packed → unfulfilled (undo), shipped, cancelled; shipped → delivered; delivered and cancelled are final. An order must be paid to go beyond unfulfilled (cancel is the exception). `shipped` requires carrier and tracking number.

**2. Cancelling never refunds.** It marks the order "will not ship". Refunds stay in the Stripe dashboard (money is outside P1). Cancel is Admin only; the UI says so.

**3. New columns on `Order`** (additive, with defaults, so existing rows are valid): `fulfilmentStatus`, `trackingCarrier`, `trackingNumber`, `shippedAt`, `deliveredAt`, `internalNote`, plus an index on `createdAt`. History lives in the audit log (each change records before and after), not a second table.

**4. Safe concurrent edits.** The update is conditional on the status the editor saw (`updateMany where fulfilmentStatus = seen`). If someone else moved the order first the request fails with 409 and nothing is written. The audit entry is written in the same transaction.

**5. Roles.** ADMIN and MEMBER: view and move orders (cancel: ADMIN only), export. VIEWER: read-only and redacted (no name, address or full email; no Stripe ids; no notes). CSV export is Admin and Member, and every export is audit-logged before the file is returned (it holds personal data).

**6. Dashboard is aggregates only** (counts and sums in the database, no row dumps): paid-order counts, revenue and average order value for today, 7 and 30 days (UTC days); orders to ship; oldest unshipped; open disputes; Founding 100 credits owed; subscribers (active, new, unsubscribed in 30 days); payments mode (test or live, read from the Stripe key prefix). Revenue excludes cancelled orders. All roles can read it (no personal data).

## Tasks
1. Migration and schema.
2. `lib/order-fulfilment.ts` (state machine, validation) and `lib/admin-orders.ts` (redaction, CSV rows).
3. Routes: `GET /api/admin/orders`, `GET|PATCH /api/admin/orders/[id]`, `GET /api/admin/orders/export`, `GET /api/admin/dashboard`.
4. Pages: `/admin/orders`, `/admin/orders/[id]`, new `/admin` dashboard; nav entry.
5. Tests (state machine, roles, redaction, 409, audit, CSV injection), mutation checks, real-database run.
6. Runbook; PR; apply migration to production before merging; verify live.

## Known limits
- "Today" and day windows are UTC.
- Revenue is gross order totals in USD as stored; it ignores refunds and Stripe fees. Stripe is still in test mode.
- No refunds, partial shipments or label printing yet.
