---
title: Product public URL is a path; the internal slug and production DB rows stay the old keys
author: Shams
date: 2026-10-24
branch: feat/home-hero-one-frame
cost: { minutes: 1, tokens: 1395 }
id: l-0683d937
scope: repo
status: active
src: agent
touches:
  - data/products.json
  - lib/products.ts
  - app/api/cart/route.ts
  - app/api/products/route.ts
  - next.config.mjs
---

## Decided
- Product pages live at /shop/<path> (clarity-essence, clarity-day-creme, clarity-night-creme, clarity-neck-decollete-creme, clarity-eye-contour-concentrate). The catalog slug (chiarel-essence, terra-radiance-creme, recovery-masque, n1-neck-decollete, eye-contour-concentrate) stays the internal key. Build every link with productHref(slug). Old /shop/<slug> redirects in next.config.mjs.
- Production DB is seeded by hand and we cannot reseed it from here: so a new catalog product has no row and add-to-cart 404s. ensureCatalogRow() creates the row from the catalog on first add; /api/products takes display fields from the catalog; DB price stays authoritative.
- Removed products (cleanser, mist, lip, founding pair, ritual set) leave the catalog but keep DB rows (OrderItem FK); carts filter them out.
- No ingredient percentages and no INCI lists on the site (owner, Oct 16; confirmed not required by the label spec in 05 Packaging). Essence collagen source is unconfirmed: never say marine or fish. No test or clinical claims until a report is on file.

## Tried and ruled out
- Renaming the slug itself: it is the DB primary key with order and cart foreign keys, and Footer.tsx (owner-only) links the old n1 slug and the recovery-masque jar image.
- A global trail init: --no-global still wrote nothing to ~/.claude here, but check settings.json before and after.

## Watch out
- next build skips type checking (ignoreBuildErrors), so run npx tsc --noEmit yourself; a build also needs STRIPE_SECRET_KEY set.
- Glass hex values are binding from RFQ V19 (Red Ochre #913832, Formal Garden #1F5129, Peach Dust #F0D8CC); jar art still prints old names and the V19 artwork files are not on file.
