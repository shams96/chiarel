# Spec: Product image gallery

## Problem

Every product page (`app/shop/[slug]/page.tsx`) shows exactly one image. A site audit benchmarking
chiarel.com against La Mer and Augustinus Bader (the authority-site reference points for this brand)
found this is the single biggest visible gap between CHIAREL and an "elite agency" PDP: both comparison
brands run 5–6 images per hero product (macro texture, on-skin/applicator shot, lifestyle, ingredient
still life, packaging detail) plus video. CHIAREL runs one static jar shot, and N1 — the current launch
hero — doesn't even have real photography yet (`imageIsPlaceholder: true` in `lib/products.ts`, confirmed
against the live site).

The gallery-column code already anticipates this: `app/shop/[slug]/page.tsx` has a standing comment
that the column is "sized to take a second/third thumbnail or video without restructuring once more
assets exist." This spec is that restructuring.

## Who it's for

The site visitor evaluating whether to buy — the gallery is a trust/consideration tool, not decoration.
Per the earlier audit's homepage/product-page requirements, a visitor should be able to answer "what
will it feel like" partly from images alone (texture, application, real use), not just copy.

## What "solved" looks like

- A product page can display **1 to N images** in a real gallery UI — thumbnails or dots for
  navigation, a way to move through images (click/tap/swipe), without page restructuring per product.
- A product with only one image (every product today) renders exactly as it does now — no empty
  thumbnail rail, no broken affordance for a gallery of one.
- The data model supports attaching more than one image to a product without a schema rewrite for
  every existing product entry.
- N1 is the first product to actually use it, once real assets exist for it (see Assets below) — but
  the component itself is shared, not N1-specific, so the next product that gets a real photo shoot
  doesn't need new gallery code.
- Reduced-motion and mobile behavior match this site's existing standards (see `ProductHeroImage`'s
  existing `useReducedMotion` handling, and the page's existing mobile-vs-desktop aspect ratio split).

## In scope

- Gallery **component and data-model** work: how a product carries multiple images, how they're
  displayed, thumbnail/dot navigation, keyboard and touch support, accessibility (alt text per image,
  not one alt text reused for all).
- Wiring it into `app/shop/[slug]/page.tsx` in place of the current single `ProductHeroImage` usage,
  preserving the existing sticky-column / aspect-ratio / badge behavior for the single-image case.
- A documented plan for what N1's gallery should eventually contain (image roles: hero jar, texture
  macro, on-skin application, lifestyle, ingredient still life) so whoever commissions the photography
  knows the shot list — **without fabricating placeholder images to fill those slots now**.

### Shot-list background treatment (uniformity rule)

Every image should read as one consistent, light/high-key gallery — but "uniform" means consistent
*frame and grading*, not literally the same background technique for every shot. Two of the roles are
isolated product-only subjects with nothing else in frame; the rest are inherently scene-based (skin,
hands, a surface) and can't be transparent without faking or omitting the scene:

| Role | Background treatment | Why |
| :-- | :-- | :-- |
| `hero` (jar/packaging alone) | **Transparent PNG**, composited onto `NEUTRAL_FRAME_BG` | Already this brand's convention — every jar in `10k-websites/` is a transparent cutout; free consistency, no new work. |
| `ingredient` (the raw ingredient or jar alone, no scene) | **Transparent PNG**, same frame | Same reasoning as `hero` — it's a product-only subject, not a scene. |
| `texture` (macro of the formula's texture) | Real photography, light/high-key grading, no alpha | There is no "product alone" to cut out — the texture only exists smeared on a surface or fingertip. |
| `application` (on-skin use) | Real photography, light/high-key grading, no alpha | Requires real skin in frame; forcing transparency here means not shooting it at all. |
| `lifestyle` (context/mood) | Real photography, light/high-key grading, no alpha | Same reasoning — the point of a lifestyle shot is the scene. |

Uniformity across the scene-based shots (`texture`, `application`, `lifestyle`) comes from the same
high-key, no-dark-background rule already enforced sitewide (see CONSTITUTION.md), applied consistently
to that shoot — not from an alpha channel. Do not ask a photographer to shoot on a green screen or force
a cutout for these roles; it produces a worse, faked result, not a more consistent one.

## Out of scope (explicitly)

- **Commissioning or generating new photography.** No new N1 images exist yet beyond the corrected jar
  render. This spec does not create them — per the constitution, AI-invented product art is not an
  acceptable substitute, and the owner hasn't approved a shoot. The gallery ships functionally complete
  for one image; it displays more only once real assets are provided.
- **Video support.** The existing code comment mentions video as a future possibility; this spec covers
  images only. A follow-up spec if/when video assets exist.
- **Changing any other product's data, copy, price, or claims.** This is a display-layer feature only.
- **A full-screen lightbox/zoom experience.** Nice-to-have, not required for "solved" — flagged as a
  possible fast-follow in the plan, not built now.
- Extending this pattern to the homepage `RitualCarousel` (different component, different job — showing
  one image per product across the ritual, not multiple images of one product).

## Constraints (from CONSTITUTION.md)

- No AI-invented or placeholder-as-final imagery — see Out of scope above.
- Light/high-key visual treatment only (matches `NEUTRAL_FRAME_BG` already used for the single-image
  frame today).
- No claims implied by new alt text or captions beyond what's substantiated.
- No silent scope creep into pricing, SKU, or claims data in `data/products.json`.

## Open questions for the owner (non-blocking — plan proceeds with the safe default noted)

1. Should the data field be `images: string[]` (simple list, first = hero) or an array of objects with
   per-image alt text and an optional "role" tag (texture/application/lifestyle/etc.)? Plan defaults to
   the richer object form since per-image alt text is an accessibility requirement, not a nice-to-have.
2. When N1 photography is ready, will it come as a batch (all shots at once) or trickle in? Doesn't
   change the component, only whether N1 ships with 1 or several thumbnails on day one.
