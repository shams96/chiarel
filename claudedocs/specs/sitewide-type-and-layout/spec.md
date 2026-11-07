# Sitewide type, colour and layout standard: spec (phase 1: specify)

Status: DRAFT for owner review. Nothing here is built. Source: owner request 2026-11-06 ("standardize all the headings and color like [the Face / Beyond the Face section], including the landing page"), plus a wide-screen screenshot showing sections sitting in separate places.

## Problem
The homepage and the inner pages do not share one standard.
1. **Type scale bypassed.** `tailwind.config.ts` defines `eyebrow`, `h4`, `h3`, `h2`, `h1`, `mega`. Homepage section headings use at least five hand-written `clamp()` sizes; inner pages use raw `text-xl/2xl/3xl` for section headings. Page titles use `text-mega` (PageHead) on some pages and `text-h1` on others.
2. **Heading colour varies by section.** Homepage: ochre (The Face, First), garden (FAQ, Fit guidance, Icon Product), ink (Proof, Beyond the Face), inherited (Ritual, Formulation Record). Inner pages: ink, with ochre only as hover and eyebrow.
3. **No shared content width.** `Container` (`max-w-container` + shared margin) exists but only the hero uses it. Face/Beyond and Icon Product are full-width 50/50 splits with inner caps (56rem, 30rem, 28rem); FAQ, Fit guidance and Proof use `84rem`; others use `max-w-measure` / `max-w-2xl`. On wide screens the halves drift to opposite edges with a large gap, and no two sections share left and right edges.

## Target look (owner's reference: Face / Beyond the Face section)
Thin ochre rule above, then a large Libre Bodoni ochre heading, an italic Bodoni subhead, Jost body, product and card names in ochre (underline on hover), small tracked uppercase ochre text links, solid garden-green primary button.

## Requirements
- R1. Every section heading (homepage and inner pages) uses the existing `text-h2` token. Card and product names use `text-h4`. Sub-headings use `text-h3` or `text-h4`. No ad-hoc `clamp()` heading sizes remain in `components/home/*`.
- R2. One page-title size across all public pages (proposal: `text-h1` everywhere; `text-mega` stays only for the homepage hero poster and, if the owner wants, the PageHead pages).
- R3. Section headings are ochre (#9B4722, 5.94:1 on cloud, valid for large text) with the thin ochre rule above. Garden green is reserved for primary buttons and the FAQ/Fit-guidance accent only if the owner chooses to keep it (open question A). Ink is for body text.
- R4. Homepage sections sit in `Container`. Two-column sections (Face/Beyond, Icon Product) keep their two columns inside the container rather than splitting the full viewport, so left and right edges match the header and footer at every width.
- R5. Inner-page section headings (`science/*`, `journal/*`, `shop`, `press`, `founding-100`, `house`) adopt R1 and R3; legal pages (privacy, terms, contact, refund) keep ink headings at the same sizes (quiet by design).
- R6. No change to copy, links, product facts, JSON-LD, prices or the footer (`components/Footer.tsx` is off-limits by owner rule).

- R7. Brand fonts are locked. Libre Bodoni is the sole family site-wide (owner ruling D1, 2026-10-31); this work changes sizes, colours and widths only. Enforced by `tests/brand-fonts.test.ts` (layout loads one family, Tailwind `serif` and `sans` both resolve to it, no other family declared). Correction: an earlier draft said "Jost body"; the site does not load Jost (its files remain only for jar-label rendering).

## Out of scope
Admin, checkout and account chrome (separate flows), copy changes, new sections, the footer.

## Open questions for the owner
- A. Headings: all ochre (recommended: one rule, matches the reference), or keep garden green on FAQ / Fit guidance / Icon Product?
- B. Page titles: `text-h1` everywhere (recommended), or keep the poster-scale `text-mega` on the PageHead pages?
- C. Two-column sections: constrain to the shared container (recommended), or keep full-bleed halves and only fix the gaps?

## Verification (for the converge phase)
- Search shows no ad-hoc `clamp()` heading sizes left in `components/home/*` and no raw `text-2xl/3xl` section headings on public inner pages.
- Rendered at 390, 1280 and 2000px: section edges align with header/footer; no horizontal scroll; ochre headings meet contrast on cloud.
- Visual diff of every changed page before and after, shown to the owner on a running preview.
- Full tests, tsc, lint and CI green.
