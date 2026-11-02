---
title: Footer wordmark spans both cards in its own reserved band
author: Shams
date: 2026-11-01
branch: redesign/p6-qa
cost: { minutes: 11, tokens: 47061 }
id: l-24992747
scope: repo
status: active
src: agent
touches:
  - components/Footer.tsx
  - app/globals.css
---

## Decided
`components/Footer.tsx`: the outlined CHIAREL wordmark is two tinted copies clipped per card (rules in `app/globals.css` `.wordmark`), sized in cqw of the grid (`[container-type:inline-size]`). md+: full-width band, left card = (100% - 1.25rem)/3. Below md: on the seam between stacked cards (left card fixed 280px, gap 4px, split at 46%). Both cards reserve padding for the band. The owner approved editing Footer for this.

## Tried and ruled out
Keeping the old 9vw wordmark behind the heading: it collided with "Contact CHIAREL" and "Reach the House" at md+ and was hidden on phones. A 16px gap between stacked cards left the letter middles on the page ground; gap-1 fixed it.

## Watch out
If the left card height or grid gap changes, update `top-[calc(282px-6.44cqw)]` and the clip percentages together. Sticky-header overlap in screenshots comes from scroll position, not the footer.
