# Proposal: the Focus Ladder

A typographic direction for CHIAREL™, built on Swiss / International Typographic Style and aimed at a gap in luxury skincare. A static rendition is in `rendition.html` (same folder). Nothing in the built site was changed; this is a separate branch (`proposal/typographic-direction`) containing only this folder.

Evidence tags: **observed** (seen on screen this session), **sourced** (a source I read), **inferred** (my reasoning), **not verified**.

## 1. What we are solving

The built redesign has the grid, the tokens and the discipline of Swiss Style, but none of its expressive typography. The reference posters (Müller-Brockmann tradition: scale ladders, offset display words, directional type, visible grids) get their effect from how type is used. Our largest type is about 88px and the rest of the site is tidy but quiet. That is correct, and also forgettable.

## 2. Research

**Swiss Style (sourced, secondary sources only).** Grid as the ordering system; asymmetric composition; flush-left, ragged-right text; sans-serif type; whitespace and documentary photography. Müller-Brockmann's grid book treats the grid as discipline ("Working within the grid system means submitting to laws of universal validity"). I could not reach a primary source, so the claims about asymmetry and scale contrast rest on secondary summaries and on the reference posters you shared.

**Competitors (observed, first screen only).** I opened six brand sites in the browser pane. Five loaded; La Mer would not render. I did not accept any cookie banners, so every view was partly covered.

| Brand | First screen |
|---|---|
| Augustinus Bader | Dark navy full-bleed hero, small logo, headline over the image |
| Aesop | Dark cinematic photo, small serif wordmark, centred caption, outlined button |
| La Prairie | Dark atmospheric product shot, centred all-caps tagline, outlined button, promo bar |
| Dr. Barbara Sturm | Promo bar and a pop-up offering a first-order discount over a dark hero |
| Sisley | Saturated festive illustration, centred serif wordmark, centred headline |
| La Mer | Did not render (not verified) |

**Pattern (inferred from five first screens, not a statistical claim).** Luxury skincare presents itself the same way: dark or moody photography, centred and symmetric composition, small type, outlined buttons, and promotions in the chrome. The sector has borrowed the language of fragrance and fashion. Trade articles also describe a "clinical turn" in beauty (a vendor blog and a 2021 packaging column; directional, not authoritative), which none of these first screens expressed in type.

**The gap (inferred).** Nobody I saw is combining clinical precision with a confident typographic grid on a light ground. CHIAREL's own story (a pharmacist, a laboratory in Isola del Liri, "clarity") suits it, and the name itself points to it.

## 3. The direction: the Focus Ladder

One idea: **clarity as typography**. The tagline is already "Advancing Cellular Clarity™". We set the word at falling sizes, from a large hairline outline to a small solid letter, so the eye reads the ladder as something coming into focus. It uses the Swiss scale ladder (as in the Stolarski poster) and needs no claim: it is a metaphor on the existing wording.

Rules of the system (Swiss rules, adapted to luxury):
1. **One typeface.** Libre Bodoni only (variable 400 to 600). Hierarchy comes from scale, outline versus solid, tracking and position, not from a second font.
2. **Extreme scale contrast.** Mega display (up to about 26 percent of its column) next to 17px body. Mid-scale sizes are rare.
3. **The visible grid.** The 12/8/4 column grid is shown as hairline guides in the preview (toggle: G). On the live site it would show in the hero only, or not at all, as an owner choice.
4. **Asymmetry.** Headlines break across columns and step to the right (as with "TYPE / TECHNIQUES"). Nothing important is centred.
5. **Numerals as structure.** Large outline numerals 01 to 05 carry the ritual index.
6. **Specification, not description.** Product facts are a ruled sheet (step, size, glass colour, where made) using data already on the site.
7. **Directional type, used once.** A vertical outline word (Isola del Liri) on a full-bleed Red Ochre field.
8. **Colour as fields, not decoration.** Cloud ground; Red Ochre for one block per page; Garden reserved; ink for type. No dark photography as the ground.
9. **Restrained motion.** The ladder rises once, 90ms steps, off under reduced motion. Hover changes a numeral from outline to solid. Nothing else moves.

**Where it differs from the sector:** light, left-weighted, structural, and typographic first, with the photograph treated as a hard-edged plate on a colour block, not a full-bleed mood.

## 4. Type scale (additions to the live tokens)

| Role | Size | Notes |
|---|---|---|
| Ladder row 1 to 6 | 26, 18, 12.5, 8.8, 6.2, 4.4 cqw of the ladder column | Fill 0, 12, 32, 58, 82, 100 percent ink; 1px outline stroke; row 6 solid |
| Display (statement) | clamp(2.5rem, 1.1rem + 6.2vw, 6.5rem) | Line 2 offset to column 4 |
| Index numeral | clamp(3.5rem, 2rem + 7vw, 9.5rem) | Outline only, decorative (aria-hidden) |
| Vertical word | clamp(3.25rem, 1.2rem + 9vw, 11rem) | Outline, once per page |
| Existing tokens | eyebrow 12px, caption 13px, body 17px, h3 28px, h2 32 to 44px | Unchanged |

Rules: outlines only at 48px and above (a hairline outline is not legible small); the 12px floor still applies; every outlined element is decorative and its words are present as real text elsewhere (the hero uses a screen-reader-only `h1`).

## 5. What the rendition shows

`rendition.html` (open it with `python -m http.server` from this folder, or directly in a browser):
1. **Hero:** the ladder beside a hard-edged photo on a Red Ochre block, with a vertical label.
2. **Statement:** the approved headline, staggered across columns.
3. **Ritual index:** five rows with outline numerals, descriptors and thumbnails.
4. **Specification:** the Essence as a ruled sheet.
5. **Place:** a full-bleed ochre field with vertical type and the existing House paragraph.
6. **Grid toggle** (button or G).

All copy, product names, descriptors, sizes and photographs already exist on chiarel.com. I invented no claims. Checked: at 390, 768, 1024 and 1440px there is no horizontal overflow and no text under 12px (small text counted at 768); one font family (checked at 768). Seen on screen at 1440 and 390px only; the 768 and 1024px screenshots timed out. Contrast, computed from the tokens: ink on Cloud 15.4:1, Red Ochre on Cloud 5.6:1, ivory on Red Ochre 5.9:1 (all above the 4.5:1 AA minimum). Not checked: keyboard use beyond the grid toggle, other browsers.

## 6. Risks and honest caveats

1. **Tone.** Large type can read as loud, not luxurious. The mitigation is hairline outlines, a light ground, and one colour block per page. If it feels loud in review, reduce the ladder to four rows and the display size by about a quarter.
2. **Conversion is untested.** Nothing here has had users. The hero must still lead to one action; the rendition omits the buttons, so a real build needs the "Begin the Ritual" call to action placed on the grid.
3. **Hairline outlines render differently by browser** (`-webkit-text-stroke`). Fine in Chrome and Safari; Firefox supports it as well, but I checked only Chrome.
4. **Research is thin.** First screens only, under cookie banners, one competitor unseen, and secondary sources on Swiss Style. It is enough to see the pattern, not to prove the gap.
5. **Performance.** The ladder is text and CSS; no new fonts or images. A real build adds no weight beyond what exists.
6. **Brand rules kept:** one typeface, approved colours, no claims, no percentages, footer rules unchanged. The one new piece of copy is none.

## 7. If you approve: rollout (each step a PR for review)

1. **Phase 7a:** hero ladder and the statement on the homepage (replaces the current hero text panel).
2. **Phase 7b:** ritual index with numerals; vertical-word field on the House section.
3. **Phase 7c:** product pages: the specification sheet in place of the current facts block.
4. **Phase 7d:** page headings (Science, Journal, House, Press) get the staggered display style.
5. **Phase 7e:** QA: seven widths, Lighthouse, reduced motion, contrast.

## 8. Decisions needed from you

1. Is this the direction, or a variation (for example a blur-to-sharp ladder instead of outline-to-solid)?
2. Visible grid lines on the live hero: yes, no, or on a toggle?
3. Is one full-bleed ochre field with vertical type per page the right amount?
4. Should the hero keep its Red Ochre panel, or move to the Cloud ground used here?
