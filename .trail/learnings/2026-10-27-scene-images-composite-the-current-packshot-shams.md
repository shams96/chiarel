---
title: "Scene images: composite the current packshot from origin/main and ship under a new filename"
author: Shams
date: 2026-10-27
branch: feat/day-creme-ribbons
id: l-30a0b190
scope: repo
status: active
src: agent
touches:
  - data/products.json
  - scripts/fal-plates.mjs
---

## Decided
- Day Crème ribbon scene ships as clarity-day-creme-ribbon-scene.jpg, not a same-name overwrite: the host CDN sends a one-year Cache-Control on /assets, so returning visitors would keep the old picture. data/products.json (gallery + studio) repointed, old file deleted.
- Ribbon colour is the contrast of the jar glass (red jar -> Formal Garden green; green jar -> Red Ochre). Plate prompt is `day2` in scripts/fal-plates.mjs.

## Tried and ruled out
- Compositing with public/assets/products/terra-radiance-creme-jar.png: a stale local checkout still has that file and it is labelled TERRA RADIANCE CRÈME. Live name is CLARITY DAY CRÈME.

## Watch out
- Take the packshot from origin/main (`git show origin/main:public/assets/products/clarity-day-creme-jar.png`), not from a local tree that may be behind the rename PRs. Open the composite and read the jar label before shipping.
- composite-plate.py: pass out_w 1400 so the scene matches the other 1400px scenes.
