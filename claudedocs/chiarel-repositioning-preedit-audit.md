# Repositioning Brief — Pre-Edit Audit

Source: AI-generated "precision repositioning" brief, assessed against the live repo
(`C:\Users\New User\dev\Chiarel brand\chiarel`) before any edit. No code changed by this doc.

## Headline finding

The brief assumes CHIAREL's current live positioning is legacy debt to retire. It is not — it is
this project's **most recently ratified** brand decision. "The House of Clarity™,"
"Advancing Cellular Clarity™," "Modern Biological Stress™," and "CHIAREL Intelligence™" were
put in place by Decision 037 (commit `a151a23`, 2026-09-16), replacing the *actually* retired
"House of Skin Intelligence™" tagline. The brief's Section 0 tells me to retire the thing that
replaced the thing it thinks it's retiring.

Executing Section 0/2/3/6/7 as written would reverse an owner-ratified decision, sitewide,
without the owner in the loop. **Flagged for founder-review, not executed.**

## Group A — legacy brand/science positioning

| Term | Status | Evidence |
|---|---|---|
| House of Skin Intelligence™ | **Already retired.** Zero occurrences in `app/`, `components/`, `lib/`, `data/`. Only in historical planning docs. | Confirmed retired 2026-09-16 (Decision 037) |
| Skin Intelligence | Same as above — substring, zero standalone hits in code | — |
| CHIAREL Intelligence™ | **LIVE**, current positioning | `app/page.tsx:750`, `app/journal/three-skins-one-house/page.tsx:44`, `app/shop/[slug]/page.tsx:361`, `app/science/page.tsx:33` |
| Modern Biological Stress™ | **LIVE**, current positioning (6 locations) | `app/house/page.tsx:36`, `app/press/page.tsx:72`, `app/page.tsx:739,753`, `app/science/page.tsx:37-38`, `data/products.json:158` |
| Advancing Cellular Clarity™ | **LIVE**, site-wide default meta description and multiple pages | `components/HeroIntro.tsx:385`, `app/house/page.tsx:35`, `app/press/page.tsx:71`, `app/page.tsx:753`, `app/layout.tsx:29`, `lib/seo.ts:36` |
| Metabolic Skin Deflation | **Never existed.** Zero matches anywhere, including planning docs. | — |
| DWAT Restoration Science / DWAT | **Never shipped.** Zero matches in app code. Appears only in an external strategy doc as a codename explicitly marked retired/rejected in `brand_positioning.md:48-49` ("DWAT is a retired codename ... never part of this project"). | — |
| GLP-1 Resilience Complex / GLP-1 | **Never existed anywhere in this repo**, including planning docs. | — |
| Post-Metabolic Recovery | **Never existed.** Zero matches. | — |
| "cellular response in 48 hours" | **Never existed.** Zero matches. | — |

**Assessment:** four of the ten Group A terms the brief asks me to hunt down and remove
(Metabolic Skin Deflation, GLP-1, Post-Metabolic Recovery, "cellular response in 48 hours")
have never existed in this codebase at any point — not even in old planning docs. This strongly
suggests the brief was generated without reading this repo. The three terms that *are* live
(CHIAREL Intelligence™, Modern Biological Stress™, Advancing Cellular Clarity™) are the
opposite of legacy — they're the current ratified platform.

## Group B — scent/formulation terms

Only one term from this entire list is live: **"fragrance-free."** Every other listed term
(unscented, scent-free, perfume-free, chemical-free, toxin-free, non-toxic, all-natural,
100% natural, clean beauty, synthetic-free, quiet/soft aromatic signature, aromatic
composition) returns zero matches in live code. Several appear only inside this project's own
`claims_audit.md` / `constraint_diagnosis.md` as terms already verified absent.

"Fragrance-free" is live in exactly five places, all on N1:

| File | Line | Text |
|---|---|---|
| `data/products.json` | 335 | `"descriptor": "Fragrance-Free Nightly Renewal Emulsion"` |
| `data/products.json` | 360 | `"blurb": "A fragrance-free nightly emulsion for the neck, jawline, and décolleté..."` |
| `app/shop/[slug]/page.tsx` | 564 | `<li>· Fragrance-free</li>` |
| `app/page.tsx` | 40 | `"A fragrance-free nightly emulsion for the skin below the jawline..."` (OG/meta description) |
| `app/page.tsx` | 229 | `A fragrance-free nightly emulsion designed for the skin below` |

**Assessment: safe, concrete, low-risk fix.** Replace all five with the locked sentence
("N1 is finished with a delicate CHIAREL accord.") or remove cleanly where scent isn't the
point of the sentence. No conflict with any prior decision.

## Group C — prohibited claim language

No live violations. The only hit ("Anti-Aging") is inside a "words that used to appear on
labels" teaching list on `app/journal/reading-a-label/page.tsx:12` — intentional, confirmed
safe by this project's own `claims_audit.md:13`. Nothing to do here.

## Group D — structural facts

1. **No i18n/localization exists.** No `[locale]` route, no `next-intl`, no i18n config. The
   brief's `/en`, `/ar` locale-audit instructions are N/A — skip entirely.
2. **N1 slug is `n1-neck-decollete`**, referenced in 16+ live locations: `Header.tsx`,
   `Footer.tsx`, `data/products.json` (slug + 4 image paths), `app/shop/[slug]/page.tsx`
   (6 refs), `app/shop/page.tsx`, `app/page.tsx`, `app/ritual/page.tsx`,
   `app/journal/chiarel-ritual-guide/page.tsx`, plus `sitemap.ts`. The brief asks for the slug
   `n1-neck-decollete-renewal-emulsion`.
   **Assessment: do not rename.** This route is already live and indexed. Renaming breaks
   every inbound link, bookmark, and search result pointing at `/shop/n1-neck-decollete`
   with zero benefit — nothing about the brief's own requirements needs a new slug. Recommend
   keeping the current slug; if a URL change is genuinely wanted later, that's a separate,
   deliberate decision with redirects, not a side effect of a copy update.
3. **N1's `family` is `"CHIAREL Verde™"`** — identical to Recovery Masque's family. This is an
   established taxonomy (Verde/Rose/Terra families map to the Formal Garden/Peach Dust/Red
   Ochre color system). The brief's proposed family value `"N1 Renewal"` would break this
   shared taxonomy for one product only.
   **Assessment: keep `"CHIAREL Verde™"`.** If a distinct product-line name is wanted, add it
   as a `role`/badge field (N1 already has `role: "The Neck & Décolleté Treatment"`), not by
   overwriting the shared `family` taxonomy key.
4. **N1's current size is `"50 g / 1.7 fl. oz."`** — the brief specifies `"50 mL / 1.69 fl.
   oz."`. Different unit (grams vs. millilitres) and a different number. This is a physical
   packaging spec, not copy — it needs the owner's confirmation of which is actually correct
   before either value goes live, not a silent overwrite in either direction.
5. **N1 descriptor/blurb/benefits** — verbatim current values captured above and in Group B;
   these are exactly what Section 3's scent-language fix touches, nothing else needs to
   change structurally.
6. **Science subpages** — only the top-level `app/science/page.tsx` carries the
   "Modern Biological Stress™"/"CHIAREL Intelligence™" brand-platform language. The ingredient
   subpages (`l-ornithine`, `lasting-hydration`, `synergy`) use "cellular" only in a factual
   ingredient-mechanism sense (e.g. Ectoine's "cellular water organization") — that's science
   copy about how an ingredient works, not the retiring brand claim, and is out of scope for
   this brief regardless of what happens with Group A.
7. **JSON-LD/schema** lives centrally in `lib/seo.ts` plus per-page FAQPage blocks on most
   science subpages and the homepage/PDP. Any copy change to retained/removed terms must be
   mirrored here — `lib/seo.ts:36` currently emits "Advancing Cellular Clarity™" as the
   site-wide default meta description.
8. **`claudedocs/`** already exists and already uses the spec-driven-development convention
   (`claudedocs/specs/n1-campaign-photo-relabel/`, `claudedocs/specs/admin-rbac/`) — this
   repositioning work should follow the same pattern.
9. **Founding 100 anchor confirmed unchanged**: `recovery-masque`, per
   `app/founding-100/page.tsx:18` and `components/Header.tsx:8`. No conflict with the brief's
   "do not change" instruction — nothing to do here.
10. Other branded "Complex" names exist (`Cellular Intelligence Complex™`,
    `Terra Shield Complex™`, `Contour Renewal Complex™`, `Dermal Support Complex™`,
    `The Cascata Complex™`) — not targeted by the brief, not touched.

## Bottom line

Two independent workstreams, not one:

- **Safe to execute now**, no conflict with prior decisions: retire "fragrance-free" on N1
  (5 locations) → locked accord sentence. Update pricing/benefit copy only where it's
  currently inaccurate — nothing found that's inaccurate.
- **Blocked on founder decision**, because it reverses a ratified brand decision: everything
  in Section 0/2/3/6/7 that touches "Advancing Cellular Clarity™," "Modern Biological
  Stress™," or "CHIAREL Intelligence™." Also blocked: N1 slug rename, N1 family field change,
  N1 size correction (unit mismatch) — none of these are copy-cleanup, they're taxonomy/spec
  decisions.
