# Tasks: Product image gallery

Ordered, each concrete enough to implement without re-deriving PLAN.md.

1. **Type/data model** — add `ProductGalleryImage` type and optional `gallery?: ProductGalleryImage[]`
   to `Product` in `lib/products.ts`. No `data/products.json` changes (no product sets it yet).

2. **Build `components/ProductGallery.tsx`**
   - Props: `images: ProductGalleryImage[]`, `step?: string | null`, `badge?: string`.
   - Single-image path: renders current `ProductHeroImage` behavior unchanged (entrance animation,
     badge, sizing) — verify visually against production today's N1/other PDPs before moving on, since
     this must be a no-op for every existing product.
   - Multi-image path: main frame + thumbnail rail, click/tap to switch, mobile swipe (scroll-snap,
     matching `RitualCarousel`'s pattern), keyboard arrow-key navigation, `aria-current`/live-region
     active-state announcement, reduced-motion fallback.
   - Owns the `NEUTRAL_FRAME_BG` frame internally (moved from the page, per PLAN.md).

3. **Wire into `app/shop/[slug]/page.tsx`**
   - Replace the current gallery-column `div` + `ProductHeroImage` call with `ProductGallery`, passing
     `p.gallery ?? [{ src: p.image, alt: productImageAlt(p), role: "hero" }]`.
   - Remove the now-redundant standing code comment about the column being "sized to take a second/third
     thumbnail" (this task makes that comment obsolete — replace it with a short note pointing at this
     spec folder instead, per this repo's existing comment style of linking to the relevant plan doc).

4. **Accessibility pass** (see PLAN.md checklist) — keyboard nav, alt text distinctness, focus states,
   reduced-motion, screen-reader active-image announcement. Test with keyboard-only navigation and with
   OS-level reduced-motion on, not just visually.

5. **Regression check across every existing product page** — every current product (single image, no
   `gallery` field) must render pixel-equivalent to production today. This is the task most likely to
   silently break something if skipped: the frame ownership moved from the page into the component.

6. **N1 shot-list note** — add a short section to this spec folder (or a `NOTES.md`) recording the
   intended image roles for N1 once photography exists (hero jar / texture macro / on-skin application /
   lifestyle / ingredient still life, per SPEC.md), so whoever commissions the shoot has the list. Does
   not create any image files.

## Explicitly not a task here

- Populating `data/products.json` with a real `gallery` array for N1 or any product — blocked on real
  photography per SPEC.md's Out of scope, owner-gated separately.
- Lightbox/zoom, video slot, desktop side-by-side thumbnails — fast-follow candidates, not this build.
