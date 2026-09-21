# CHIAREL Launch Pricing Update

Records the owner-approved pricing decision and exactly how it was implemented. No deployment, no
checkout/payment changes, no bundle activity — implementation only.

## What was approved

- CHIAREL Essence™: One-time $189 / Replenishment (45-day subscription) $151 — **unchanged, verified**.
- Terra Radiance Crème™: One-time $158 / Replenishment $126 — **unchanged, verified**.
- Recovery Masque™: One-time $148 / Replenishment $118 — **unchanged, verified**.
- N1 Neck & Décolleté Renewal Emulsion™: One-time $138 / Replenishment $118 — **new, added to data,
  intentionally not yet displayed or purchasable** (see below).

No new bundles were created, activated, priced, or sold. The Founding Pair, The Ritual Set, Founding 100,
subscription cadence, checkout logic, discounts, and refund policies were not touched.

## How "approved but not displayed" was implemented

The owner's instruction was explicit: record N1's price now, but don't show it or allow purchase until
formula, package size, image, availability, and claims are all separately confirmed. Rather than leaving
N1's price out of the data (which would make it easy to forget to re-add later, or to add it back without
re-checking those other conditions), a new field draws the distinction explicitly:

- `data/products.json`: N1 now has a real `price` object (`{ subscription: 118, oneTime: 138 }`) **and**
  `"hidePriceUntilApproved": true`.
- `lib/products.ts`: a new `isPurchasable(p)` function is the single source of truth for "show this
  product's price and allow it to be bought" — `p.price != null && !p.hidePriceUntilApproved`. This
  replaced the interim `hasPrice()` helper (which only checked for a price existing) everywhere a
  purchase/display decision was made: the PDP buy box and sticky bar, `ProductCard`, the homepage's
  `OfferCatalog` schema, `/ritual`, `/build-your-ritual`'s selectable-vs-coming-soon split, `llms.txt`,
  and `prisma/seed.ts`'s DB-seeding filter (so N1 still gets no row in the purchasable-product table,
  and can't be added to a real cart).
- The existing one-time/subscription pricing *logic* (`lib/pricing.ts`'s `computeUnitPrice`,
  `lib/cart-context.tsx`, `lib/cart-server.ts`) was not touched — N1's stored price uses that exact same
  shape and would flow through that same logic unmodified the moment `hidePriceUntilApproved` is cleared.

## What changes when the owner is ready to launch N1's price

A single edit: set `"hidePriceUntilApproved": false` (or remove the field) on the `n1-neck-decollete`
entry in `data/products.json`. That one change is picked up automatically by every surface listed above
via `isPurchasable()` — no other file needs to change. Before making that edit, confirm (per the owner's
own stated gate) that final formula, final package size, final image, product availability, and approved
claims are all in place — none of those are done yet (see `CHIAREL_FOUR_PRODUCT_COMPLETION_REPORT.md`
§18 for the outstanding list).

## Verification performed

- `tsc --noEmit`, `npm run lint`, `npm run build` — all pass.
- Live dev-server check: N1's PDP buy box still reads "Price to be announced," no Product/Offer JSON-LD
  is emitted for N1, `/shop` and `/build-your-ritual` both still show N1 as unpriced/"Coming Soon," and
  the other three launch products' prices ($151/$189, $126/$158, $118/$148) and the Founding Pair/Ritual
  Set prices ($243/$347, $372/$533) render unchanged.
