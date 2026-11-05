---
title: "Apple palette (PR 145) replaces Cloud Dancer and #32312D ink; colour literals live outside the tokens"
author: Shams
date: 2026-11-05
branch: design/apple-palette
id: l-161bc285
scope: repo
status: active
replaces: l-32d8a94a
src: agent
touches:
  - tailwind.config.ts
  - app/globals.css
  - lib/color.ts
  - app/global-error.tsx
  - app/manifest.ts
  - tests/soft-ink.test.ts
---

## Decided
- Owner chose Apple's measured palette: ground #F5F5F7, panels #FFFFFF, ink #1D1D1F (tailwind.config.ts cloud/ivory/ink). Supersedes D4 Cloud Dancer and the #32312D ink.
- Logo PNGs (header wordmark, header house, intro house, all *-ink-v2) are recoloured to rgb(29,29,31) so logo and text are one grade.

## Tried and ruled out
- Pure white, then eggshell #F5F2E9, before settling on Apple's measured values.

## Watch out
- Changing tokens alone does not repaint the site. Literals to update together: app/globals.css header rgb(... / 0.9) and reduced-transparency fallback, lib/color.ts NEUTRAL_FRAME_BG, HeroIntro overlay class, app/global-error.tsx, app/manifest.ts.
- tests/soft-ink.test.ts asserts the ink token value; change it with the palette.
- Contrast on #F5F5F7: ink/80 = 8.38:1, ink/70 = 5.94:1. Do not go lower.
