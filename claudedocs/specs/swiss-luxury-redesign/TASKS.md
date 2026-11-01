# Tasks (organised by the brief's six phases)

Stacked PRs, one per phase. No merge without "merge N". PRs #109 and #86 untouched.

## Phase 1: Audit [DONE]
- [x] Checklist 1-10, component inventory, design assessment, risks (`AUDIT.md`)
- [x] Conflicts and rulings D1-D15 (`SPEC.md`)
- [ ] Baseline: BEFORE screenshots (7 widths x home, shop, one PDP, science, house, journal, cart) and Lighthouse mobile from main a863590; `npm ci`, local Postgres, confirm gate green on the untouched branch

## Phase 2: Design system (PR 1)
- [ ] Decision entries + Constitution/DESIGN_BRIEF amendment
- [ ] Type scale tokens (hero, section, product name, description, body, nav, technical); 12 px floor
- [ ] Remove Jost; sans aliases Bodoni; delete Jost files; no external font calls (CSP)
- [ ] Colour tokens: Cloud ground, `redochre` to #9B4722 then alias removal, header/ring updates
- [ ] 12/8/4 grid, container, margin, gutter, section spacing, border tokens; breakpoints documented
- [ ] `components/layout/{Container,Grid,Section,Eyebrow,Heading}`
- [ ] Strip decorative shadows/gradients/radii/borders via tokens
- [ ] Update class-string tests with justification; Footer.tsx unchanged by diff
- [ ] Gate + screenshots + mobile read-test (375/390)

## Phase 3: Homepage (PR 2)
- [ ] 01 Hero + short entrance placeholder
- [ ] 02 Brand Philosophy
- [ ] 03 Morning Ritual, 04 Evening Ritual (markup contract and verbatim copy kept)
- [ ] 05 Product Discovery module
- [ ] 06 The Science (three-way distinction)
- [ ] 07 Clinical Observations ("How we observe", gated figures slot; narrow `fix2-claims` test edit)
- [ ] 08 Made in Italy, 09 The Formulator (split from HomeProvenance; light)
- [ ] 10 The House, 11 Journal; keep FAQ + signup; 12 Footer untouched
- [ ] JSON-LD parity check; claim-audit; gate; screenshots at 7 widths

## Phase 4: Product pages (PR 3)
- [ ] Split PDP into `components/pdp/*`, no data-flow change
- [ ] Brief order; Formulation block; Ingredient notes; related; expandable sections
- [ ] Update `pdp-sections.test.ts`; verify JSON-LD, analytics, tiers, sticky bar; PDP video band light
- [ ] Gate + screenshots for all five products

## Phase 5: Remaining pages (PR 4)
- [ ] Science index + 5 subpages, House, Journal index + 4 articles
- [ ] Press, Ritual, Build-your-ritual, Cart, Checkout visuals
- [ ] Founding-100 (wording and counter kept; light hero)
- [ ] Gate + screenshots

## Phase 6: Quality assurance (PR 5)
- [ ] HeroIntro rewrite <= 1.5 s; sticky bar reduced motion
- [ ] Responsive image sets + lazy loading + `sizes`; publish-process caveat
- [ ] Layout shift, font/CSS/JS delivery, Lighthouse before/after
- [ ] Viewport matrix 375/390/430/768/1024/1440/1920: no overflow, clipping, overlap; touch targets; reduced motion
- [ ] Before/after screenshot comparison; fix regressions
- [ ] predeploy-security-audit, deploy-readiness-checklist
- [ ] Converge against brief section 13 acceptance criteria; list untested and deferred items
