---
title: "Formulation credit is a House team effort, not Grazia alone"
author: Shams
date: 2026-11-05
branch: fix/house-team-formulation
id: l-e9b8785f
scope: repo
status: active
src: agent
touches:
  - app/house/page.tsx
  - app/page.tsx
  - app/llms.txt/route.ts
  - components/Footer.tsx
---

## Decided
- Owner rule (2026-11-05): "The House of Chiarel develops formula. It is a team effort." Every formulation-credit sentence says the House of CHIAREL develops it as a team, with Grazia Savoriti credited as the team's pharmacist.
- Applied in app/house/page.tsx, app/page.tsx (FAQ), HomeFormulator, shop/[slug]/page.tsx, the journal story, founding-100 and app/llms.txt/route.ts.

## Tried and ruled out
- Keeping "under her guidance" or "develops every formulation directly": they contradicted each other and both read as sole authorship.

## Watch out
- Credit wording lives in many files; grep "guidance", "directly", "Formulated by" before adding any new copy.
- components/Footer.tsx ("Formulated by a pharmacist") is off-limits; "under pharmacist guidance" in PurchaseOptions and HomeHero was left as compatible.
