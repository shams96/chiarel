# Home page: a personality for every section (SPEC, phase 1: what and why)

Status: DRAFT for owner approval (2026-10-29). No code until approved. Next phases: PLAN, TASKS, implement, converge.

## Problem
The live Home page (reviewed section by section at 1440 px, 2026-10-28) has two halves.

- Top ~60% has character: red hero with the Essence scene, Peach Dust / Formal Garden split with product scenes, the AM/PM ritual scenes, the Isola del Liri watercolour band, the Red Ochre closing panel.
- Bottom ~35% reads as one continuous flat field: Which product is right for you, Who formulates, The ingredients, The Philosophy, See the key ingredients, FAQ. Seven sections share one template (centred Libre Bodoni heading, grey Jost paragraph, white or ivory background). They differ only by faint white/ivory shifts, no imagery, no ribbon, no change of layout.

A visitor scrolling past the ritual meets roughly 4,000 px of the same text rhythm. Those sections hold the trust content (who formulates, what is in it, where it is made) that decides the purchase, so they should be the most memorable, not the least.

## Goal
Every section has its own layout signature and one brand device (colour block, product scene, ribbon, pattern, or type scale), so a screenshot of any section is recognisably that section, while the page still reads as one House.

## Section map (current to proposed)
Brand tokens only: Formal Garden `#1F5129`, Red Ochre `#913832`, Peach Dust `#F0D8CC`, Champagne `#D6C5A0`, Ivory `#F8F6F1`, Ink `#1C1A17`. Libre Bodoni headings, Jost body. Flat colours, no gradients.

| # | Section | Now | Proposed signature |
|---|---|---|---|
| 1 | Hero | Red Ochre + Essence scene | Keep |
| 2 | Face, First / Beyond the Face | Peach + Garden split, scenes | Keep |
| 3 | Ritual (AM / PM) | tinted band, scenes | Keep |
| 4 | Icon product (Day Crème, model photo) | photo floating in ivory | Full-bleed Peach Dust panel, photo bleeds to the edge, oversized Bodoni headline, layout mirrored from #2 |
| 5 | Which product is right for you | four text-only cards, white | "Find your formula": four large cards led by that product's scene image, the concern in Bodoni italic, Red Ochre top rule (as the admin cards), whole card is the link; Ivory ground, Peach Dust cards (so it does not touch the Peach panel in #4) |
| 6 | Where is CHIAREL made | Garden + watercolour | Keep |
| 7 | Who formulates | Ink, centred text, radial glow | Ink, typography as the hero: "Grazia Savoriti" at display scale in Bodoni, Champagne rule, credentials in small caps. Remove the radial gradient (breaks the flat-colour rule). Portrait slot if the owner supplies a real photo |
| 8 | The ingredients behind the formulas | centred bullet list | "Ingredients, plainly": a grid of ingredient cards (name large, existing one-line reason, product tag) on Ivory with Champagne hairlines and the Liri flow pattern as a quiet ground |
| 9 | The Philosophy | centred quote, ivory | Split: Isola del Liri photograph left, quote right with a large Red Ochre opening mark |
| 10 | Formulation record (accordion) | white block | Deliberately quiet "ledger": Champagne-bordered box, Red Ochre left rule, small-caps labels. Restraint is its personality |
| 11 | FAQ | centred list | Two columns: sticky heading and short intro left, accordion right |
| 12 | Final CTA | Red Ochre | Keep |

Transitions: the printed-ribbon band (`RibbonBand`) is used at three boundaries only (into #4, into #7, into #12), Green on Red Ochre / Peach, Red Ochre on Garden / Ink, as the component already enforces. Adjacent sections never share a background colour.

## Non-negotiables (from standing decisions)
- No copy changes: every heading and paragraph keeps its words, so SEO/AEO/GEO structure, FAQ and HowTo schema and the formulation statement stay identical. Reordering within a section is allowed, rewriting is not.
- No new claims, no percentages anywhere, INCI stays hidden, "Customer Tested" and "clinically studied ingredients" stay as approved.
- Product scenes use the grounded `-v2` images (PR #116); fonts named as Libre Bodoni and Jost.
- Accessibility: text contrast at least 4.5:1 (this retires the `text-ivory/50` and `text-ink/50` small-text pairings on Ink and Ivory); 44 px targets; keyboard operable accordions; `prefers-reduced-motion` respected (existing `Reveal`).
- Performance: no new image over 450 KB, images below the fold lazy, no layout shift, Lighthouse performance not below today's.
- Works at 390, 768, 1440 and 2000 px with no horizontal scroll.

## Assets
Already in the repo: product scenes (`clarity-*-scene-v2.jpg`), Isola del Liri photographs (`journal/isola-del-liri-bridge.jpg`, `editorial/isola-del-liri-cascata.jpg`), `patterns/liri-flow.svg`, ribbon artwork, testimonial photos, Day Crème editorial photo.
Not in the repo: **a portrait of Grazia Savoriti**. Nothing is generated or invented of a real person; the section ships typographic-first and takes a photo later if the owner provides one.

## Out of scope
Header/footer, product pages, copy rewrites, new sections, the checkout path, the hero.

## Done means
- Each of sections 4, 5, 7 to 11 has a visibly different layout from the section above and below it (checked in 1440 px and 390 px screenshots, before and after, in the PR).
- Zero copy diff (a text diff of the rendered section copy is attached to the PR).
- Schema and tests unchanged and passing; Lighthouse accessibility and performance not lower.
- Owner approves the screenshots before merge.

## Decisions needed from the owner
1. Backgrounds for #4 and #5: proposal is #4 Peach Dust panel, #5 Ivory with Peach Dust cards. Agree?
2. Philosophy photograph: the Isola del Liri bridge photo, or the illustration?
3. Can you supply a real portrait of Grazia Savoriti, or ship typographic-only?
4. Keep Ink for "Who formulates", or move it to Formal Garden (then "Where is it made" changes)?
