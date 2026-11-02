# Generating product views with the image generator

How the missing product views were made, what was learned, and how to make more. Evidence tags: **verified** (done and inspected this session), **sourced** (read from fal's docs or a web source), **inferred**, **not verified**.

## Why this exists

Competitor product pages show a product from several views (packshot, macro, in use, mood). CHIAREL's five products had two to five gallery images each, and the Eye Contour Concentrate had two. The gallery spec forbids fabricated or placeholder imagery, so the new pictures are built from the **real packshot** as a reference, and every label is checked against the real packaging before use.

## The generator

The studio is the owner's own, on fal.ai (the key lives in `chiarel/.env.local` as `FAL_KEY`; it is read by scripts only and never typed into a form or printed). The studio app itself has no reference-image input, so the work uses fal's API directly through `scripts/fal-views.mjs`.

| Model (fal endpoint) | Reference images | Notes |
|---|---|---|
| Nano Banana 2 (`fal-ai/nano-banana-2/edit`) | up to 14 | 2K output, `thinking_level` high (sourced). Output 1856x2304. |
| GPT Image 2 (`openai/gpt-image-2/edit`) | up to 16 | Always high input fidelity; reported strong on label text (vendor claim, sourced). Output 1024x1280 here. |
| GPT Image 1.5 (`fal-ai/gpt-image-1.5/edit`) | multiple | Explicit `input_fidelity` high; about $0.20 per 1024x1536 image at high quality (sourced). Not tested. |

## What was learned (one product, small sample; treat as directional)

- **Both models reproduced every label line exactly** when the prompt transcribed the label verbatim and the real packshot was a reference (verified by zoomed comparison with the real packshot for all four kept images).
- **GPT Image 2** gave the better scenes and kept the product's glass colours truer: on the Essence, Nano Banana 2 turned the red-to-amber-to-blush glass into a flat wine red, GPT Image 2 kept the gradient and the "40ml". It also matched the typeface closely. Its output is smaller (1024x1280).
- **Nano Banana 2** gave larger files, which helped when the bottle is small in frame (the model studio shots), so its label stayed legible.
- Failure seen once: a candidate drew a pump nozzle inside the cap and set the label in dark ink instead of gold. It was rejected on review. This is why every output is compared with the packshot before use.

## The prompt method

1. **Pass the real transparent packshot** as a reference, flattened on the site's neutral frame colour so the model sees a clean product.
2. **Name what to preserve**: bottle silhouette, glass colours and gradient, cap and finish.
3. **Transcribe the label line by line**, with typeface, colour and position, and say "exactly these lines and nothing else"; forbid other text on the product.
4. **Say how to use each reference** ("image 1 is the composition, image 2 is the exact product").
5. **Specify the shot**: scale of the product in frame, light direction, lens ("100mm macro, shallow depth of field"), surface, what floats in the air.
6. **Forbid extras**: no extra bottles, no watermark, no captions, no other text.
7. **Generate two candidates, review against the real packshot at zoom, keep one.** Label correctness is a human check; no automated OCR was used.

The exact prompts are in `scripts/fal-views.mjs` (run with `--dry` to print one). Per-product label transcriptions are in the `PRODUCTS` table there.

## Assets made and kept (provenance)

| File | Model | From | Check |
|---|---|---|---|
| `clarity-eye-contour-concentrate-studio.jpg` | Nano Banana 2 | existing Essence studio shot (composition and model) plus the Eye Contour packshot | Label exact; same model and pose style as the other studio shots |
| `clarity-eye-contour-concentrate-detail.jpg` | GPT Image 2 | Eye Contour packshot plus its existing scene (mood only) | Label exact, gold, correct cap |
| `clarity-neck-decollete-creme-studio.jpg` | Nano Banana 2 | existing Essence studio shot plus the Neck packshot | Label exact |
| `clarity-essence-detail.jpg` | GPT Image 2 | Essence packshot plus the existing Isola del Liri spring scene (mood only) | Label exact, glass gradient and "40ml" kept |

Rejected: one Eye Contour detail (dark lettering, pump nozzle), one Eye Contour studio (soft focus), the Nano Banana 2 Essence detail (glass colour wrong), the GPT Image 2 Neck studio (bottle too small to read).

## Open points for the owner

1. **AI imagery disclosure.** These pictures, and the existing model studio shots, are generated or edited. Decide whether and where to label them (some retailers and regions expect it). Not verified: whether the existing studio shots are AI-generated.
2. **Model likeness.** The studio shots use one recurring model. The new shots keep the same face. Confirm the rights and release for that likeness.
3. **No implied results.** These are product-and-mood pictures; none shows before/after skin. Keep it that way (the site's claims tests ban before/after in home and shop).

## Video

`scripts/fal-clip.mjs <clip>` turns an approved still into a 5-second clip with fal's Kling 2.5 Turbo Pro image-to-video (`fal-ai/kling-video/v2.5-turbo/pro/image-to-video`, about $0.35 per 5 seconds, sourced). Other image-to-video models on fal (sourced): Seedance 2.0, Veo 3.1, Kling 3.0 Pro; prices vary by model and audio.

Prompt rules that carry over from the stills: one slow camera move; the product and its label declared perfectly still and sharp; all motion given to everything that is not the product (petals, droplets, satin or water, light); a negative prompt that names the failure modes (morphing, warped letters, flicker, shake, cuts); `cfg_scale` 0.6. Two clips are defined: `eye-petals` and `essence-water`.

**Pilot, verified:** `eye-petals` (from the approved Eye Contour detail still) came back 1288x1608, 24 fps, 5.04 s. The first, middle and last frames were compared at zoom: every label line (CHIAREL / ITALIA / CLARITY EYE CONTOUR CONCENTRATE / For puffiness, dark circles and fine lines / 40ml) is identical in all three, and the bottle shape and gold finish hold. Not verified: every frame between those three, so a clip should still be scrubbed before it goes live.

Before any clip goes on the site it needs a player treatment like the existing N1 ambient video (muted, looping, no autoplay for reduced motion, a still as poster) and a size check.
