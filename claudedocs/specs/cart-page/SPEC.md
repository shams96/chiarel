# Cart page (`/cart`), PR 1 of 4: compressed spec

Status: implemented in this PR. Plan approved in chat (2026-10-14): replicate the *structure* of a luxury bag page
(La Mer's, reviewed live and from owner screenshots), not its text, imagery or claims.

## Problem
The bag exists only as a side drawer. Peers give the bag its own page: line table with a plan selector per line, a
summary panel, and reassurance at the point of checkout. Without it customers cannot compare or change plans in the bag.

## In scope (this PR)
- `/cart` page: title with item count; per line: image, name, plan selector (Ritual Plan / Subscription / One-time with
  prices), quantity, line total, Remove; Continue shopping.
- Summary panel: dark Checkout button, subtotal, ritual savings applied, shipping (complimentary at or above the shared
  threshold), estimated total, note that tax is calculated at payment, "Additional info" accordions (shipping, payment and
  tax, returns) using statements already stated in /terms and on product pages.
- Drawer: "View bag" link. Header Bag keeps opening the drawer.
- Shared `lib/shipping.ts` replacing three copies of the $150 / $12 / $250 numbers.
- `changePlan` in the cart context: changes a line's plan without opening the drawer.
- `/cart` disallowed in robots, `noindex` metadata.

## Out of scope (later PRs)
Offer code, gift wrap, shipping methods, Pay Later/wallets, product page accordions, photography slots, out-of-stock
backorder notice. Stripe still hosts payment; `/checkout` (address form) is unchanged.

## Done means
- Changing a line's plan updates unit price, line total, subtotal, savings and the shipping line, and persists on reload.
- Same numbers as the drawer and `/checkout` for every cart (one shipping source).
- 44px touch targets; no horizontal scroll at 390px; keyboard-operable; empty and loading states.
