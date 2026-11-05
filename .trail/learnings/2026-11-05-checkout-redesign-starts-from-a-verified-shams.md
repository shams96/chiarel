---
title: "Checkout redesign starts from a verified audit: subscriptions are one-off charges, no receipt email, PaymentIntent race"
author: Shams
date: 2026-11-05
branch: feat/checkout-redesign
cost: { minutes: 10, tokens: 158454 }
id: l-59152189
scope: repo
status: active
src: agent
touches:
  - claudedocs/commerce/CHIAREL_IMPLEMENTATION_PLAN.md
  - app/api/checkout/route.ts
---

## Decided
- Phase order is fix-what-is-untrue first (markOrderPaid shared by webhook and order page, receipt email, expired/failed/refunded webhook events), then Ritual Bag, checkout page, subscriptions, emails, e2e. Plan: claudedocs/commerce/CHIAREL_IMPLEMENTATION_PLAN.md.
- Stay on hosted Stripe Checkout; embedded Payment Element is a separate owner decision (D2).
- The prompt's palette (#004B37, Peach Dust) and sans-serif-for-checkout were not adopted: they conflict with ratified Garden #1F5129 and the fonts already implemented.

## Tried and ruled out
- Subagents could not write into this worktree while the session ran in another one (a hook blocks cross-worktree writes). Fix was EnterWorktree with the path, not bypassing the hook.
- Guerlain mobile checkout is unverifiable: their CDN returned 403 to the emulated browser. Do not rely on mobile-checkout claims from that audit.

## Watch out
- Every subscription mode is Stripe mode:"payment" (app/api/checkout/route.ts); UI and FAQ promise renewals. Nothing recurs.
- order/[id]/page.tsx marks paid without stripePaymentIntentId, so the webhook's pending-only update is a no-op and disputes cannot attach.
- Order.total excludes tax; prices exist in both products.json and the DB with no sync check.
