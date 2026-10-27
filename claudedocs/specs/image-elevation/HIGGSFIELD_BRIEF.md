# CHIAREL scene plates: Higgsfield brief

Goal: Guerlain-level scene photography for the five products (a world per product, props, texture, depth), without AI-garbled lettering on the packs.

## The workflow that keeps the labels exact

AI image tools garble small label text (we saw it on the old jars). So:

1. **Generate the scene plate in Higgsfield WITHOUT the product** (empty plinth/surface where the product will stand).
2. Export the plate as PNG or high-quality JPG, 2K or larger, 4:5 (hero), plus 16:9 (banner) if wanted.
3. Drop the files in `claudedocs/higgsfield/plates/` named `essence-1.png`, `day-1.png`, `night-1.png`, `neck-1.png`, `eye-1.png` (add `-2`, `-3` for alternates).
4. Claude composites the real V19 packshot into the plate: matched light direction, contact shadow, reflection, rim light, depth-of-field falloff, grain. Lettering stays exactly as on the packaging.

Alternative if you prefer to use the product reference inside Higgsfield: attach `clarity-<product>-bottle.png` / `-jar.png` as the reference, then send the output back. Claude re-letters the label afterwards (same pipeline used on the Day Crème, Neck and Night photos).

## Common settings for every plate

- Aspect 4:5 for the hero (also generate 16:9 and 9:16 when happy with a look).
- Photoreal luxury beauty campaign, shot on 85mm, shallow depth of field, soft key light from upper left.
- Leave the centre-lower third calm and empty: a flat plinth/surface about 30% of the frame width where the product will stand. Horizon of the surface at roughly 70% down the frame.
- **No product, no bottles, no jars, no text, no logos, no watermark, no hands, no people.**
- Colour grade: rich and saturated, one colour family per world. Gold accents are champagne (#D6C5A0), never yellow.
- Keep the area behind the product moderately dark or moderately light (not busy) so the glass reads.

## The five worlds

Palette hexes: Red Ochre #913832, Formal Garden #1F5129, Peach Dust #F0D8CC, Champagne Gold #D6C5A0, Cloud Dancer #F0EEE9.

### 1. Clarity Essence: the spring (red glass, 40 ml bottle)
"Luxury skincare campaign plate, no product. Crystal-clear shallow spring water over pale limestone, a wet stone plinth just breaking the surface at the centre-lower third. Caustic light ripples dancing on the stone, tiny water droplets suspended in the air, a few flecks of champagne gold leaf floating on the surface. Soft out-of-focus mossy karst rocks and warm terracotta stone behind, golden-hour sun glints. Palette: clear aqua, warm terracotta, champagne gold. Photoreal, 85mm, shallow depth of field. No product, no text."

### 2. Clarity Day Crème: the clay (red jar, 50 g)
"Luxury skincare campaign plate, no product. Sun-baked terracotta clay wall and rough warm plaster in Red Ochre, a thick travertine slab at the centre-lower third, long soft shadows of olive and lemon leaves falling across the wall, thin veins of gold leaf pressed into cracks in the clay, warm Mediterranean afternoon light. Palette: Red Ochre #913832, Peach Dust #F0D8CC, champagne gold. Photoreal, 85mm, shallow depth of field. No product, no text."

### 3. Clarity Night Crème: the garden at night (green jar, 50 g)
"Luxury skincare campaign plate, no product. Deep Formal Garden green: dark wet slate and velvety moss, a thin trickle of water running over stone, drifting mist, fern fronds in soft focus, a rim of cool champagne-gold light from behind, a dark wet stone slab at the centre-lower third. Moody, low-key, glossy droplets on the moss. Palette: Formal Garden #1F5129, near-black green, champagne gold highlights. Photoreal, 85mm. No product, no text."

### 4. Clarity Neck & Décolleté Crème: marble and waterfall (green bottle, 40 ml)
"Luxury skincare campaign plate, no product. A pale Carrara marble plinth at the centre-lower third, a misty waterfall and old stone tower softly out of focus behind, dried burgundy roses and a bare silver branch at the edges, a champagne satin ribbon trailing across the marble, cool grey-green light with warm gold highlights. Palette: cool grey-green, burgundy, champagne. Photoreal, 85mm. No product, no text."

### 5. Clarity Eye Contour Concentrate: the petals (pale peach glass, 40 ml)
"Luxury skincare campaign plate, no product. Soft blush-to-ivory gradient sky, frosted peach petals and a few pearlescent glitter flecks floating in the air, tiny ice crystals, delicate high-key light, a pearl-pink satin plinth at the centre-lower third. Palette: Peach Dust #F0D8CC, ivory, champagne. Dreamy bokeh, photoreal, 85mm. No product, no text."

## Variations to request once a look is approved
- 16:9 banner of each world (product zone left of centre, copy space right) for the Home hero and Shop banner.
- 9:16 of each world for stories and mobile.
- A 6-8 second slow push-in or drifting-droplet video of each plate (Higgsfield video), no product, for the ambient video slot on the product page.

## What comes back
- Hero 4:5 composites replacing the current studio-sweep hero on each product page, the Shop, Home and ritual tiles.
- 1200x630 share images from the same scenes.
- Optional: macro crops (label close-up, cap detail) cut from the composite for the product gallery.
