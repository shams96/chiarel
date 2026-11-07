---
title: "Text uses true ink colours, one crisp rendering rule, footer on the shared container"
author: Shams
date: 2026-11-07
branch: fix/text-colour-footer-container
cost: { minutes: 4, tokens: 35130 }
id: l-e50a8d8f
scope: repo
status: active
src: agent
touches:
  - components/ProductCard.tsx
  - components/layout/PageHead.tsx
  - tests/heading-standard.test.ts
  - app/globals.css
  - tests/text-colour-standard.test.ts
  - tests/tap-targets-global.test.ts
  - tests/brand-fonts.test.ts
  - components/Footer.tsx
---

## Decided
Text is set in the true brand colours, not opacity washes (owner, 2026-11-07): public pages and components use text-ink (#1D1D1F) and text-ivory instead of text-ink/70, /80 and text-ivory/85, /90 (about 350 uses swept in 62 files). Footer text is full cloud/ink too. Hierarchy comes from size, case and weight. app/globals.css body adds text-rendering optimizeLegibility, font-kerning normal and font-synthesis none (no faked bold/italic). Footer container is max-w-container px-margin, so its cards share the header's edges (400-1584 at 2000px). Guarded by tests/text-colour-standard.test.ts.

## Tried and ruled out
Changing the font family or weights: the family is locked (tests/brand-fonts.test.ts). Touching the footer wordmark geometry (25.2cqw clips, top-[calc(282px-5.75vw)] seam, 280px phone card): unchanged, and pinned by the new test. Sweeping admin pages: left alone, internal only.

## Watch out
A bulk class sweep over components/ edits Footer.tsx unless excluded; this time the owner authorised the footer edit. placeholder: and disabled: states keep their faded text on purpose. tests/tap-targets-global.test.ts used to pin text-ink/70; it now pins text-ink. 12-13px text is still 12-13px (brief floor is 12px); raising small-text weight or size is a separate decision.
