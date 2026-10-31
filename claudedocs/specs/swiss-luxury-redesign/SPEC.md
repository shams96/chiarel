# Spec: Swiss x European scientific luxury redesign (front end)

Status: D1-D15 recommended rulings ACCEPTED by owner ("YES", 2026-10-31). Plan and tasks: `PLAN.md`, `TASKS.md`. No code written. Base: `main` a863590 (backup tag `backup/pre-overhaul-2026-10-31`).
Branch: `claude/chiarel-brand-overhaul-e3b7d2`. Nothing goes live until the owner says "merge N". PRs #109 and #86 untouched.
Source: owner brief (12 sections, PDP architecture, grid 12/8/4, Libre Bodoni only) + Phase 1 audit (8 read-only auditors + critic, 2026-10-31). Evidence tags: **V** verified in code, **I** inferred.

## 1. Problem and "solved"

The site works and is SEO-mature, but visually it is a colour-block page (Red Ochre / Peach / Garden / ink bands, velvet ribbons), has no layout system, and presents science and provenance weakly. "Solved" means: a consistent token + grid layer, one typeface, a Cloud-Dancer-led light editorial homepage in the owner's 12-section order, a uniform PDP architecture, restrained motion, and zero regression in commerce, URLs, SEO or claims.

## 2. What exists (V)

- Next 15.5 App Router, React 18, **Tailwind 3.4** (JS config; the Tailwind-4 branch was reverted), framer-motion in 5 files, `output: standalone`, **`images.unoptimized: true`** (every phone downloads full-size files; hero is 438 KB), strict CSP (self + Stripe + GTM only; no external fonts/embeds).
- Fonts: Libre Bodoni 400-600 (no italic file) **and Jost 300-500**. `body` is `font-sans`, so Jost is the implicit face of nearly all non-headline text, the Footer and admin included. `font-serif` appears 192 times, `font-sans` explicitly twice, so a sole-Bodoni switch is a few central edits.
- No layout tokens: no fontSize/spacing/screens/container tokens; 20+ max-widths, 4 gutter styles; header 1152px, footer 1280px, home sections 1344/1536px (edges do not align at 1440/1920); no 12/8/4 grid; breakpoints are Tailwind defaults (md 116 uses, xl/2xl 0).
- Type is mostly micro-labels: 106x `text-[11px]`, 115x `text-[12px]`, 8 different tracking values for the same eyebrow role.
- Homepage today: HeroIntro (6.8 s full-screen overlay, scroll-locking, every new session) > HomeHero > FaceBeyond > Ritual (morning+evening, one component) > IconProduct > FitGuidance > Provenance (water + Grazia, dark `bg-ink`) > Proof > Philosophy > FormulationRecord > FAQ (7) > FinalCta > EmailSignup. 6 JSON-LD scripts mirror visible copy.
- PDP: one 782-line server component. Has photo, name, descriptor, 3-tier purchase, accordions, blurb, benefits, how-to, key ingredient names, optional INCI (hidden), science links, related pairs. Missing: formulation block as its own part, references.
- Tests: 45 files, ~21 are source/class-string greps (they will break mechanically); one renders markup. CI = tsc, lint, vitest, build, Postgres smoke. **No screenshot/visual-diff tooling in the repo.** `next build` skips type checking, so `npx tsc --noEmit` is run by hand.
- Search does not exist (V). No HTML email templates (V). One static OG image, no hreflang, 4 countries (US/CA/IT/AE).

### Photo inventory (checked 2026-10-31, read-only; filename search, not a visual review)

- **Published, in git (this branch, `public/assets/products/`):** `clarity-*` transparent packshots for Essence bottle, Day Crème jar, Night Crème jar, Neck/Décolleté bottle, Eye Contour bottle, plus Cleanser, Mist, lip gloss; studio, Capri, editorial, honeycomb, marble-roses and `*-scene-v2`/`*-ribbon-scene-v2` scenes; `*-og.jpg`; `n1-neck-decollete-ambient.mp4`; `serum-drop-macro.jpg`; `applicator-spatula.jpg`. Also `home/hero-hands-n1(-wide).jpg`, `editorial/hero-shore-duo.jpg`, `editorial/isola-del-liri-cascata.jpg`, `journal/isola-del-liri-bridge.jpg` and `-illustration.jpg`, 4 `testimonials/*`, and `house/grazia-savoriti-cutout.webp`.
- **Owner's working copy (`chiarel/public/assets/products/`, branch `feat/home-hero-one-frame`) is NOT in git:** ~16 modified and ~16 untracked files in the old pre-rename names (`chiarel-essence-jar.png`, `terra-radiance-creme-*`, `n1-neck-decollete-*`), source art such as `chiarel-essence-river.png`, `Discover-radiance-creme.png`, `chiarelRadiance_Italia model.png`, `terra-radiance-creme-Model.jpg`, three `.mp4` files, a stock image (`AdobeStock_591776696.jpeg`) and a `watermarked_img_*.jpg`, and a `relettered/` folder of Oct 26 "-clarity" versions (several 1.3-8 MB). I will not touch that checkout. Anything I want from it is copied into the redesign through the existing publish process (`claudedocs/image-publish-process.md`), after you name which files are final.
- **Not found anywhere under `Chiarel brand/` by name (lab, Natural You, factory, architecture, waterfall photo):** no laboratory or production photography. Only the Cascata image, the bridge photo, the illustration and a brand card exist, so Made in Italy (D9) still needs photos from you.
- Not checked: images inside docs/zips, the `07 Marketing` and `06 Website` folders beyond the filename search, and whether the stock/watermarked files are licensed for use. A watermarked or stock file cannot go on the site until licensing is confirmed.

## 3. Conflicts between the brief and standing decisions (owner must rule; my recommendation first)

| # | Brief says | Repo / decision says | Recommendation |
|---|---|---|---|
| D1 | Libre Bodoni sole font | Decision 011 ratified Bodoni; Jost "pending monolithic-font ruling" | **Adopt Bodoni-only** (your brief is that ruling; record as a new Decision). Condition: type floor (no uppercase tracked text under 12 px, weight 500 for small caps), real-device test at 375/390. Optional: add the Bodoni *italic* cut (same family). Footer and admin inherit the change via the body rule; confirm that is acceptable for the Footer. |
| D2 | Garden Green **#004B37** "existing" | Code and Decision 002 use Formal Garden **#1F5129**; #004B37 appears nowhere (V); an earlier audit recorded "#004B3" as an invalid hex | **Keep #1F5129** unless you rule otherwise. It is ratified and matches packaging; repointing recolours 20 files and the Footer. If #004B37 is intended, I add it as a new UI-only token, not a repoint. |
| D3 | Red Ochre #9B4722 | Home uses a second red `redochre` #913832 (50 uses, ~16 files); sitewide `ochre` = #9B4722 (265 uses) | **Retire #913832 into #9B4722.** Visible shift on the home hero only. |
| D4 | Cloud Dancer #F0F2EB base | Page ground is Ivory #F8F6F1 (29 sections); Cloud only on evening band/cart/footer; image brief lists a third value #F0EEE9 | **Make Cloud Dancer the ground**, keep Ivory as the lighter tier for panels so Morning/Evening distinction survives. |
| D5 | (implied light) | Constitution: "light, never dark"; 3 section-level `bg-ink` bands (HomeProvenance, founding-100 hero, PDP video) | **Convert to light**; amend the Constitution and DESIGN_BRIEF.md in PR 0. |
| D6 | Clinical Observations: participants, duration, outcomes | **No participant count, duration (beyond a "2-day photo interval"), or outcome data exists anywhere** (V). Approved: "Customer Tested" (photos), "clinically studied ingredients" | **Build a transparent "How we observe" module from approved facts only**: what customer testing is (photos, 2-day interval), what it is not, limitations, and a gated slot that stays hidden until you supply figures and consent. No numbers invented. |
| D7 | PDP "relevant scientific references" | No reference data exists; tests forbid PubMed links | **Label it "Ingredient notes"** linking only to existing /science pages, with the three-way distinction (ingredient research / formulation rationale / product testing). Real citations come from you. |
| D8 | The Formulator: credentials and story | Only name, title, "pharmacist, cosmetic and nutraceutical research" exist; Natural You photo permission **unconfirmed** | Keep to that wording; no new credentials. Do not enlarge the portrait until permission is confirmed. |
| D9 | Made in Italy: lab, architectural photography | **No lab/production photo exists**; the waterfall image is an illustration; bridge photo rights unclear | Design the section with the existing bridge photo and typography; show an honest "photography pending" slot, never AI-generated. You supply lab/architecture photos. |
| D10 | Restrained motion, no long loads | HeroIntro holds 6.8 s, repaints gradients, covers LCP | **Replace with a <=1.5 s quiet entrance** (or remove). Owner-authored, so your call. |
| D11 | Optimise images | Optimiser disabled by host constraint | **In scope**: responsive WebP/AVIF sets generated at rest via `scripts/publish-images.mjs`; same-name publish caveat applies (CDN caches a year). |
| D12 | PDP order: description before benefits | `tests/pdp-sections.test.ts:92-98` pins accordions before blurb | Follow the brief; update that test deliberately. |
| D13 | (none) | `tests/fix2-claims.test.ts` bans "Customer Tested" in home/shop although you approved it | Allow the approved phrase only in the new module via a narrow test edit, with a one-line justification. |
| D14 | Preserve search | Site search does not exist | **Out of scope** (net-new feature) unless you want it. |
| D15 | 12 sections | FAQ (7 answers, mirrored by JSON-LD) and email signup have no slot | Keep both, after Journal and before the Footer; moving or rewording FAQ/HowTo would desync structured data. |

Not re-flagged: "Customer Tested" and "clinically studied ingredients" stay as approved.

## 4. Scope

In: design tokens (type scale, container, gutter, section spacing, borders, breakpoints), 12/8/4 grid utilities, font consolidation, colour reconciliation, homepage re-sequence into 12 sections, PDP restructure, Science/House/Journal/Press/Ritual/Founding-100 restyle onto shared shells, motion pass, image delivery, test updates, before/after screenshot QA.
Out: formulas, INCI, prices, product names, claims, URLs/slugs, checkout/Stripe/cart logic, Footer.tsx edits, admin redesign, search, email templates, new pages, new dependencies, Tailwind 4 migration.

Must-not-break inventory (V): route files and redirects; `generateStaticParams`; metadata/canonicals/sitemap/llms.txt; Product/Breadcrumb/FAQ/HowTo/Organization JSON-LD matching visible text; GA4 consent and events (TrackViewItem etc.); 3-tier PurchaseOptions, sticky bar, cart drawer; CSP (no external assets); 44 px tap-target contract; reduced-motion handling; ritual markup ids pinned by `home-ritual-bands.test.tsx`.

## 5. Homepage mapping (brief section > today > work)

1 Hero: HomeHero + HeroIntro > recalc to Cloud ground, one CTA, intro shortened.
2 Philosophy: HomePhilosophy (currently late) > move up, concise.
3 Morning / 4 Evening: HomeRitual/RoutineBand > split compositions, large packshots, numbered steps; keep ids and verbatim owner copy.
5 Product discovery: IconProduct + FitGuidance + ProductCard > one module system (name, purpose, benefit, size, price, link).
6 Science: Proof + FormulationRecord + /science > structured three-way layout; keep server-rendered `<details>` rows.
7 Clinical Observations: **new**, see D6.
8 Made in Italy: HomeProvenance (water half) > light, see D9.
9 Formulator: HomeProvenance (Grazia half) > own section, see D8.
10 House: /house teaser > new teaser.
11 Journal: **new** teaser of the 4 existing articles.
FAQ + signup retained (D15). 12 Footer: untouched.

## 6. Approach

Plan (high level; detailed plan after you rule on D1-D15):
- PR 0: Decision records + Constitution/DESIGN_BRIEF amendment. No visuals.
- PR 1: tokens, 12/8/4 grid, font consolidation, colour reconciliation, `.page-shell`/`.section` primitives. Tests updated deliberately.
- PR 2: homepage (sections built in parallel by isolated agents on disjoint files, then integrated).
- PR 3: PDP. PR 4: remaining pages. PR 5: motion, image delivery, QA fixes.
- Each PR gate: `tsc --noEmit`, lint, vitest (all 45), build, standalone boot on local Postgres + `smoke.mjs`, after-screenshots at 375/390/430/768/1024/1440/1920 against a before set captured from the current main. Harness lives outside the repo (none exists). Stacked PRs, none merged without "merge N".
- Skills applied during build: swiss-editorial-design, high-end-visual-design, impeccable, frontend-design, emil-design-eng, animate, ui-ux-pro-max, web-trends-2026, claim-audit (every copy change), predeploy-security-audit and deploy-readiness-checklist before any go-live.

## 7. Risks (ranked)

1. Global font/colour tokens change the off-limits Footer and admin without editing them (V). Needs your explicit OK.
2. Source-grep tests turn red mechanically; updating them must keep the contracts (44 px, verbatim owner copy, claim bans).
3. Bodoni at small sizes harms legibility on phones (I); mitigated by the type floor and device test.
4. Structured-data desync if FAQ/HowTo/ritual copy moves.
5. Claim drift in new Science/Observation/Formulator copy.
6. Four before/after testimonial photos sit in `public/assets/testimonials/` unreferenced but probably URL-reachable (I); consent status unknown.
7. LCP: intro overlay plus full-size images until D10/D11 are done.
8. Photo gaps (lab, architecture) cannot be filled without you.

## 8. Acceptance (from the brief, plus)

Brief section 13 criteria, and: no new claim without your approval; JSON-LD matches visible text; no external requests blocked by CSP; all 45 test files pass; Lighthouse mobile performance not worse than the current main (measured before and after, since none is on file).

## 9. Open items for the owner

Rulings D1-D15 above; Natural You photo permission; consent/captions for the 4 testimonial photos; any lab/architecture photography; any real citations; whether to keep the italic Bodoni cut.
