# Plan: follows the brief's six phases (brief section 11)

Source of truth: the owner's brief. `SPEC.md` holds the conflicts and the accepted rulings (D1-D15, 2026-10-31). `AUDIT.md` is the Phase 1 deliverable. Stack unchanged: Next 15 / Tailwind 3 / framer-motion; no new dependencies (brief rule 10). One stacked PR per phase off this branch; nothing merges without "merge N"; PRs #109 and #86 untouched.

Design test for every major decision (brief): "Does this make CHIAREL look and feel more like an established European scientific luxury skincare house?" Each PR description records the answer.

## Phase 1: Audit (DONE, no code) 
`AUDIT.md`: checklist 1-10, component inventory (reuse / modify / replace), design assessment, risks. Gate: owner approval of SPEC rulings (given).

## Phase 2: Design system (PR 1) [brief sections 3, 4, 5]
- Typography: Libre Bodoni only (brief section 3). Remove Jost; scale tokens for hero, section, product name, description, body, navigation, technical text; differentiate by size, weight, line height, tracking, measure, spacing, alignment; floor 12 px; mobile read-test.
- Colour tokens: Cloud Dancer ground, Garden Green #1F5129 (ruling D2), Red Ochre #9B4722 (second red retired), existing supporting colours only where already appropriate; no blue, no beige-template drift.
- Grid: 12 / 8 / 4 columns at lg 1024 / md 768 / base, one `--container`, `--margin`, `--gutter`, `--section-y`, hairline border token, breakpoints documented. `components/layout/{Container,Grid,Section,Eyebrow,Heading}`.
- Swiss language: remove decorative shadows, gradients and extra radii/borders sitewide via tokens; hairline dividers.
- Constitution + DESIGN_BRIEF amended; Decision entries recorded.
- Gate: tsc, lint, vitest, build, smoke; Footer.tsx byte-identical; screenshots.

## Phase 3: Homepage (PR 2) [brief section 6, 12 sections in order]
01 Hero (one primary action, minimal nav, <= 1.5 s entrance placeholder) · 02 Brand Philosophy (skin health, environmental stress, aging, formulation science, sensory, visible results; concise) · 03 Morning Ritual (signature: large packshots, numbered sequence, not a grid) · 04 Evening Ritual (distinct composition, same system) · 05 Product Discovery (name, purpose, benefit, formulation highlights, size, price, link; approved data only) · 06 The Science (formulation philosophy, ingredient science, barrier, hydration, renewal, environmental stress, evidence; published research vs rationale vs product testing kept separate) · 07 Clinical Observations ("How we observe": what was done, what it is not, limitations; hidden slot for participants/duration/outcomes until supplied) · 08 Made in Italy (Isola del Liri, lab, place-craft-science; existing bridge photo, pending-photography slot) · 09 The Formulator (existing wording and approved image) · 10 The House · 11 Journal (4 existing articles) · retained FAQ and signup · 12 Footer untouched.
Preserve: JSON-LD parity, FAQ and HowTo text, ritual markup contract, anchors. Validate at 375/390/430/768/1024/1440/1920.

## Phase 4: Product pages (PR 3) [brief section 7]
One architecture for all five: photography (large, dominant) > name > positioning > price and purchase > description > key benefits > how to use > ingredients > formulation > relevant science ("Ingredient notes", internal /science links only) > related. Expandable sections for long parts. No change to names, formulas, INCI, prices, claims, JSON-LD, analytics, purchase tiers.

## Phase 5: Remaining pages (PR 4) [brief section 11]
Science (index + 5), House (About), Journal (index + 4), Press, Ritual, Build-your-ritual, Founding-100, Cart/Checkout on the shared shells; copy untouched; guarded wording and counters preserved; dark blocks made light.

## Phase 6: Quality assurance (PR 5) [brief sections 8, 9, 10, 13]
Motion (HeroIntro <= 1.5 s, reduced motion everywhere incl. sticky bar), responsive image sets and lazy loading, font/CSS/JS delivery, layout-shift check, Lighthouse before/after, full viewport matrix, before/after screenshot comparison, a11y (landmarks, touch targets, focus), security and deploy-readiness audits, converge report against the brief's acceptance criteria.

## Strict-rule gates (brief section 12, each rule has a check)
1 no rebuild: diff reviews show restyle/re-layout only · 2-4 brand/font: grep for font families and hexes in CI-style test · 5-7 no invented info/formulas/evidence: claim-audit on every copy diff, `no-ingredient-percentages` and claims tests stay green · 8 no content removal without justification: removals listed in the PR · 9 integrations: smoke + manual cart/checkout pass · 10 deps: package.json diff must be empty · 11 no duplicates: reuse list in AUDIT · 12 mobile readability: 375/390 read-test · 13 performance: Lighthouse not worse · 14 no generic AI luxury patterns: swiss-editorial-design and high-end-visual-design review.

## Verification per PR
`npx tsc --noEmit`, `npm run lint`, `npx vitest run`, `npm run build`, standalone boot on local Postgres + `node scripts/smoke.mjs`, screenshots vs a BEFORE set from main a863590 (harness outside the repo). Test edits need a one-line justification and keep contracts (44 px, verbatim copy, claim bans).

## Parallelism
Phases 2 sequential. After Phase 2: Phase 3, 4 and 5 touch disjoint files and can run as isolated-worktree agents; Phase 6 last. Skills: swiss-editorial-design, high-end-visual-design, impeccable, frontend-design, emil-design-eng, animate, ui-ux-pro-max, web-trends-2026, claim-audit, predeploy-security-audit, deploy-readiness-checklist.

## Owner inputs (non-blocking until the named phase)
Phase 3: final source images, lab/architecture photos, observation figures and consent. Phase 4: real citations. Phase 6 or any larger Formulator portrait: Natural You photo permission.
