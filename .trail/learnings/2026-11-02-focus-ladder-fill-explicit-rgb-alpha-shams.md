---
title: "Focus Ladder fill: explicit rgb alpha, not color-mix on currentColor"
author: Shams
date: 2026-11-02
branch: redesign/p7-focus-ladder
cost: { minutes: 71, tokens: 465829 }
id: l-742dcd8f
scope: repo
status: active
src: agent
touches:
  - claudedocs/specs/swiss-luxury-redesign/direction/IMAGE_PROMPTING.md
  - scripts/fal-clip.mjs
  - data/products.json
  - lib/image-variants.json
  - public/assets/products/clarity-essence-detail-640.jpg
  - public/assets/products/clarity-essence-detail-960.jpg
  - public/assets/products/clarity-essence-detail.jpg
  - public/assets/products/clarity-eye-contour-concentrate-detail-640.jpg
  - public/assets/products/clarity-eye-contour-concentrate-detail-960.jpg
  - public/assets/products/clarity-eye-contour-concentrate-detail.jpg
---

## Decided
`app/globals.css` `.ladder > span` fills with `color: rgb(28 26 23 / var(--fill))` and strokes with `rgb(28 26 23)`; each row sets `--s` (cqw size) and `--fill` (0 to 100%) in the `:nth-child` rules. `tests/focus-ladder-direction.test.tsx` asserts the sizes fall and the fills rise.

## Tried and ruled out
`color: color-mix(in srgb, currentColor var(--fill), transparent)` rendered the first rows as a solid light grey instead of an outline in the built site (the same rule worked in the static rendition because it used a named ink variable). The `npx tsc` failures in this stretch came from `components/GridGuides.tsx` (passing a DOM `KeyboardEvent` to a plain-object helper type), not from the stylesheet.

## Watch out
Check the ladder in a built page, not only in code. Screenshots in the browser pane can show animations unfinished while the window is unfocused: call `document.getAnimations().forEach(a => a.finish())` before judging. The hero's primary action must stay inside the first 900px at 1440 wide (it sits under the h1, ahead of the paragraph).
