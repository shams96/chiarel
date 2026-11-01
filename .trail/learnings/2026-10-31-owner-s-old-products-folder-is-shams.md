---
title: "Owner's old products folder is mostly superseded by the published clarity-* set; only the river scene was new"
author: Shams
date: 2026-10-31
branch: redesign/p3-homepage
cost: { minutes: 3, tokens: 33075 }
id: l-ccf10bc2
scope: repo
status: active
src: agent
touches:
  - public/assets/editorial/isola-spring-essence-portrait-1200.jpg
  - public/assets/editorial/isola-spring-essence-portrait-800.jpg
  - public/assets/editorial/isola-spring-essence-square-1400.jpg
  - public/assets/editorial/isola-spring-essence-square-800.jpg
---

## Decided
- The owner's working-copy folder (`chiarel/public/assets/products`, branch `feat/home-hero-one-frame`, not in git) holds pre-rename art. The published `clarity-*` packshots, scenes, studio shots and OG images in git are the current set. Only `relettered/chiarel-essence-river-clarity.png` (2286x4096) was new; it became four web crops in `public/assets/editorial/isola-spring-essence-*.jpg` (resize and re-encode only, new filenames).

## Tried and ruled out
- Old-name packshots (`chiarel-essence-jar.png`, `terra-radiance-creme-*`, `n1-neck-decollete-*`): labels read the retired names, e.g. "CHIAREL ESSENCE ... cellular renewal" versus the published "Clarity Essence".
- Model/ad images (Italia, Discover-radiance, pomelli): ad copy is baked into the pixels, so they cannot serve as editorial photography; `Nightly Neck...Emulsion.png` is dark (light-only rule); `terra-radiance-creme-Model.jpg` shows the retired TERRA label.
- `AdobeStock_*.jpeg` and `watermarked_img_*.jpg`: licence unknown, never publish.
- A first square crop at top=760 clipped the bottle base; top=1020 keeps it whole.

## Watch out
- No lab or production photography exists anywhere under `Chiarel brand/`; Made in Italy needs owner-supplied photos.
- `images.unoptimized` is true, so each crop is served as-is; keep new images small and give them new filenames (the CDN caches /assets for a year).
