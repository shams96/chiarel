# Tasks: Relabel N1 in the prototype's campaign photography

1. **Build the master label asset** — clean gold-on-transparent render of "Fragrance-Free Nightly
   Emulsion" (and confirm "NECK & DÉCOLLETÉ RENEWAL EMULSION" doesn't also need touching in any of the
   5 — it was already correct pre-fix, only the subtitle line changed). Georgia Italic, matching the
   production fix's size/kerning ratio scaled to a high base resolution so it downsamples cleanly.

2. **`n1-jar.webp`** — locate label plane, reconstruct background, warp + recolor master text, composite,
   spot-check against production's corrected render for consistency. This is the validation run for the
   workflow before touching the other 4.

3. **`studio-n1.jpg`** — same steps, photo-specific coordinates and gold-tone sampling.

4. **`ritual-1.jpg`** — same steps; smaller label region, so check legibility post-correction at the
   image's actual display size, not just source resolution.

5. **`ritual-2.jpg`** — same steps; outdoor daylight grading, sample gold tone from this photo's own
   "CHIAREL" wordmark rather than reusing studio-shot values.

6. **`hero-campaign.jpg`** — same steps; verify first whether the label is even legible at the size this
   image is actually displayed (hero banner, not zoomed) — if the original "Firming & Smoothing" text
   was already effectively unreadable at display size, note that and deprioritize the fix rather than
   spend the same effort as the other 4 for no visible benefit; if it is legible (as confirmed during
   the earlier crop-zoom check), correct it.

7. **Side-by-side review** — all 5 corrected images plus the production render, viewed together, before
   calling this done. Catches inconsistent gold tone or kerning across the set that a one-at-a-time
   check might miss.

## Explicitly not a task here

- Adding any corrected image to `data/products.json`'s N1 `gallery` field — follow-up task once these
  are reviewed and approved, per SPEC.md's Out of scope.
