# Sitewide type, colour and layout standard: plan and tasks (phases 2-3)

Status: owner approved spec choices A (ochre section headings), B (`text-h1` page titles), C (two-column sections inside the shared container) on 2026-11-06, after the peer research in `research.md`. Not built.

## Approach
- New `components/layout/SectionHeading.tsx`: thin ochre rule, `h2` at `text-h2` in ochre, optional italic subhead and lead. Used by the homepage and inner pages so the standard lives in one place.
- Cards and product names: `text-h4`, ochre, underline on hover (already the Face/Beyond pattern).
- Page titles: `text-h1`; `PageHead` keeps `text-mega` only if the owner later asks; the homepage hero poster is unchanged.
- Layout: homepage two-column sections (HomeFaceBeyond, HomeIconProduct) move inside `Container`; FAQ, Fit guidance and Proof drop their own `84rem` for `Container`; section edges then match header and footer.
- Legal pages (privacy, terms, contact, refund policy): ink headings at `text-h2`/`text-h3`.
- Out of scope: copy, links, prices, JSON-LD, the footer, admin, checkout and account chrome.

## Tasks (one PR, reviewed as before/after screenshots)
1. `SectionHeading` component + unit test (rule, ochre, h2 token, optional subhead).
2. Homepage: HomeFaceBeyond, HomeIconProduct, HomeFitGuidance, HomeProof, HomeFaq, HomeRitual, HomeFormulationRecord, HomeIntro, HomeFormulator, HomeItaly, HomeObservations, HomeJournal (headings to tokens + ochre; widths to `Container`).
3. Inner pages: `science/*` (5), `journal/*` (5), `shop`, `shop/[slug]` section headings, `press`, `founding-100`, `house`, `ritual`, `build-your-ritual` (headings to `SectionHeading` / tokens).
4. Legal and utility pages: privacy, terms, contact, refund, unsubscribed (same sizes, ink).
5. Guard test: no ad-hoc `clamp()` heading sizes in `components/home/*`; no raw `text-2xl/3xl` section headings in public inner pages.
6. Verify: before/after screenshots of every changed page at 390, 1280 and 2000px; contrast of ochre on cloud; no horizontal scroll; full vitest, tsc, lint, CI.
7. Converge against the spec (R1-R6) and record what is untested.
8. Trail learning committed with the PR.

## Risks
- Existing tests assert specific class names in home components (e.g. gap and tap-target tests): update only where the assertion is about the old sizes, never to hide a regression.
- Headings shrink from up to 61-72px to 44px on the homepage; owner reviews the screenshots before merge.
- `Footer.tsx` untouched; the container change must not shift footer alignment.
