---
title: "Science, House, Press lose the heading gap below lg on the 12-col grid"
author: Shams
date: 2026-11-01
branch: redesign/p6-qa
cost: { minutes: 23, tokens: 326493 }
id: l-1815aa0f
scope: repo
status: active
src: agent
touches:
  - components/Footer.tsx
  - app/science/page.tsx
  - app/house/page.tsx
  - app/press/page.tsx
  - app/journal/page.tsx
---

## Decided
`app/science/page.tsx`, `app/house/page.tsx` and `app/press/page.tsx` use `grid-12` with a `col-span-full lg:col-span-4` heading and `col-span-full lg:col-span-8` content. `.grid-12` has only a 1rem gutter on phones and tablets, so the old `mt-12`/`mt-14` on the first content block must be replaced by a gap below lg, not dropped. `app/journal/page.tsx` is unaffected because each article has its own `py-8`.

## Tried and ruled out
Checking only desktop screenshots and overflow/small-text/overlap scripts: none of them flag a missing gap, so the regression was found only by viewing the 390px screenshots. Hero looking empty in browser-pane screenshots is not a bug: animations pause while the pane is unfocused (`h1` showed opacity 0 until the timeline advanced).

## Watch out
Any page moved onto `grid-12` needs a phone and tablet screenshot, not just a desktop one. Cart and Checkout empty states use different button styles (pre-existing).
