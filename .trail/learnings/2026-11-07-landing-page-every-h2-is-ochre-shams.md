---
title: "Landing page: every h2 is ochre text-h2; sub-headings and card titles ochre text-h4 (statement, routines, formulator, journal cards fixed)"
author: Shams
date: 2026-11-07
branch: fix/landing-heading-gaps
cost: { minutes: 14, tokens: 212636 }
id: l-eec70ff0
scope: repo
status: active
src: agent
touches:
  - components/home/HomeIntro.tsx
  - components/RoutineBand.tsx
  - components/home/HomeFaceBeyond.tsx
  - components/home/HomeFormulator.tsx
  - components/home/HomeJournal.tsx
  - components/PurchaseOptions.tsx
  - lib/cart-context.tsx
  - claudedocs/runbooks/database-outage.md
---

## Decided
- The landing page's last off-standard headings now follow the sitewide standard: the "Advancing Cellular Clarity against Modern Biological Stress" statement (HomeIntro.tsx) is ochre text-h2 instead of ink text-mega; Morning/Evening Ritual titles (RoutineBand.tsx, compact variant only) ochre text-h2; "What It Is Designed For" (HomeFaceBeyond.tsx) ochre text-h4; "Who Formulates CHIAREL?" (HomeFormulator.tsx) is a real level h2 (was h4); journal card titles (HomeJournal.tsx) ochre text-h4 with hover underline, same as ProductCard.
- Found by measuring every h1-h4 on the live homepage with getComputedStyle, not by reading source: the earlier pass (PRs 157/158) had converted sections to SectionHeading but missed headings that were not SectionHeading consumers.

## Tried and ruled out
- Trusting "I swept the homepage" from the diff. Always list computed colour/size of every heading in a real browser; source greps miss headings built from shared components (RoutineBand) and bespoke ones.

## Watch out
- RoutineBand's non-compact variant (the /ritual page) still uses text-4xl md:text-5xl ink; only the compact (home) variant was changed.
- Live site DB timeout (2026-11-07, /api/health?db=1 TIMEOUT) is separate from this change.
