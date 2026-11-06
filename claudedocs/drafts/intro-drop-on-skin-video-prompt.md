# CHIAREL intro: drop on skin, video prompt (v1, 2026-10-19)

Purpose: one 8-second hero clip for the home intro. A drop of golden essence lands on skin, a soft wave travels outward from the point of impact, and the skin it passes through is left calmer and more luminous. It replaces the current SVG ripple intro.

Research basis (third-party prompt guides, not Google's official docs; check current Veo/Flow limits before use): a five-part structure works best (camera, subject, action, context, style plus audio); lead with the camera term; one scene, one main action; keep the core prompt short because long prompts get their second half ignored; lighting vocabulary is followed precisely; luxury-skincare spots share a macro lens, shallow depth of field, a golden droplet in slow motion, warm soft window light, and a clean ending.

## What was wrong with the first build

It showed a drop into a pool of liquid, then rings that expanded past the screen. The brief is different: the surface is skin, the ripple is the skin responding, and the effect on the skin is the story.

## Master prompt (paste as is)

**Camera:** Extreme macro, 100mm lens, locked-off tripod shot, camera 25 degrees above the surface, shallow depth of field, ultra slow motion look.

**Subject:** A single teardrop of golden serum, translucent amber with a bright specular highlight, falling toward smooth, healthy, fair-to-medium skin on the neck and décolleté. No face, no hands, no product bottle in frame.

**Action (0 to 8 seconds):**
- 0.0 to 2.0: the drop hangs at the top of frame, then falls straight down in slow motion.
- 2.0 to 2.6: it touches the skin at the exact centre of frame. The skin dips softly and a tiny crown of gold rises and settles. No splash, no liquid pool.
- 2.6 to 6.0: one slow, soft wave of light travels outward from the centre in all directions, as a circular swell in the skin surface. Behind the wave, the skin looks smoother, more even and gently luminous, with a warm translucent depth beneath the surface, as if light is reaching below it. The wave is felt as light and surface movement, not as drawn lines.
- 6.0 to 8.0: the wave reaches the frame edges and fades. The skin is calm and evenly radiant. The centre stays clean and empty.

**Context:** Neutral ivory and champagne tones (#F8F6F1 background, #D6C5A0 accents), soft diffused window light from the upper left, a faint warm rim light, no props, no text.

**Style and audio:** Luxury skincare film, quiet and unhurried, editorial and precise, like a high-end beauty campaign. Audio: a single soft liquid touch at impact, then a low, calm room tone. No music, no voice.

**Format:** 8 seconds, 16:9 (also render 9:16). 24 fps look, slow motion.

## Condensed version (under 400 characters, for tools with short limits)

Extreme macro, locked-off, 100mm, shallow depth of field. A single golden serum drop falls in slow motion onto smooth neck skin and touches it at centre frame; the skin dips softly. A slow circular wave of soft light travels outward across the skin, leaving it smoother and gently luminous with warm depth beneath. Ivory and champagne palette, soft window light, quiet luxury skincare film. No text, no hands.

## Negative prompt (if the tool has the field)

splash, liquid pool, water, bubbles, oil slick, sparkles, glitter, lens flare, face, hands, fingers, bottle, dropper, jar, text, logo, watermark, cross-section, anatomy diagram, layers diagram, needles, blemishes, redness, wrinkles, before and after, split screen, fast motion, shaky camera, extra drops

## Why each choice

- **Locked-off, high frame rate look:** reads as expensive and lets the single moment be watched.
- **Skin as a soft elastic surface:** a drop on skin does not splash; it presses and spreads. Asking for a dip and a swell avoids the "water" look.
- **Wave as light, not rings:** line-drawn rings look like water or a graphic. A moving swell of light with a smoother, brighter surface behind it shows the effect, which is the point.
- **Translucent depth, not a cross-section:** it suggests the skin beneath without an anatomical diagram, which would read as a medical claim.
- **Clean centre and edges:** leaves room to place the CHIAREL wordmark in HTML afterwards, so no logo or text is generated (AI text is unreliable and it must read as the real Libre Bodoni wordmark).

## Claims guardrail for this visual

The clip is a metaphor. Do not caption it with "penetrates", "reaches deeper layers", "rejuvenates", "repairs" or any result claim. Use outcome language only, for example "Advancing Cellular Clarity™". The two approved claims remain the only claims.

## How it goes on the site

1. Export a short H.264/MP4 and a WebM (about 1 MB each at 1080p), muted, plus a poster still.
2. Home intro plays it once per session over the ivory overlay, then the wordmark rises in at about 6 seconds, as the wave leaves the frame. Skip, tap to skip, reduced-motion skip and the session flag stay.
3. If the video cannot load or autoplay, fall back to the poster still and the existing SVG intro.
4. Label it as AI-generated if the tool requires it (and where the platform asks, on social).

## Iteration notes

Generate 4 takes of the master prompt. Judge them on: (1) does the skin dip rather than splash, (2) is the wave readable as light on skin and not water, (3) is the skin calmer behind the wave, (4) is the centre clean at the end. If the wave looks like rings, add "no visible rings or lines, only a soft swell and a change in sheen". If the skin looks wet, add "dry matte skin, serum absorbs on contact".
