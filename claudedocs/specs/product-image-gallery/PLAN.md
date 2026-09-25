# Plan: Product image gallery

Grounded against SPEC.md and CONSTITUTION.md. No code changes in this phase.

## Data model

Extend `lib/products.ts`'s `Product` type with an optional `gallery` field, additive and backward
compatible — every existing product keeps working unchanged via the existing `image`/`imageIsPlaceholder`
fields.

```ts
export type ProductGalleryImage = {
  src: string;
  alt: string;
  /** Optional shot-list tag, for future shot-planning use — not rendered. */
  role?: "hero" | "texture" | "application" | "lifestyle" | "ingredient" | "detail";
};

// Added to Product:
gallery?: ProductGalleryImage[];
```

Rationale for the richer object form over a plain `string[]` (resolves SPEC open question 1): per-image
alt text is an accessibility requirement (`productImageAlt` already treats alt text as something that
varies per product state, e.g. the placeholder-pending case — a gallery needs that same care per image,
not one alt string reused across five images). `role` costs nothing to add now and gives whoever plans
the N1 photo shoot a place to record the shot list this spec's "in scope" section promises.

**`gallery` is optional.** When absent (every product today), the page renders exactly as it does now —
this is the mechanism that keeps "solved" true for the single-image case without a special code path.
When present, `gallery` is the source of truth for the gallery UI; `image`/`imageIsPlaceholder` remain
as today for anywhere else that still reads a single image (OG tags, `RitualCarousel`, cart drawer,
etc. — none of those change in this feature).

`data/products.json` itself needs **no edits** in this feature — no product has a `gallery` array yet
(see Out of scope: no new photography exists). N1's entry gets one once real assets exist, as a
follow-up data change, not part of this build.

## Component architecture

New component: `components/ProductGallery.tsx`, `"use client"`, replacing the direct
`<ProductHeroImage>` call in `app/shop/[slug]/page.tsx`'s gallery column.

- **Single-image case** (`gallery` absent or length 1): renders `ProductHeroImage` exactly as today —
  same entrance animation, same badge overlay, same sizing. `ProductGallery` is a thin wrapper here, not
  a rewrite of working code.
- **Multi-image case**: main image area (same aspect-ratio frame, same `NEUTRAL_FRAME_BG`) plus a
  thumbnail rail below (mobile) / beside (desktop, if it fits within the existing two-column layout —
  default to below on both breakpoints for v1 to avoid fighting the sticky column width; revisit as a
  fast-follow if design wants side-by-side).
  - Thumbnail click/tap sets the active index; active thumbnail gets a visible selected state (border
    in champagne/ochre, matching existing accent color usage elsewhere on this page).
  - Swipe gesture on mobile for the main image (touch drag between images) — consistent with the
    existing scroll-snap pattern already used in `RitualCarousel`, reusing that same interaction
    language rather than inventing a new one.
  - Keyboard: left/right arrow changes active image when the gallery has focus; each thumbnail is a
    real `<button>` with an accessible label (`aria-label="View image N of M: <role or product name>"`),
    not a `div` with a click handler.
  - Respects `useReducedMotion` the same way `ProductHeroImage` already does — no motion-heavy
    transition between images when reduced motion is requested; a plain crossfade or instant swap
    instead.
- Badge (`p.badge`) renders on the *active* image's frame, matching today's single-image placement —
  not per-thumbnail.

No new dependency. Framer Motion (`motion/react`) is already a project dependency (used in
`ProductHeroImage`) and is sufficient for the crossfade/transition; no separate carousel library needed
for a component this scoped.

## Integration point

`app/shop/[slug]/page.tsx`, the gallery column (current lines ~114–129):

```tsx
<ProductGallery
  images={p.gallery ?? [{ src: p.image, alt: productImageAlt(p), role: "hero" }]}
  step={p.step}
  badge={p.badge}
/>
```

This normalizes the single-image case into the same shape the multi-image case uses, so
`ProductGallery` has exactly one code path to read from, not two. `productImageAlt` stays the single
source of truth for the fallback/placeholder alt-text logic; `ProductGallery` doesn't reimplement it.

The `NEUTRAL_FRAME_BG`-backed wrapper `div` currently in the page moves *inside* `ProductGallery` (the
component owns its own frame now, since it needs to size the thumbnail rail relative to it) — the page
stops rendering that wrapper directly.

## Accessibility checklist (validated at implement time, not deferred)

- Each image has real, distinct alt text (never a shared/generic string across images).
- Thumbnail buttons are keyboard-reachable and labeled.
- Active image state is announced (e.g. `aria-live="polite"` region or `aria-current` on the active
  thumbnail) so a screen-reader user knows which image is showing.
- No motion plays for users with `prefers-reduced-motion`.

## What this does NOT touch

- `data/products.json` price/claims/SKU fields.
- `RitualCarousel`, cart drawer, OG image tags — all keep using `p.image` as today.
- Any other product's page rendering — this only changes the gallery column, and only visibly changes
  behavior for a product that actually sets `gallery` (none do yet).

## Fast-follow candidates (not this build)

- Full-screen lightbox/zoom on click.
- Side-by-side thumbnail rail on desktop instead of below-image.
- Video slot alongside images once video assets exist.
