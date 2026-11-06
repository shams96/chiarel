---
title: Homepage closing product block removed; hero owns Begin the Ritual
author: Shams
date: 2026-11-06
branch: fix/home-closing-cta-placement
cost: { minutes: 5, tokens: 37631 }
id: l-d3f9bfd3
scope: repo
status: active
src: agent
touches:
  - components/home/HomeFaq.tsx
  - app/page.tsx
  - tests/focus-ladder-direction.test.tsx
  - tests/home-byline.test.tsx
  - components/home/HomeClosing.tsx
  - tests/catalog-removed-products.test.ts
  - components/home/HomeHero.tsx
---

## Decided
The homepage has no closing product block. The old HomeFinalCta (Essence + Day Crème tiles, "Begin the Ritual", price line, "See the full House") repeated the hero's job: same button label, same Essence price line. Its button also went straight to the Essence page, skipping /ritual in the order flow (/ritual -> /shop -> product -> bag). Removed from components/home/HomeClosing.tsx and app/page.tsx. The authorship line now closes HomeFaq (components/home/HomeFaq.tsx).

## Tried and ruled out
Keeping the block and re-aligning it with the FAQ column: it would still be a second, shorter route to the same purchase the hero and the per-product CTAs already offer.

## Watch out
The ritual set and Founding Pair bundles were removed from the catalog (tests/catalog-removed-products.test.ts), so there is no bundle to feature on the homepage. Do not add a block between HomeFaq and the footer; the byline is meant to be the last content.
