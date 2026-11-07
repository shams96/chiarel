---
title: Brand font is Libre Bodoni only; design passes must not change it (tests/brand-fonts.test.ts)
author: Shams
date: 2026-11-06
branch: feat/sitewide-type-layout
cost: { minutes: 6, tokens: 45096 }
id: l-c56be56e
scope: repo
status: active
src: agent
touches:
  - claudedocs/specs/sitewide-type-and-layout/research.md
  - claudedocs/specs/sitewide-type-and-layout/plan.md
  - tests/brand-fonts.test.ts
  - claudedocs/specs/sitewide-type-and-layout/spec.md
  - app/layout.tsx
  - tailwind.config.ts
  - scripts/relabel-eye-treatment.mjs
  - components/home/HomeFaceBeyond.tsx
  - components/layout/PageHead.tsx
  - components/home/HomeIconProduct.tsx
---

## Decided
Libre Bodoni is the sole brand family site-wide (owner ruling D1, 2026-10-31; app/layout.tsx loads only libre-bodoni-latin and -latin-ext via next/font/local; Tailwind font-serif and font-sans both resolve to var(--font-serif) in tailwind.config.ts). Type, colour and layout work changes sizes, colours and widths only, never the family. tests/brand-fonts.test.ts enforces it (one localFont call, no Jost in code, one fontFamily key in Tailwind, no font-family in globals.css, no other family in app/components/lib except the error shell, the social-login fallback and admin order ids).

## Tried and ruled out
Describing the site as "Libre Bodoni + Jost": the code no longer loads Jost; its files stay in public/fonts only for scripts/relabel-eye-treatment.mjs jar-label glyphs. An earlier spec draft said "Jost body" and was corrected.

## Watch out
Do not add, swap or re-weight a font as part of any design pass without an explicit owner decision, and update tests/brand-fonts.test.ts in the same PR if one is made. Name the font as Libre Bodoni when talking to the owner.
