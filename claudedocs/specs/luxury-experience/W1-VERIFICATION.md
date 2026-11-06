# W1 hero: verification record

Branch `feat/hero-image-first` (PR 152) vs `main` at 7540dc4, 2026-11-05. Production builds of both (`npm run build`, CI dummy environment), served locally. Nothing here was measured against chiarel.com.

## Page speed (Lighthouse 12.8, mobile emulation, simulated slow-4G throttling, 3 runs each, alternating)

| | main (baseline) | this branch |
|---|---|---|
| LCP, per run | 4850, 4719, 4741 ms | 3852, 3995, 4794 ms |
| LCP, median | 4741 ms | 3995 ms |
| LCP element | the hero paragraph (`<p class="mt-10 max-w-measure ...">`) in all 3 runs | the hero photograph (`clarity-essence-mirror-scene`) in all 3 runs |
| Performance score, median | 80 | 85 |
| CLS | 0 | 0 |
| TBT, median | 165 ms | 162 ms |
| Accessibility score | 100 | 100 |

Reading: no regression. The LCP element changed from text to the photograph, as predicted, and the median LCP is lower. One branch run (4794 ms, TBT 279 ms) matches the baseline range, so the runs are noisy and the gain is modest; treat it as "not worse", not as a promise of 750 ms. Absolute numbers are a localhost simulation, not field data. Both builds are above Google's 2.5 s "good" LCP threshold; that is true of `main` too and is outside W1.

## Accessibility (axe-core 4.10.2, WCAG 2.0/2.1/2.2 A and AA plus best-practice, production build, 390x844)

- Full page: 0 violations, 44 rules passed.
- Hero section alone: 0 violations, 10 rules passed.
- "Needs review" (axe cannot compute contrast over a gradient): the three existing poster words (`.poster-a/b/c`), ink at 84% over the hairline grid; about 7.4:1 by calculation, and the smallest is 28.6px. Not changed by this PR.
- The new problem line (ink at 80%, 20px) is 6.53:1 on #F5F5F7 and was not flagged.
- Not done: a screen-reader pass with real assistive technology.

## ui-ux-pro-max audit

| Area (rule) | Result | Evidence |
|---|---|---|
| Content priority (`content-priority`) | Pass | Photograph y=201-479 and headline y=568-826 within the first 844px; before: photograph y=934 |
| Primary action (`primary-action`) | Pass | One primary CTA; the new line is plain text |
| Touch target and spacing | Pass | CTA `min-h-[48px]`; 32px gap to the price line |
| Reading order vs visual order | Pass | DOM order h1, problem line, CTA, price, paragraph, photograph; the photograph leads only visually below lg; the CTA is the only focusable element in the hero |
| Contrast | Pass | 6.53:1 for the new line; axe 0 violations |
| Type floor and size | Pass | `text-lead` = 20px; no `text-[8-11px]` (pinned by a test) |
| Line length | Pass | `max-w-measure` 36rem; about 34 characters per line at 390px |
| Layout shift | Pass | `aspect-[5/4]` and `lg:aspect-[100/115]` reserve space; CLS 0 |
| Horizontal scroll | Pass | none at 390, 768, 1280 |
| Viewport | Pass | `width=device-width, initial-scale=1`; zoom not disabled |
| Heading hierarchy, alt text | Pass | one h1; descriptive alt; vertical wordmark `aria-hidden` |
| Motion | Pass | `.hero-in > *` off under `prefers-reduced-motion`; fifth child has a delay rule; no animation on the LCP image |
| Container and grid width (rows 108-109) | Pass | shared `Container` and `Grid`; no hardcoded `max-w-*`; lg split is 6/6 for two similarly dense blocks |
| Rows 100-106 | N/A | hero has no scroll container, tab bar, input, feed, toggle, permission prompt or sheet |
| Row 107 | Pass (adapted) | CTA is a plain link to `/ritual` |
| Row 110 | N/A | no AI output or screening feature in the hero |

Findings that needed a fix: none. Accepted trade-off (owner, 2026-11-05): the CTA is at y=975 at 390x844, one scroll down.

## Test suite, types, lint, build

`npx vitest run`: 53 files, 685 tests pass. `npx tsc --noEmit`: clean. `npm run lint`: clean. `npm run build`: succeeds. These ran with `oauth4webapi@3.8.8` placed in the worktree's `node_modules` (integrity hash checked against `package-lock.json`).
