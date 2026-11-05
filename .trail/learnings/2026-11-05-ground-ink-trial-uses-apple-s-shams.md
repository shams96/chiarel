---
title: "Ground/ink trial uses Apple's measured palette; many literals bypass the colour tokens"
author: Shams
date: 2026-11-05
branch: trial/white-ground
id: l-32d8a94a
scope: repo
status: active
replaces: l-82000436
src: agent
touches:
  - app/globals.css
  - lib/color.ts
---

## Decided
- Owner asked (2026-11-05) to try Apple's colours. Measured on apple.com/iphone: ground #F5F5F7, cards #FFFFFF, text black #1D1D1F (secondary #6E6E73, black at 72%/56%). Applied on branch trial/white-ground (local, not merged): cloud #F5F5F7, ivory #FFFFFF, ink #1D1D1F, hairline token and NEUTRAL_FRAME_BG to match; header logo PNGs recoloured to exactly 29,29,31 so logo and text are the same ink.
- Ratified Cloud Dancer #F0F2EB (D4) and ink #32312D (2026-11-02) stay the live values until the owner says go.

## Tried and ruled out
- Pure white (#FFFFFF) and eggshell (#F5F2E9) grounds were tried first in the same trial; the owner then asked for Apple's actual values.
- Changing only the tailwind tokens: app/globals.css (~218 header translucency, ~383 reduced-transparency) hard-codes the old cloud, HeroIntro's overlay used bg-ivory, and lib/color.ts NEUTRAL_FRAME_BG is separate.
- The apple-design skill gives no ground colour; Apple's values came from reading apple.com directly.

## Watch out
- Logo PNGs (chiarel-header-*-v2, chiarel-intro-house-ink-v2) are flat single-colour alpha art: recolour them with sharp (set RGB, keep alpha) whenever the ink changes.
- The owner's monitor renders pale greys pinkish (night light/colour preset suspected); judge colour on a second device.
