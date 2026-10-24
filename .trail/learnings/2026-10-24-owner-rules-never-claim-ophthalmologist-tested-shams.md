---
title: "Owner rules: never claim ophthalmologist tested; supplier quotes are not website blockers; V19 artwork lives in Downloads CHIAREL_V19_Fuyao"
author: Shams
date: 2026-10-24
branch: feat/v19-packshots
id: l-c0780879
scope: repo
status: active
src: agent
touches:
  - public/assets/products/eye-contour-concentrate-jar.png
  - public/assets/products/chiarel-essence-jar.png
---

## Decided
The owner said the Eye Contour Concentrate is not ophthalmologist tested and nothing may claim it (the master brief's glass line mentions it, ignore that). Supplier and carrier quotes are not website blockers, so do not list them as open website items. The final packaging artwork is RFQ V19 in Downloads\CHIAREL_V19_Fuyao (artwork SVGs, proof PDF): the site packshots keep the same file names and carry that lettering (CHIAREL / ITALIA, Clarity name, concern line). Glass colours are binding from V19: Red Ochre #913832, Formal Garden #1F5129, Peach Dust #F0D8CC; the Eye bottle is Peach Dust with ink #9B7B2E.

## Tried and ruled out
Heavier inpainting of old label text with horizontal/vertical interpolation smeared across sharp glass edges near the base arc of the jars and bottles; leaving the correct size text (40ml, 50g) in place and only erasing wrong text avoided those edges. The V19 SVGs are flat label art, not product photos, so packshots are composites on the old renders, not new photography.

## Watch out
Studio and lifestyle photos (essence/terra/masque studio, N1 marble and honeycomb, terra editorial/capri) still show old product names and cannot be fixed from the artwork. The host CDN can keep an old image for returning visitors because it overrides revalidation on /assets.
