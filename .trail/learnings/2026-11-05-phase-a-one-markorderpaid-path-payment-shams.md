---
title: "Phase A: one markOrderPaid path, payment record in cents, unpaid outcomes via webhook"
author: Shams
date: 2026-11-05
branch: feat/checkout-redesign
cost: { minutes: 14, tokens: 220634 }
id: l-039d6a8f
scope: repo
status: active
src: agent
touches:
  - prisma/schema.prisma
  - prisma/migrations/20261105000000_order_payment_record/migration.sql
  - lib/order-payment.ts
  - lib/order-email.ts
  - app/api/webhooks/stripe/route.ts
  - "app/order/[id]/page.tsx"
  - app/account/page.tsx
  - app/api/checkout/route.ts
  - tests/stripe-webhook.test.ts
  - tests/order-payment.test.ts
---

## Decided
- lib/order-payment.ts settleCheckoutSession() is the only path that makes an order paid; webhook and app/order/[id]/page.tsx both call it. The email and cart clear hang off its `transitioned` flag (single guarded updateMany), so redelivery and the webhook/page race send one email.
- Payable-from set is pending, failed, expired: a paid Stripe session wins over an earlier failure or expiry. Refunded is never resurrected.
- Payment record is in cents (amountPaidCents, taxCents, refundedCents); Order.total stays whole-dollar pre-tax. Reconciliation is amount_total - tax == total*100; mismatch is logged as `[alert] checkout.amount_mismatch`, never blocks. The no-tax fallback logs `[alert] checkout.no_tax_fallback`. "Alerting" is a log line until someone watches logs.
- Order page claims an emailed confirmation only if confirmationEmailAt is set (written after a successful send).
- Checkout reuses an open Stripe session for the same fingerprint (bag + buyer details), session expiry is 45 min, and orderId rides on payment_intent_data.metadata so payment_failed can find the order.
- status values: pending, paid, failed, expired, refunded. Account lists paid and refunded only.

## Tried and ruled out
- `prisma generate` in this worktree rewrites the SHARED node_modules/.prisma client of the main checkout (junction) and fails renaming the locked query engine. Its new columns then exist in the client but not in any DB until migrated. Do not run it casually; CI is the authority for tsc.
- Stale-pending purge and the products.json-vs-DB price check were left out of Phase A: purge needs a retention decision, the price check needs a DB in CI.

## Watch out
- Migration 20261105000000_order_payment_record is additive; prod needs a drift diff and the owner's go before migrate deploy. The code reads/writes these columns, so deploy order is migrate first.
- Production webhook must subscribe to checkout.session.expired, payment_intent.payment_failed and charge.refunded in the Stripe Dashboard, or those statuses never appear.
- Fully refunded orders drop out of the admin to-ship CSV (it filters status paid).
