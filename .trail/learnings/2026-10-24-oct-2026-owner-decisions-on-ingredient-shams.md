---
title: "Oct 2026 owner decisions on ingredient disclosure, Eye Treatment name, free-from line,…"
author: Shams
date: 2026-10-24
id: l-d7d5b518
scope: repo
status: active
touches:
  - tests/no-ingredient-percentages.test.ts
  - lib/products.ts
  - components/Footer.tsx
---

## Decided
Decisions made by the owner 2026-10-16 (all merged to main, PRs #50-#54):

- **Formula of record** = `C:\Users\New User\Downloads\ChiarelAKAIsolaVitale\Aug13Activeintegration\Grazia edits Oct 7\CHIAREL_Launch_Formulas_v2_Natural_You.xlsx` (Grazia Savoriti, Natural You, v2 Oct 7 2026; tab "INCI Order (draft)"). 1A Essence, 2A Terra, N1, 4A Recovery Masque, 7A Eye. It is a chemist-review DRAFT: peptide premix carriers, the CHIAREL accord fragrance allergen declaration and IFRA are still open; consumer INCI must come from supplier declarations. Cellular Cleanser and Mist are NOT in it.
- **No ingredient percentages anywhere** on the site (luxury standard: key ingredients named, full INCI list, no %). Old site percentages and "Palmitoyl Pentapeptide-4" in Essence contradicted v2 and were removed. A test (`tests/no-ingredient-percentages.test.ts`) guards this.
- **Full INCI lists are stored but hidden** (`ingredientsInciStatus: "draft-v2"`, `publishedInci()` in `lib/products.ts`). Owner flips a product to `"final"` once Grazia/suppliers confirm. Owner approved this gating.
- **Eye product name = "CHIAREL Eye Treatment™"** (slug stays `eye-contour-concentrate`; renamed from Eye Contour Concentrate, which was too close to La Mer's "The Eye Concentrate"). Eye is an OPTIONAL "Eye Step" in the Evening routine, after the Masque and before N1, not a numbered fifth step (PRD: Eye is standalone outside the four-step ritual).
…

## Watch out
before touching ingredient copy, check the v2 workbook; never add percentages; keep INCI hidden until status "final"; see feedback-approved-claims-dont-reflag and chiarel-launch-formulas-register.
- **Fragrance (owner, 2026-10-16):** the CHIAREL accord will be a natural fragrance WITHOUT alcohol. This supports keeping "denatured alcohol" in the free-from sentence. It is the owner's statement; the supplier declaration is still pending. Do not put "natural fragrance" (or any "natural" claim) on the site until that declaration confirms it.

_From Claude Code's memory of this repo, last updated Oct 22._
