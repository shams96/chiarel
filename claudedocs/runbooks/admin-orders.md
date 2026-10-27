# Runbook: orders and dashboard (`/admin/orders`, `/admin`)

Tier 2, assisted triage: an agent can diagnose and propose; a human approves anything that changes an order or touches production data.

## Daily use

1. **Dashboard** (`/admin`): the "To pack" and "Packed, not shipped" tiles show paid orders waiting. A yellow banner means Stripe is in test mode and the numbers are not real money.
2. **Pack:** `/admin/orders`, open an order, **Mark packed**. Orders with a bonus sample say so on the order page and in the CSV.
3. **Ship:** open a packed order, enter **carrier and tracking number**, **Mark shipped** (both are required). Tracking can be corrected later with **Save tracking**.
4. **Deliver:** **Mark delivered** when it arrives. Delivered and cancelled orders are final.
5. **Pick list:** **Export to ship (CSV)** on the orders page: paid orders that are unfulfilled or packed. Every export is written to the audit log, so it shows who exported and when.

## Who can do what

| | Admin | Member | Viewer |
| --- | --- | --- | --- |
| See orders and dashboard | full | full | redacted (masked email, no name, address or Stripe ids) |
| Pack, ship, deliver, add notes | yes | yes | no |
| Cancel an order | yes | no | no |
| CSV export | yes | yes | no |

## Rules worth knowing

- **Cancel does not refund.** It only marks the order "will not ship". Refund in the Stripe dashboard.
- An unpaid (pending) order cannot be packed or shipped.
- Fulfilment is separate from payment: `status` (paid or pending) is untouched by packing and shipping.
- Two people editing the same order: the second save gets "changed by someone else, reload". Nothing is overwritten.
- Revenue on the dashboard is paid, not cancelled, gross USD, UTC days; it ignores refunds and Stripe fees.

## Symptoms and fixes

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| Dashboard shows "Could not load the numbers" | Database unreachable or a pending migration | `npm run db:prod:status`; apply with `prisma migrate deploy`; check the host log |
| Order pages 503 right after a deploy | The `order_fulfilment` migration is not applied in production | Apply it (see below), then reload |
| Customer says "I never got tracking" | Tracking only lives in the console; no email is sent yet | Send it manually; automated shipping emails are a later P3 item |
| Wrong order marked shipped | Fat-finger | Shipped cannot be undone in the console by design. Correct the tracking, or an Admin can fix the row in the database and note it in the order note; the audit log keeps the history |
| Someone exported customer data unexpectedly | n/a | `/admin/audit` filter "orders.export" shows who and when |

## Migration order (important)

New code reads the `fulfilmentStatus` column. **Apply the migration to production before merging**, or order pages and the dashboard will error until it exists. The migration is additive (new columns with defaults, one index). Check `npm run db:prod:status` before and after.
