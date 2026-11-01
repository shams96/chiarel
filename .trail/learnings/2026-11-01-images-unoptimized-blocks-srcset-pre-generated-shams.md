---
title: images.unoptimized blocks srcSet; pre-generated variants go stale on in-place image swaps
author: Shams
date: 2026-11-01
branch: redesign/p6-qa
cost: { minutes: 13, tokens: 85445 }
id: l-c2533661
scope: repo
status: active
src: agent
touches:
  - claudedocs/specs/swiss-luxury-redesign/CONVERGENCE.md
  - app/checkout/page.tsx
  - components/Footer.tsx
  - app/house/page.tsx
  - app/journal/page.tsx
  - app/press/page.tsx
  - app/science/page.tsx
  - next.config.mjs
  - public/assets/products/clarity-essence-festive-scene-v2-640.jpg
  - components/home/HomeHero.tsx
---

## Decided
`next.config.mjs` keeps `images.unoptimized: true` (the `/_next/image` route returns 404, which also makes the Next Image Optimization RCE advisory unreachable). The only responsive set is the hero: `public/assets/products/clarity-essence-festive-scene-v2-640.jpg` and `-960.jpg`, used via a plain `<img srcSet>` in `components/home/HomeHero.tsx`. Local full-stack checks use the dev Postgres container `chiarel-postgres` (port 5434) with `scripts/smoke.mjs`.

## Tried and ruled out
Passing `srcSet`/`sizes` through `next/image`: with `config.unoptimized` Next emits only `src`. A sitewide custom image loader pointing at pre-generated variants was not built: the owner swaps images under the same filename (`scripts/publish-images.mjs`), so committed variants would silently go stale, and the hero variants have the same weakness.

## Watch out
If `clarity-essence-festive-scene-v2.jpg` is replaced, regenerate its `-640` and `-960` copies or the hero shows the old picture on phones. `npm audit` shows pre-existing Next, postcss and nodemailer advisories; none were changed by the redesign branch.
