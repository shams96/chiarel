# Site Alignment v3: The House, The Ritual, The Science

Source: owner brief "CHIAREL Website Alignment" (Oct 22, 2026). Research: three read-only maps (product/slug/DB impact, page/claim map, formula register facts). Status: PLAN, pending independent review.

## 0. Evidence and gaps (verified vs not)

- Verified: all copy locations (see sections 3-5). House claims vegan/airless/recyclable/cruelty-free exist only at `app/house/page.tsx:70-76`.
- Verified: v3 register and RFQ V19 are NOT on this machine. Newest are v2.1 register and RFQ V18. The brief is treated as the newer owner source; where v2.1 differs, the brief wins and the gap is logged in section 7.
- Unverified (taken from brief, no document backs it): Essence "marine-derived collagen (from fish)"; Night Crème ingredient list; Day/Neck "squalane". v2.1 lists "Hydrolyzed Collagen 1" with no source.
- Footer.tsx is owner-only and is not edited.

## 1. Decisions made in this plan (reversible, flagged to owner)

1. Product mapping (confirmed by the v2.1 codes and the brief's ingredient lists):
   - chiarel-essence -> **Clarity Essence**
   - terra-radiance-creme -> **Clarity Day Crème**
   - recovery-masque -> **Clarity Night Crème** (4A has bakuchiol, ornithine; matches brief)
   - n1-neck-decollete -> **Clarity Neck & Décolleté Crème**
   - eye-contour-concentrate -> **Clarity Eye Contour Concentrate**
2. **Slugs stay unchanged; only display names change.** Reason: Footer.tsx (off-limits) links `/shop/n1-neck-decollete` and uses `recovery-masque-jar.png`; DB `Product.slug` is a primary key with FKs from orders and carts; no redirects exist today. A slug rename is a separate, later change.
3. Removed products leave `data/products.json` (so they leave the site, sitemap, PDPs) and get **permanent redirects to /shop** in `next.config.mjs`. DB rows are never deleted (OrderItem FK). `/api/products` and cart-add must not expose them: filter to slugs present in the JSON.
4. Hero/OG/gallery image filenames stay (not user-visible). Jar art that prints old names (Eye "Eye Treatment" label, Essence/Terra/Masque/N1 labels) is flagged to owner, not regenerated here.
5. "Links to the full ingredient list from Register v3": the INCI is deliberately hidden until final (owner decision, Oct 2026). Science entries name the key ingredients from the brief and link to the existing PDP formulation section, not a full INCI list.
6. Brief's rule ("benefits live only after test report") vs its own Science table: copy is used exactly as the owner wrote it ("the look of" wording); no test, clinical, percentage or "customer tested/clinically studied" additions on the new Science page.

## 2. Workstreams (file-disjoint so they run in parallel)

### WS-A Catalog and commerce
Files: `data/products.json`, `lib/products.ts`, `lib/skin-assessment.ts`, `lib/formulation-line.ts`, `lib/cart-math.ts` + `lib/cart-ops.ts` (set logic), `prisma/seed.ts`, `app/api/products/route.ts`, `next.config.mjs`, `app/shop/page.tsx`, `app/shop/[slug]/page.tsx`, `app/assessment/page.tsx`, `app/founding-100/page.tsx`, `components/home/HomeClosing.tsx`, `components/CartDrawer.tsx`, `components/StickyPurchaseBar.tsx`, `components/PurchaseOptions.tsx`, `scripts/smoke.mjs`, tests: cart, cart-sets-upsell (delete), pdp-*, checkout, cart-*, free-from-claim, content-qa-polish.
- Rename 5 display names/descriptors; remove cleanser, mist, lip, founding-pair, ritual-set records.
- Remove every `getProduct(OrThrow)` call to a removed slug; rework shop collections to the five; remove Founding Pair / Ritual Set upsell blocks and set logic that becomes dead.
- Redirects: `/shop/cellular-cleanser`, `/shop/cellular-mist`, `/shop/lip-concentrate`, `/shop/the-founding-pair`, `/shop/the-ritual-set` -> `/shop` (permanent).
- Old-slug carts: cart-server already falls back to the DB row; add a prune of lines whose slug is not in the catalog so checkout cannot sell a removed product.

### WS-B Ritual and navigation
Files: `app/ritual/page.tsx`, `components/RoutineBand.tsx`, `components/home/HomeRitual.tsx`, `app/build-your-ritual/page.tsx`, `app/page.tsx` (HowTo + FAQ JSON-LD), `components/Header.tsx`, `lib/seo.ts`, `lib/motion.ts` (step names), `app/journal/chiarel-ritual-guide/page.tsx`, `app/llms.txt/route.ts`, tests: ritual-bands, home-ritual-bands.
- Replace Ritual with the brief's section 3 copy verbatim: Morning (Essence, Day Crème, "Follow with SPF"), Evening (Essence, Eye Contour Concentrate, Night Crème, Neck & Décolleté Crème), line "Order follows the texture, lightest first."
- Remove "Optional Preparation" and "Beyond the Ritual"; Eye moves into the evening list ("may be used morning or night").
- HomeRitual and HowTo JSON-LD mirror the visible steps (test enforces). Nav label -> "Clarity Neck & Décolleté Crème" (Header only; Footer untouched).

### WS-C House and Science
Files: `app/house/page.tsx`, `app/science/page.tsx`, `app/science/*` sub-pages (delete `ectoine`; remap `bifida-ferment-lysate`, `l-ornithine`; review `application`, `barrier-resilience`, `comparison`, `lasting-hydration`, `synergy` for named complexes/Ectoine), `app/sitemap.ts`, `components/home/HomeProof.tsx`, `HomeFitGuidance.tsx`, `HomeProvenance.tsx`, `app/press/page.tsx`, `app/journal/isola-del-liri-waterfall/page.tsx`, `app/globals.css` comment, `lib/seo.ts` (only complex/ectoine text).
- House: add Modern Biological Stress™ paragraph (brief section 2, verbatim) after the mission; add "Clarity" paragraph; replace A Considered Practice with the brief text; remove vegan-friendly, airless, cruelty-free; no environmental line (no measurable fact on file).
- Science: opening line + five product entries (brief table), no named complexes (remove the 5 complex tiles and the provisional-trademark disclaimer), no test/clinical claims. `/science/ectoine` removed with permanent redirect to `/science`; Bifida page scoped to Essence, Day, Neck, Eye (not Night); L-Ornithine page scoped to Night Crème only. Evidence internal (Altemus) is NOT shown. No cortisol/hormone words anywhere.
- Cascata Complex FAQ in `app/page.tsx:85` is WS-B's; WS-B removes the complex mention there.

File ownership conflicts resolved: `app/page.tsx` and `lib/seo.ts` -> WS-B (WS-C sends needed text edits to WS-B via the controller). `HomeClosing.tsx` -> WS-A.

## 3. Controller agent (verifier)
Runs after all three workstreams merge into one integration branch. Checks, each with grep/test evidence:
1. Forbidden strings absent in app/, components/ (except Footer.tsx), lib/, data/, tests: `vegan`, `airless`, `cruelty`, `Cellular Cleanser`, `Cellular Mist`, `Lip Concentrate`, `Founding Pair`, `Ritual Set`, `Ectoine`/`ectoine` (outside redirect config and the DB seed history), `Cascata Complex`, `Terra Shield`, `Contour Renewal`, `Dermal Support`, `Cellular Intelligence Complex`, `Eye Treatment`, `cortisol`, `Recovery Masque` (display), `Terra Radiance Crème` (display), `N1 Neck`.
2. Required strings present exactly: the brief's MBS paragraph, Clarity paragraph, Considered Practice, ritual lines, five science lines, nav label.
3. `tsc --noEmit`, lint, full vitest, `next build` (typecheck is ignored in next.config, so tsc is run explicitly).
4. Every removed `/shop/<slug>` returns a redirect; every `/shop/<kept slug>` renders; sitemap lists five products; Footer.tsx has zero diff.
5. Local browser pass on /house /ritual /science /shop and a PDP; add-to-cart and checkout still work for a kept product.
6. Report gaps against this plan, not against the diff.

## 4. Execution and shipping
- Plan review (independent reviewer agent) -> fixes -> WS-A/B/C in three worktrees off `origin/main`, merged into `feat/site-alignment-v3` integration branch -> controller -> one PR, CI `check` -> merge -> poll live for new strings.
- CRLF: edit scripts normalise `\r\n`.

## 5. Out of scope
Footer.tsx; slug renames; jar/packshot art regeneration; new pricing; samples promise; production DB fix; www HTTPS.

## 6. Done means
Section 3 checks all pass with evidence, and the owner questions in section 7 are listed in the final report.

## 7. Owner questions / known gaps to report
1. Register v3 and RFQ V19 are not available here; copy follows the brief. Please confirm v3 matches (esp. squalane in Day/Neck, Night ingredient list).
2. Marine-derived collagen (fish) in Essence: no source document; follows the brief.
3. Footer "trust bullets" and Footer image/link still reference old slugs/art; unchanged by design.
4. Jar/packshot art with old product names on the label needs regenerating; not done here.
5. Slug rename (`recovery-masque` -> night crème etc.) deferred; needs redirects + DB migration + Footer edit.
6. Test reports are not on file; no benefit claim beyond the owner's "look of" lines is added.

## 8. Review amendments (independent review, applied)

Ownership fixes:
- `lib/seo.ts`, `app/page.tsx`, `app/llms.txt/route.ts` (all lines incl. Ectoine at :26), `lib/skin-assessment.ts`'s copy-only edits excluded: WS-B owns seo.ts, page.tsx, llms.txt. WS-C hands exact line edits for those via the controller (none expected beyond Cascata FAQ and Ectoine/complex text, which WS-B does itself).
- `next.config.mjs`: WS-A only, one redirect list including `/science/ectoine` and `/science/synergy` (-> `/science`) plus the five `/shop/<removed>` (-> `/shop`).
- `lib/motion.ts` (step label lookup, "Eye Treatment" / "Standalone"): WS-A, together with the `step` values in `data/products.json`; WS-B must not touch it.
- `lib/skin-assessment.ts` incl. :186 "Cellular Intelligence Complex": WS-A; remove complex wording and Founding Pair/Cleanser/Mist recommendations.
- WS-A also owns: `components/home/HomeHero.tsx:62`, `components/home/HomeN1Feature.tsx`, `app/journal/page.tsx:12`, `lib/products.ts` (ritual lists, comments), `lib/cart-math.ts`, `prisma/schema.prisma:92` comment, `tests/seo.test.ts`, `tests/no-ingredient-percentages.test.ts`.
- Sitemap reads products.json; WS-C only removes `/science/ectoine` and `/science/synergy` entries.

Decisions:
- `/science/synergy` (Presence Complex™ + Ectoine): delete, redirect to `/science` (brief: no named complexes).
- `/science/ectoine`: delete, redirect to `/science`.
- Other science sub-pages (`application`, `barrier-resilience`, `lasting-hydration`, `comparison`, `bifida-ferment-lysate`, `l-ornithine`): keep, strip Ectoine / named complexes / Presence Complex / test or clinical claims; Bifida scoped to Essence, Day, Neck, Eye; Ornithine to Night Crème only. Links from PDPs (`app/shop/[slug]/page.tsx:840-886`) must follow that scoping (no Bifida on Night PDP). Owned by WS-C except the PDP file (WS-A).
- Cart filter for removed slugs goes in a new `lib/cart-catalog-filter.ts` (not `cart-prune.ts`).
- Ritual page includes one line referring back to Modern Biological Stress™ ("Each moment answers part of the day described on The House."), so the brief's cross-reference is honoured; Science opener already refers to it.
- "Make glass line precise": the replacement text is the owner's section 4 text; no recyclability line is shipped (no measurable fact on file). Logged as intentional.

Added controller checks: grep `getProductOrThrow("` slugs all exist; `/api/products` returns only the five; redirect tests in `tests/`; `const amRitualHowTo` and `export default function Home` markers survive in app/page.tsx; `tests/cart-sets-upsell.test.ts` removed with nothing else relying on set logic; Bifida absent from Night PDP.
