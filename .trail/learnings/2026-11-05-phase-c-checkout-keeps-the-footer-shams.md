---
title: "Phase C: checkout keeps the footer, validates per field, and never claims add_payment_info"
author: Shams
date: 2026-11-05
branch: feat/checkout-redesign
cost: { minutes: 7, tokens: 76115 }
id: l-0f50ebb4
scope: repo
status: active
src: agent
touches:
  - app/api/checkout/route.ts
  - app/checkout/page.tsx
  - "app/order/[id]/page.tsx"
  - "app/shop/[slug]/page.tsx"
  - components/CartDrawer.tsx
  - components/CartPageContent.tsx
  - components/PlanSelect.tsx
  - components/PurchaseOptions.tsx
  - components/StickyPurchaseBar.tsx
  - lib/pdp-plan.ts
---

## Decided
- /checkout swaps the site header for components/CheckoutChrome.tsx (logo + Back to bag); components/Footer.tsx is deliberately untouched (owner rule), so the footer still shows on checkout.
- Checkout form is noValidate with lib/checkout-validation.ts: per-field messages tied by aria-describedby, focus moves to the first error in page order. The server still re-checks everything; the terms message is worded the same on both sides.
- US and CA state is a select (lib/regions.ts) so Stripe and Stripe Tax get codes. Totals read "Estimated total" plus the existing "Taxes are calculated at payment." line.
- No add_payment_info event: the card is entered on Stripe's domain. add_shipping_info fires only after /api/checkout succeeds.
- Confirmation shows directions only from products.json howToUse, plus RefreshBag so the header count empties after purchase.

## Tried and ruled out
- Hiding the footer on checkout: it would touch an off-limits component.
- Forcing Apple Pay / Google Pay in code: they come from the Stripe account's wallet settings on hosted Checkout, not from this code; it cannot be confirmed without a test-mode session.
- Real delivery estimates on the confirmation page: no fulfilment rule exists in the repo, so none is shown.

## Watch out
- Driving /checkout locally without a database: mock /api/cart, /api/account/me and /api/checkout with Playwright page.route (done for the Phase C check). The page shows the empty-bag state otherwise.
- tests/checkout-form-a11y.test.ts regex now allows extra Field props such as error=.
