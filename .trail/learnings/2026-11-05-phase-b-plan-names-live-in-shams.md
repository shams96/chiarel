---
title: "Phase B: plan names live in lib/plan-labels.ts; sticky bar follows the PDP tier via lib/pdp-plan.ts"
author: Shams
date: 2026-11-05
branch: feat/checkout-redesign
cost: { minutes: 1, tokens: 2566 }
id: l-fb66fc72
scope: repo
status: active
src: agent
touches:
  - lib/pricing.ts
  - tests/focus-ladder-direction.test.tsx
---

## Decided
- lib/plan-labels.ts is the only table of plan names (PLAN_NAME short, PLAN_DETAIL long) plus the Tier and mode mapping. Drawer, bag page, checkout, order page, Stripe line description and the planOptions in lib/pricing.ts read it. Wording is unchanged; whether "every 45 days" is true is still decision D1.
- lib/pdp-plan.ts holds the selected tier per slug (useSyncExternalStore, default ninetyDay) so PurchaseOptions and StickyPurchaseBar add the same plan. The bar used to always add a subscription.
- components/PlanSelect.tsx is shared by the drawer and the bag page. The drawer suggestion follows the plan of the first bag line and has a per-visit "Not now".
- The bag page docks total and Checkout below lg while the summary is off screen (IntersectionObserver).

## Tried and ruled out
- tests/focus-ladder-direction.test.tsx finds the first "Add to Bag" in StickyPurchaseBar.tsx, so that literal must not appear in a comment before the button.
- The drawer and bag page were not verified live: the dev API needs DATABASE_URL, which this checkout has none of. Only the product page and sticky bar were driven in the browser.

## Watch out
- innerText on text-transform uppercase buttons returns upper case; match case-insensitively in browser checks.
