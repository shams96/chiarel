---
title: "House page ground is flat Cloud, no Liri Flow texture"
author: Shams
date: 2026-11-01
branch: redesign/p6-qa
cost: { minutes: 33, tokens: 391780 }
id: l-31da057e
scope: repo
status: active
src: agent
touches:
  - app/house/page.tsx
  - app/journal/page.tsx
  - app/press/page.tsx
  - app/science/page.tsx
  - components/Header.tsx
  - components/HeroIntro.tsx
  - components/StickyPurchaseBar.tsx
  - components/home/HomeHero.tsx
  - public/assets/products/clarity-essence-festive-scene-v2-640.jpg
  - public/assets/products/clarity-essence-festive-scene-v2-960.jpg
---

## Decided
`app/house/page.tsx` uses the standard Cloud Dancer ground inside the shared `grid-12` container; the Liri Flow texture (`liri-flow-bg` / `liri-flow-page` in `app/globals.css`) is not used on any page. The CSS rules remain, unused.

## Tried and ruled out
Removing only the `liri-flow-page` class was not enough: an uncommitted `<div className="liri-flow-bg bg-cloud">` wrapper appeared in the working tree (not from this session), and the water-ripple texture stayed until it was reverted with `git checkout -- app/house/page.tsx`.

## Watch out
Two `npm run build` runs failed earlier in the session while that unbalanced/foreign edit was in flight; the build passed after the revert. Check `git diff app/house/page.tsx` for stray wrappers before building.
