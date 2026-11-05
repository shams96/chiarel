# Spec: Luxury experience pass (hero, story, path, cues)

Phase 1 of spec-driven-development (what and why, not how). Governed by `claudedocs/specs/CONSTITUTION.md`.
Status: DRAFT for owner review. No plan, no code until the owner answers the decisions in section 7.

Evidence tags: **V** verified this session (file or live page read), **I** inferred, **U** unknown / not checked.

## 1. Problem

A third-party "luxury lens" audit says chiarel.com reads as an "editorial startup" and not a "house of luxury", in four areas:

| Audit area | What it claims |
|---|---|
| Visual and sensory | Hero is text-heavy with a solid colour block; limited high-end photography, texture, slow reveals |
| Storytelling depth | Clinical testing is placeholders; little ritual theatre or emotional layering |
| UX / conversion path | Ritual page functional but not immersive; no strong assessment flow; limited social proof; sparse product pages; "from $X a day" can feel promotional |
| Luxury cues | No packaging reveal, unboxing, limited editions, VIP experience; micro-interactions and photography not consistently high-end |

The audit's product-naming row is already fixed (live /shop and /ritual use only the five Clarity names, V) and is out of scope.

## 2. What is already true (checked, so the spec does not re-solve it)

- **Hero (V):** `components/home/HomeHero.tsx` is a poster headline ("Advancing Cellular Clarity™"), one CTA, a per-day price line, one paragraph, and one 4:5 scene (Essence on a mirror) on a Red Ochre block. Above the fold there is one photograph. The audit's "text-heavy, one colour block" is a fair description of the first screen. A hero branch exists in the main checkout (`feat/home-hero-one-frame`, ec2849a); its relation to this work is **U**.
- **Photography (V):** `public/assets/` already holds per-product scene, studio, detail, editorial and ribbon-scene images (about 125 image files), plus two ambient videos (Eye Contour, Neck). "Limited photography" is true of the hero and of what is surfaced on pages, not of what exists. How much of it the homepage and product pages actually show is **U** (to inventory).
- **Assessment (V):** `/assessment` exists: 8 questions, four axes adapted from the Baumann Skin Type Indicator, results page recommending one or two products. The audit's "no strong skin assessment flow" is about depth and surfacing, not absence. "Skin assessment is on the deferred list" referred to a new flow; the existing one is untouched by the checkout work.
- **Clinical section (V):** `components/home/HomeObservations.tsx` shows "To be published" in four fields. Deliberate (no data exists; Grazia Savoriti is to supply wording). Constitution: honest gaps stay visible.
- **Motion (I, from project memory):** the site already has a mature per-product motion and micro-interaction system (Sept 30 pass). Extend it, do not redo it.
- **Social proof (U):** not inventoried. Owner-approved claims exist ("Customer Tested" with photos; "clinically studied ingredients"). No invented reviews, ever.
- **Product pages (V):** `app/shop/[slug]/page.tsx` is 825 lines with a gallery rail and purchase options; section-by-section richness vs. the audit's "sparse" is **U** (to inventory).

## 3. Goals (what "solved" looks like)

G1. **First impression:** the first screen of the homepage shows the product world, not mainly words: real photography at the centre, type in support, slow and quiet reveal, no new colours or typefaces.
G2. **Story depth:** each of the five products has one coherent "world" (place, material, ritual moment) told across its page in the same order, using real provenance (Isola del Liri, the spring, the pharmacist formulator) and no invented history.
G3. **Guided path:** a visitor can go from "I am not sure what I need" to the right product in under two minutes, through the existing assessment made visible from the homepage, ritual page and product pages, with results that carry into the bag.
G4. **Credible proof:** the page shows only evidence that exists (approved claims, real customer photos, ingredient-level studies) in a form that reads as evidence, and the placeholder section is either honest or absent by owner choice.
G5. **Luxury cues that are real:** unboxing and packaging-reveal moments, and any limited-edition or VIP element, exist only where the owner supplies the real asset or the real business fact.

## 4. Non-goals (out of scope)

- Pricing, discounts, "Founding Members" terms, product claims, SKU structure, formulas (owner sign-off required; no "half price" or % off copy, ever).
- The "From $X a day" line: it was a deliberate October change. Reconsider only if the owner asks (decision D5).
- Checkout, payment, subscriptions (the four checkout PRs).
- Renaming products or slugs; the footer component (off-limits).
- Dark sections, a second typeface, new brand colours (constitution: light, one typeface).
- Fabricated scarcity, reviews, testimonials, awards, press, or "limited edition" labels with no real inventory limit.
- Generating or altering label text with AI; packshots stay real (constitution).
- The master product page and Ritual Advisor (separate later rounds in the commerce plan).

## 5. Users and success measures

Users: a first-time visitor on a phone from Instagram or search; a considered buyer comparing against La Mer / Augustinus Bader / La Prairie; the owner presenting the brand to partners.

How we will know (to be confirmed in the plan, using existing GA4 events, no new tracking promises):
- Homepage first screen: the hero image is the largest element and loads with priority (LCP not worse than today; measured before and after).
- Assessment: start rate from homepage/ritual/PDP entry points and completion rate (event `assessment_complete` already exists).
- Product pages: every product page contains the same ordered story sections.
- Qualitative: owner and one outside reviewer rate "feels like a house of luxury" before and after against the audit's four rows.

## 6. Workstreams (candidate scope, to be sized in the plan)

- **W1 Hero and sensory:** one-frame cinematic hero from existing real imagery (and one ambient video if approved), reveal choreography, image-led product tiles. Uses existing assets first.
- **W2 Story depth:** per-product "world" sequence on the PDP and ritual page; provenance chapter; clinical section decision (D2).
- **W3 Guided path:** surface `/assessment` (entry points, shorter first screen, results to bag); proof placement; richer PDP sections from approved material only.
- **W4 Luxury cues:** packaging reveal and unboxing page or section; limited edition / VIP only if the facts exist (D3, D4).

## 7. Decisions needed from the owner (blocking the plan)

| # | Decision | Default if no answer |
|---|---|---|
| D1 | Priority order of W1-W4 (one PR per workstream, stacked) | W1, W3, W2, W4 |
| D2 | Clinical Observations section: keep "To be published" visible, or hide until Grazia supplies data | Keep visible (constitution default) |
| D3 | Do real limited editions, VIP access or a loyalty tier exist as business facts? (no discounts per Founding Members decision) | None; W4 limited to unboxing and packaging reveal |
| D4 | Real unboxing / packaging assets: photos or video of the actual carton, ribbon, jar reveal? | W4 unboxing section blocked until supplied |
| D5 | Leave "From $X a day" as is, or test an alternative on the hero | Leave as is |
| D6 | AI-generated scene plates (fal) are an open owner item: disclosure and model likeness rights. Use only real photography until cleared? | Real photography only |

## 8. Risks

- Hero changes can regress LCP and the Focus Ladder / Apple-palette design system just shipped (PR 145). Mitigation: before/after Lighthouse and visual diff in the plan.
- Story copy is where claims creep in. Mitigation: `claim-audit` on all new copy before it ships; provenance facts only from memory-verified research (the water source, not waterfall height).
- Assets: W4 depends on files only the owner has.

## 9. Next phase

Plan (how), after D1-D6 are answered, with a written inventory of what the homepage and each PDP currently surface (the U items above) as its first section.
