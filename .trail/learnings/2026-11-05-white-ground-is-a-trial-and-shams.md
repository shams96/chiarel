---
title: "White ground is a trial, and the cloud token alone does not repaint the site"
author: Shams
date: 2026-11-05
branch: trial/white-ground
id: l-82000436
scope: repo
status: active
src: agent
touches:
  - tailwind.config.ts
  - app/globals.css
  - lib/color.ts
---

## Decided
- Owner asked (2026-11-05) to try a white page ground. It lives on branch trial/white-ground, local only, not merged. Cloud Dancer #F0F2EB stays the ratified ground (D4) until the owner says keep white.

## Tried and ruled out
- Changing only `cloud` in tailwind.config.ts: the header bar stayed pale green because app/globals.css line ~218 hard-codes rgb(240 242 235 / 0.9), and the reduced-transparency fallback (~383) hard-codes #f0f2eb. The intro overlay in HeroIntro.tsx used bg-ivory.
- The apple-design skill does not prescribe a white background; it is motion/type/principles. White was a design hypothesis, not a skill rule.

## Watch out
- A ground-colour change needs lib/color.ts NEUTRAL_FRAME_BG, the two globals.css literals and the HeroIntro overlay too, not just the token.
- Logo PNGs (header, intro) are near-black #201818 while text is #32312D; recolour them separately.
