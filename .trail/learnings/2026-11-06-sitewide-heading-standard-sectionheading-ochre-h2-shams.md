---
title: "Sitewide heading standard: SectionHeading, ochre h2 tokens, shared container"
author: Shams
date: 2026-11-06
branch: feat/sitewide-type-layout
cost: { minutes: 8, tokens: 83893 }
id: l-f7229afc
scope: repo
status: active
src: agent
touches:
  - tests/brand-fonts.test.ts
  - components/layout/SectionHeading.tsx
  - tests/section-heading.test.tsx
  - components/home/HomeFitGuidance.tsx
  - components/home/HomeProof.tsx
  - components/home/HomeFaq.tsx
  - tests/home-byline.test.tsx
  - components/home/HomeRitual.tsx
  - components/home/HomeFormulationRecord.tsx
  - components/home/HomeFaceBeyond.tsx
---

## Decided
Sitewide heading standard (owner, 2026-11-06, modelled on the Face / Beyond the Face section): section headings are the shared SectionHeading (components/layout/SectionHeading.tsx: thin ochre rule, h2 token, ochre, optional italic subhead and lead). Card and product names are text-h4 ochre. Inner-page section headings are text-h3 ochre; legal headings text-h4 ink. Homepage sections sit in Container (max-w-container px-margin), including the two-column Face/Beyond and Icon Product sections, so edges match the header. Homepage headings dropped from up to 61-72px to the 44px h2 token, in line with peer luxury skincare sites measured on 2026-11-06 (20-42px).
Guarded by tests/heading-standard.test.ts and tests/section-heading.test.tsx. Spec, research and plan: claudedocs/specs/sitewide-type-and-layout/.

## Tried and ruled out
Alternating garden/ochre/ink heading colours by section (the old state). Keeping the 50/50 full-viewport splits: halves drift to opposite edges on wide screens. Per-section ad hoc clamp() heading sizes.

## Watch out
Fonts are untouched and locked (tests/brand-fonts.test.ts). The footer is off-limits, so its cards sit slightly left of the header edge on very wide screens (footer cards 360px vs header 408px at 2000px). HomeIntro and the hero keep text-mega on purpose (poster statements). PageHead pages keep text-mega titles; moving them to text-h1 is the spec's choice B and is not done here.
