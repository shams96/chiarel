# Plan: Relabel N1 in the prototype's campaign photography

Grounded against SPEC.md. No image edits in this phase.

## Why this isn't a single copy-paste fix

The production jar render was one flat, static graphic — the label text sat in the same position, at
the same scale, under the same lighting, so one script could reconstruct the background and redraw the
text everywhere it appeared (it only appeared once). These 5 files are 5 *different photographs*: the
jar is a different size in frame, lit differently (studio softbox vs. outdoor daylight vs. reflected
marble), and in `ritual-2.jpg`/`hero-campaign.jpg` it's noticeably smaller. Stamping one flat patch onto
all 5 would look right on none of them — wrong scale, wrong color temperature, a visible rectangle where
the rest of the jar has natural glass reflections.

## What *does* get made once

One master label asset: the corrected two-line text ("NECK & DÉCOLLETÉ RENEWAL EMULSION" /
"Fragrance-Free Nightly Emulsion"), rendered clean at high resolution as gold text on a transparent
background, matching the exact typeface, weight, and kerning already established in the production fix
(Georgia Italic for the subtitle line, per the earlier patch). This master is built once.

## What happens per image (5 times, not from scratch each time)

For each of the 5 files:

1. **Locate the label plane** — the four corners of the front-label rectangle in that specific photo
   (already roughly identified for all 5 in SPEC.md's inspection; exact pixel corners get pinned down at
   implement time).
2. **Reconstruct that photo's own background** under the "Firming & Smoothing Treatment" line specifically
   — same technique as the production fix (sample clean rows immediately above/below the text and
   interpolate the gradient across it), done against *that photo's* pixels, not a shared background.
3. **Warp the master label text** to that label plane's scale and (if any) slight rotation, and recolor
   it to match that photo's own gold tone and lighting — sampled from the *other* gold text already in
   that same photo (the "CHIAREL" wordmark, "NECK & DÉCOLLETÉ RENEWAL EMULSION" line, "50g") so the
   corrected line's color/brightness matches its neighbors in that specific shot rather than a generic
   gold value.
4. **Composite and spot-check** against the photo's own neighboring text at 100% zoom before moving to
   the next image.

This is "build the asset once, adapt it five times" rather than "retouch five times from a blank canvas"
— the text content, kerning, and font never get redecided per image, only the scale/color/warp that
photography always requires when you place one graphic into five different lighting conditions.

## Order (easiest → hardest, so problems surface early on the safest image)

1. `n1-jar.webp` — flattest, largest, least background clutter; closest to the already-solved production
   case. Do this first to validate the master asset and workflow.
2. `studio-n1.jpg` — same front-on framing as #1, softer studio light.
3. `ritual-1.jpg` — smaller in frame, marble background nearby (no overlap with label region).
4. `ritual-2.jpg` — smaller still, outdoor daylight, real Liri backdrop.
5. `hero-campaign.jpg` — smallest, label is only a few dozen pixels tall; may end up illegible enough
   post-correction that it's a non-issue either way — verify at final display size, not source resolution,
   since this only ever renders as a hero banner, never zoomed.

## Tooling

Python + Pillow, same as the production fix (`georgiai.ttf` already used and confirmed available).
No new dependency. Each image gets its own script invocation with photo-specific coordinates and color
sampling — not one shared script blindly run 5 times with the same numbers.

## Review gate

Each corrected image is inspected at its real display size before being marked done — not just generated
and assumed correct. `n1-jar.webp` additionally gets compared side-by-side with the already-corrected
production render to confirm text/kerning consistency, since both may end up representing N1 on the same
page.

## Out of scope (see SPEC.md)

Wiring corrected images into `data/products.json` or the homepage happens after this task, as a
follow-up — keeps the retouching review separate from the "is this the right shot for this slot"
decision.
