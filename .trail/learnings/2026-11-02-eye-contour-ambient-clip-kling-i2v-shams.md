---
title: "Eye Contour ambient clip: Kling i2v with a still-bottle prompt, compressed to 237 KB"
author: Shams
date: 2026-11-02
branch: redesign/p7-focus-ladder
cost: { minutes: 4, tokens: 19391 }
id: l-3d530221
scope: repo
status: active
src: agent
touches:
  - "app/shop/[slug]/page.tsx"
  - claudedocs/specs/swiss-luxury-redesign/direction/IMAGE_PROMPTING.md
  - public/assets/products/clarity-eye-contour-concentrate-ambient.mp4
  - tests/ambient-video.test.ts
  - scripts/fal-clip.mjs
---

## Decided
`app/shop/[slug]/page.tsx` shows the Eye Contour clip (`public/assets/products/clarity-eye-contour-concentrate-ambient.mp4`, poster `clarity-eye-contour-concentrate-detail.jpg`) in the same `AmbientVideo` band pattern as N1, keyed on the internal slug `eye-contour-concentrate`. The clip comes from `scripts/fal-clip.mjs eye-petals` (fal Kling 2.5 Turbo Pro image-to-video, 5 s) and is recompressed with ffmpeg to 864x1080, H.264, no audio, crf 27 (about 237 KB; `tests/ambient-video.test.ts` caps these at 3 MB).

## Tried and ruled out
Putting motion on the product: the prompt declares the bottle and label perfectly still and gives all motion to petals, droplets, satin and light, with a negative prompt naming morphing and warped letters. Sampled frames (start, middle, end) kept every label line identical. Not checked: every frame between samples.

## Watch out
Scrub any new clip before it goes live: video models drift small label text more than image models. Keep generated stills and clips out of the repo until reviewed (`FAL_OUT` in the scripts). Reduced-motion behaviour is asserted in code, not exercised in a browser.
