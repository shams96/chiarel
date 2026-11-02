---
title: "Responsive images: manifest, ResponsiveImage, variants remade by publish:images"
author: Shams
date: 2026-11-01
branch: redesign/p6-qa
cost: { minutes: 10, tokens: 64056 }
id: l-57e40620
scope: repo
status: active
replaces: l-c2533661
src: agent
touches:
  - components/EditorialFeature.tsx
  - components/ProductCard.tsx
  - components/ProductGallery.tsx
  - components/ResponsiveImage.tsx
  - components/RitualCarousel.tsx
  - components/RoutineBand.tsx
  - components/home/HomeClosing.tsx
  - components/home/HomeFaceBeyond.tsx
  - components/home/HomeFitGuidance.tsx
  - components/home/HomeHero.tsx
---

## Decided
`images.unoptimized: true` stays in `next.config.mjs` (no `/_next/image`, no runtime sharp). Because Next then emits no srcSet, `components/ResponsiveImage.tsx` renders a plain `<img>` with a srcSet built from `lib/image-variants.json` (width plus 640/960 copies, e.g. `clarity-essence-festive-scene-v2-640.jpg`). `scripts/make-image-variants.mjs` makes the copies with sharp (local only); `scripts/publish-images.mjs` remakes and publishes them for any replaced source, so a variant is never older than its source. `tests/image-variants.test.ts` fails if a variant is missing or a source's width changed.

## Tried and ruled out
Passing sizes through `next/image` (ignored when unoptimized). A custom loader with `unoptimized: false`: it keeps the `/_next/image` route registered, which would reopen the Next Image Optimization advisory. Committing variants without a regeneration step: the owner swaps images under the same filename, so they would go stale.

## Watch out
Replacing a listed image with a different pixel size needs `npm run make:variants` and a commit of `lib/image-variants.json`; CI fails otherwise. New heavy images are not covered until added to the manifest and rendered through `ResponsiveImage`.
