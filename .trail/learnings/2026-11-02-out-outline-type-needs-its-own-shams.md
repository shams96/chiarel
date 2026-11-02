---
title: ".out outline type needs its own stroke colour; class-string tests missed it"
author: Shams
date: 2026-11-02
branch: redesign/p7-focus-ladder
cost: { minutes: 12, tokens: 72979 }
id: l-d37524ea
scope: repo
status: active
src: agent
touches:
  - app/build-your-ritual/page.tsx
  - app/globals.css
  - app/house/page.tsx
  - app/journal/page.tsx
  - app/press/page.tsx
  - "app/shop/[slug]/page.tsx"
  - claudedocs/specs/swiss-luxury-redesign/direction/PROPOSAL.md
  - components/CartDrawer.tsx
  - components/GridGuides.tsx
  - components/Header.tsx
---

## Decided
`app/globals.css` `.out` strokes with `var(--out-stroke, rgb(28 26 23))`; light-on-ochre uses set `--out-stroke` (see `components/home/HomeItaly.tsx`). `.out` has a transparent fill, so `-webkit-text-stroke: 1px currentColor` resolves to a transparent stroke: the ritual numerals in `components/RoutineBand.tsx` and the vertical "Isola del Liri" word rendered as nothing in the built site (computed stroke `rgba(0,0,0,0)`). Found by a read-only code-review agent, confirmed in the browser. `tests/focus-ladder-direction.test.tsx` now asserts the `.out` rule has an explicit stroke and was checked to fail when the bug is put back.

## Tried and ruled out
Class-name `toContain` tests: they passed while the outlines were invisible. The static rendition worked because it used explicit colour variables, which hid the problem until the real build. A reviewer's claim that the vertical word overflows its section was measured and is wrong: a grid row grows to the tallest item (word 833px inside a 1089px section at 1440).

## Watch out
Judge decorative type by computed style or a screenshot of the built page. Panels slid off-screen with `translate-x-full` stay focusable: closed drawers now use `invisible` with `transition-[transform,visibility]`. The grid guides toggle only works on pages opened with `?grid`.
