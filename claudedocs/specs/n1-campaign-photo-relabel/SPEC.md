# Spec: Relabel N1 in the prototype's campaign photography

## Problem

The prototype asset library (`website/chiarel/assets/`, a sibling repo) has real campaign photography
of N1 — application shots, lifestyle shots, and a hero lineup shot — that production doesn't have.
Per the earlier site audit and the [[product-image-gallery]] work already shipped, this is exactly the
kind of texture/application/lifestyle content N1's gallery needs and currently lacks (N1 still ships
with a single jar-only image, unlike Essence/Terra/Masque which now each have two).

Every one of these images shows the N1 jar with the same stale, unsupported label text —
"Firming & Smoothing Treatment" — already corrected on production's own jar render (now reads
"Fragrance-Free Nightly Emulsion", see the `product-image-gallery` work). These campaign photos were
rendered before that correction and never updated.

## Who it's for

The site visitor viewing N1's product gallery once it has real application/lifestyle photography
alongside the hero jar shot — same audience as [[product-image-gallery]].

## What "solved" looks like

- Each of the 5 images below shows the corrected label text ("Fragrance-Free Nightly Emulsion"),
  legible and consistent with every other N1 asset (the production jar render, and the site's actual
  product copy).
- The correction is visually seamless at the resolution each image is actually displayed at — no
  visible patch edges, mismatched lighting, or off-color text.
- Once corrected, these become legitimate `gallery` entries for N1 in `data/products.json`, using the
  same shot-list roles defined in `product-image-gallery/SPEC.md` (hero, application, lifestyle).

## In scope — the 5 images

| File (in `website/chiarel/assets/`) | Current framing | Target role |
| :-- | :-- | :-- |
| `n1-jar.webp` | Clean white-bg studio shot, front-on, label large and sharp | `hero` (alternate to the current jar render) or `detail` |
| `studio-n1.jpg` | Jar in focus, blurred model behind, plain light bg, front-on | `application` |
| `ritual-1.jpg` | Jar on marble counter, editorial lifestyle, front-on, smaller in frame | `lifestyle` |
| `ritual-2.jpg` | Jar on a stone ledge, real Isola del Liri backdrop, front-on, smaller in frame | `application` or `lifestyle` |
| `hero-campaign.jpg` | Jar is one of 4 in a lineup shot, real Isola del Liri backdrop, small in frame | homepage/site hero candidate (not a per-product gallery role) |

All 5 are near-front-on shots of the jar's front label (confirmed by inspection — no significant
perspective skew), which is what makes this tractable at all: the same reconstruct-background-then-redraw
technique used for the production render applies, just once per image, with each image's own lighting/
color grading matched individually.

## Out of scope

- Any image not listed above (the other studio-*/ritual-* shots already in scope for
  [[product-image-gallery]] use Essence/Terra/Masque, which already have correct labels — not touched here).
- Wiring the corrected images into `data/products.json`'s N1 entry or the homepage — that's a fast
  follow-up once the images are corrected and reviewed, not part of this retouching task, so each
  correction can be checked individually before anything goes live.
- Any change to N1's actual product copy, price, or claims elsewhere on the site.
- Re-shooting or regenerating new photography — this is strictly correcting the existing assets.

## Constraints (from CONSTITUTION.md)

- No AI-invented product art — this is a correction of real photography's existing label text, not
  fabricating new imagery. The jar, model, and setting stay exactly as photographed; only the label
  text region changes.
- Light/high-key visual treatment is already present in the source photography — nothing to change there.
- Claims discipline: the corrected text must match what's already approved and live ("Fragrance-Free
  Nightly Emulsion"), not a new claim.
