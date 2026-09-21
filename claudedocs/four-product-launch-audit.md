# CHIAREL Four-Product Launch — Site Audit & Mapping

**Status: read-only audit. No code, content, data, prices, claims, routes, redirects, navigation, images, SEO metadata, email flows, or deployment settings were modified in producing this document.**

Scope: inventory the current site as it actually exists in the repository, then map it against the
planned N1-R / 1A-R / 2A-R / 4A-R four-product launch structure so a future implementation phase has a
factual, verified starting point instead of assumptions.

---

## 1. Homepage — [app/page.tsx](../app/page.tsx)

15 sequential sections (already flagged for pacing in `claudedocs/site-audit-2026-09-16.md` P1-5):
Hero → Results → Provenance banner → Evidence grid → Full ingredient table → "Signature Serum / Nightly
Recovery" duo (Essence + Recovery Masque) → Formulated By → Backed by Research → Ritual Carousel (all 5
`ritualProducts`) → Fit Guidance → Category-norm comparison table → **Founding Pair** feature section
(price shown, CTA to `/shop/the-founding-pair` and `/shop/the-ritual-set`) → Icon Products (Cellular
Cleanser + Lip Concentrate) → FAQ → Philosophy/House closing.

Relevant JSON-LD emitted here: `faqJsonLd`, `webPageJsonLd`, `offerCatalogJsonLd` (all 8 catalog
entries, sets included), `researchArticleJsonLd`.

Hero H1 is literally the phrase **"Advancing Cellular Clarity™"** — this is the single most
structurally important string on the site if a repositioning around N1-R is considered later; it isn't
per-product copy, it's the homepage's primary heading.

FAQ answer text (`faqs[0].answer`) hardcodes specific prices and product names inline as prose — not
pulled from `products.ts` at render time for that sentence. Any future price/lineup change requires
editing this string manually; it will not update itself.

## 2. Navigation — [components/Header.tsx](../components/Header.tsx)

```
The Ritual (/ritual) · Shop (/shop) · The Science (/science) · The House (/house) · Journal (/journal) · Account (/account)
```

Same six links repeated in the mobile drawer. No per-product links in primary nav — products are only
reachable via `/shop` or `/ritual`. A `FOUNDING_100_PAGES` allowlist (`/`, `/founding-100`,
`/shop/recovery-masque`) controls where the sitewide Founding-100 promo ticker renders — this is a
route-based conditional, not content that lives on those pages themselves.

[components/Footer.tsx](../components/Footer.tsx) repeats the same three primary links (Ritual, Shop,
Science) plus House/Journal/Account/Press and Contact/Privacy/Terms. Footer tagline line: *"The House of
Clarity™ · Advancing Cellular Clarity™."*

## 3. Product page template — [app/shop/[slug]/page.tsx](../app/shop/[slug]/page.tsx)

One shared template drives every PDP via `getProduct(params.slug)`; no per-product `.tsx` files exist.
Section order, each conditionally rendered off fields in `data/products.json`:

1. Breadcrumb (`Shop / {name}`) + `productJsonLd` + `breadcrumbJsonLd`
2. Hero: gallery image (single image, sized to add more later) + buy box (name, descriptor,
   `productFactSummary()` — an auto-generated GEO sentence, not hand-written — role badge if present,
   blurb, `PurchaseOptions`, a spec `<dl>` for Step/Family/Complex/Size/Color)
3. `BenefitPills` — primary active %, "Customer Tested", "Every Active Disclosed", "Made to Order in
   Isola del Liri, Italy"
4. `WhatsInside` — only for bundles (`p.includes`)
5. `BrandStatement` — identical block on every PDP, origin story
6. `KeyBenefits` — from `p.benefits[]`
7. `IncludedSpatula` — hardcoded to `recovery-masque` only
8. `ClinicallyDosed` — the actives-with-percentages table (this is the actual "Clinically Dosed" content
   block; the literal phrase "Clinically Dosed. No Hidden Blends." does not appear as page copy anywhere
   in the live codebase — see §9)
9. `TheScience` — mechanism steps, keyed by slug in `mechanismBySlug` (only 4 slugs have entries:
   `cellular-cleanser`, `chiarel-essence`, `terra-radiance-creme`, `recovery-masque`); `cellular-mist` gets
   a dedicated `CellularHydrationCascade` visualization instead of text steps
10. `ScienceLinks` — keyed by slug in `scienceLinksBySlug` (only 3 slugs have entries)
11. `UsageGuidance` — generic patch-test/retinoid-layering guidance, skipped for bundles
12. `CompleteYourRitual` — cross-sell to the *first other* `ritualProducts` entry (not a smart "next
    step," just `ritualProducts.find(r => r.slug !== currentSlug)`)
13. `StickyPurchaseBar`

**Implication for the 4-product plan:** the template is entirely data-driven off `data/products.json`
fields (`step`, `family`, `complex`, `benefits`, `actives`, `ritualOrder`, `includes`) plus three
slug-keyed lookup objects (`mechanismBySlug`, `visualizationBySlug`, `scienceLinksBySlug`) hardcoded in
the page file itself, not in the data layer. A new product (N1-R) would need entries in all three maps
to get real "science" content rather than silently rendering nothing for those sections.

## 4. Product data & SKUs — [data/products.json](../data/products.json) via [lib/products.ts](../lib/products.ts)

8 entries total. `ritualProducts` = the 5 with non-null `ritualOrder`, sorted by that field.

| slug | SKU | name | step / ritualOrder | color (name / hex) | price sub / one-time |
|---|---|---|---|---|---|
| `cellular-cleanser` | 01 | Cellular Cleanser™ | Cleanse / 1 | Cloud Dancer #F0F2EB | $78 / $98 |
| `cellular-mist` | 02 | Cellular Mist™ | Tone / 2 | Cloud Dancer #F0F2EB | $70 / $88 |
| `chiarel-essence` | 03 | CHIAREL Essence™ | Serum / 3 | Peach Dust #FAD6C9 | $151 / $189 |
| `terra-radiance-creme` | 04 | Terra Radiance Crème™ | Moisturize AM / 4 | **Red Ochre #9B4722** | $126 / $158 |
| `recovery-masque` | 04N | Recovery Masque™ | Moisturize PM / 5 | **Formal Garden #1F5129** | $118 / $148 |
| `lip-concentrate` | 05 | CHIAREL Lip Concentrate™ | Standalone / null | Peach Dust #FAD6C9 | $46 / $58 |
| `the-founding-pair` | SET-02 | The Founding Pair | null | Champagne Gold #D6C5A0 | $243 / $347 |
| `the-ritual-set` | SET-01 | The Ritual Set | null | Champagne Gold #D6C5A0 | $372 / $533 |

**Color discrepancy to flag, not resolve:** the brief specifies Garden Green as `#004B3` for N1-R and
4A-R. That is not a valid 6-digit hex (5 characters after `#`). The nearest live analogue already in the
system is Recovery Masque's `Formal Garden` at `#1F5129`. If `#004B3` was meant as shorthand or a typo
for a specific hex, it needs to be resolved with whoever specified it before any color token is created
— do not guess and silently substitute one value for the other.

Terra Radiance Crème and CHIAREL Essence both already use **Red Ochre #9B4722** exactly as specified for
1A-R/2A-R — no discrepancy there; that token is already the site's primary UI accent color too (see
[chiarel-color-ui-scope memory]), so it's shared between brand-chrome use and this specific product-color
use today.

### Actives currently disclosed (relevant to potential mapping)

- `chiarel-essence`: Palmitoyl Pentapeptide-4 (3%), Bioactive Ferment Lysate (0.30%)
- `terra-radiance-creme`: Ceramide NP (0.8%), Niacinamide (3.0%)
- `recovery-masque`: L-Ornithine (1.0%), Panthenol (2.0%)

None of the three current formulas' disclosed actives are named "peptide hydration," "barrier comfort,"
or "night renewal" as such — those are the *planned* product names/positioning from the brief, not
existing copy. Confirming whether `chiarel-essence`'s actual formula, viscosity, and packaging match a
"Peptide Hydration Essence" name, or whether `terra-radiance-creme`'s actual formula matches "Barrier
Comfort Cream," or whether `recovery-masque`'s actual formula/format matches "Night Renewal Treatment,"
requires the underlying formulation dossier (see `chiarel-formulation-registry` memory) — that
verification is outside what this repository's front-end code can confirm on its own, and is exactly the
kind of "only if formula, format, and intended use match" check the brief itself calls for on 4A-R.

## 5. Product routes

Single dynamic route: `app/shop/[slug]/page.tsx`, `generateStaticParams()` returns all 8 slugs above —
no other product route pattern exists (no `/products/*`, no per-category routes). `/ritual` and
`/build-your-ritual` render the same 5 `ritualProducts` via different UI (linear scroller vs. a
toggle-and-price-preview grid), both linking out to `/shop/{slug}` for purchase.

## 6. Product photography/assets — `public/assets/products/`

```
masque-shore.png · applicator-spatula.png · cellular-cleanser-shore.png · cellular-mist-shore.png
essence-shore.png · founding-pair-shore.png · lip-concentrate-shore.png · ritual-set-shore.png
terra-radiance-creme-shore.png · essence-freeze-frame.png · lip-concentrate-transparent.png
lip-concentrate-ivory.png
```

**No neck/décolleté product image exists.** N1-R has zero photography today — this is a genuinely new
product with no asset to repurpose, confirming the brief's own "New product" label. All other product
images above already exist and are actively referenced from `data/products.json`.

## 7. Shop page — [app/shop/page.tsx](../app/shop/page.tsx)

Minimal: renders all 8 `products` (5 ritual steps + lip concentrate + 2 sets) through `ProductCard` in a
flat grid, no filtering, no category grouping, subtitled "Consumer Collection™."

## 8. Ritual page — [app/ritual/page.tsx](../app/ritual/page.tsx)

H1 is literally **"Cleanse → Tone → Serum → Moisturize"** — a 4-word/4-step framing, even though the
page then renders all 5 `ritualProducts` below it (Cleanse, Tone, Serum, Moisturize AM, Moisturize PM
are the 5 steps — the H1 collapses AM/PM moisturize into one word). Below the main ritual list, a
"Beyond the ritual" section separately features `lip-concentrate` as an explicitly non-ritual add-on.
Two entry points into `/assessment` and `/build-your-ritual` sit right under the H1.

## 9. Founding Pair — data + surfaces

`the-founding-pair` (SET-02) = `chiarel-essence` + `terra-radiance-creme`, "delivered together every 45
days," $243 sub / $347 one-time. Surfaces:
- Homepage: dedicated feature section with price and two CTAs (`/shop/the-founding-pair`,
  `/shop/the-ritual-set`)
- `lib/skin-assessment.ts` line 191: recommended result copy references "the Founding Pair" by name for
  users with "structural concerns"
- `app/assessment/page.tsx`: a result branch that both names it and shows its subscription price inline

## 10. Founding 100 / 90-Day Ritual — [app/founding-100/page.tsx](../app/founding-100/page.tsx)

**Important distinction not to conflate:** this program's "90-Day Ritual" is *not* the Founding Pair.
It is two consecutive 45-day subscription shipments of **`recovery-masque` only** (`getProductOrThrow("recovery-masque")`,
`ninetyDayTotal = masque.price.subscription * 2`). Mechanism: half-price at checkout, full refund of the
remaining balance after 90 days of use + a submitted video/before-after set (Founding 100 tier), or a
20%-off + 25%-cashback variant for the next 750 signups (CHIAREL Circle™ tier). Real, DB-backed scarcity
counter (`db.foundingSignup.count()`), not a fabricated countdown. Content-rights and FTC-disclosure
terms are written out in full on-page. CTA at the bottom: "Begin the 90-Day Ritual" → `/shop/recovery-masque`.

If 4A-R is intended to map onto `recovery-masque`, this program's entire mechanic, copy, and DB-driven
counter are currently anchored to that exact slug — a rename/remap would need every reference here
(`getProductOrThrow("recovery-masque")`, the hardcoded "Recovery Masque™" strings, and the
`/shop/recovery-masque` link at the bottom) updated in lockstep, not just the product page itself.

## 11. Press page — [app/press/page.tsx](../app/press/page.tsx)

Metadata description says **"the six-formulation launch lineup."** `launchSkus = products.filter(p =>
!p.set)` = 6 products (the 5 ritual steps + lip concentrate) — this is where "six-formulation" comes
from structurally: it's `products.length` minus the 2 bundle SKUs, not a separately maintained number.
Body copy repeats "Six formulations, each assigned a signature category color across the ritual." Brand
fact sheet correctly says tagline = "The House of Clarity™" (already updated) and mission =
"Advancing Cellular Clarity™ — supporting the skin's own intelligence against Modern Biological
Stress™" (matches House page verbatim).

## 12. House page — [app/house/page.tsx](../app/house/page.tsx)

Text-only (no location photography exists yet, per its own code comment). Sections: Isola del Liri →
"A Red Drawn From the Land" (explains Red Ochre's provenance narrative) → Mission (Advancing Cellular
Clarity™ / Modern Biological Stress™, verbatim) → La Bella Figura → Formulated By (Grazia Savoriti) → A
Considered Practice.

## 13. Science page — [app/science/page.tsx](../app/science/page.tsx) + 8 sub-pages

Top-level page repeats the mission line, then lists 5 "Complexes" (Cascata, Cellular Intelligence, Terra
Shield, Contour Renewal, Dermal Support — the last explicitly marked "In development"), then links out
to 8 dedicated sub-pages: `/science/barrier-resilience`, `/lasting-hydration`, `/synergy`, `/application`,
`/ectoine`, `/bifida-ferment-lysate`, `/l-ornithine`, `/comparison`. All complex names carry an explicit
"provisional pending formal trademark clearance" disclaimer already.

## 14. Journal + ritual-guide article

`/journal` lists 4 articles (`chiarel-ritual-guide`, `three-skins-one-house`, `isola-del-liri-waterfall`,
`reading-a-label`). The ritual-guide article ([app/journal/chiarel-ritual-guide/page.tsx](../app/journal/chiarel-ritual-guide/page.tsx))
is the most directly relevant to the planned AM/PM restructure: its own H1/intro literally say **"a
five-step daily practice,"** then lays out:

- **Morning:** Cellular Cleanser → Cellular Mist → CHIAREL Essence → Terra Radiance Crème
- **Evening:** Cellular Cleanser → Cellular Mist → CHIAREL Essence → Recovery Masque

...i.e. today's real AM/PM structure is already "shared serum, different moisturizer" — structurally the
same shape as the brief's planned four-product AM/PM ritual (1A-R shared, then 2A-R day / 4A-R night),
just with two additional steps (cleanse, tone) ahead of it. It also carries its own `faqJsonLd` script
(separate from the homepage's), and an "Eye Area Guidance" section that explicitly states no dedicated
eye product exists yet.

## 15. Redirects

**None exist.** [next.config.mjs](../next.config.mjs) has no `redirects()` function at all — its only
non-default settings are `output: "standalone"`, `images.unoptimized: true`, and
`experimental.instrumentationHook: true` (all deploy/build-related, unrelated to routing). Any future
slug change (e.g. `recovery-masque` → something 4A-R-branded) would need redirects added from scratch;
none currently exist to inventory or preserve.

## 16. Structured data / schema markup

Centralized in [lib/seo.ts](../lib/seo.ts):
- `organizationJsonLd` — legalName 1HubSolutions LLC, slogan "The House of Clarity™"
- `formulatorJsonLd` — Grazia Savoriti, linked to her real external Natural You Srl bio
- `webPageJsonLd(opts)` — used per-page with per-page `dateModified`/`datePublished`
- `researchArticleJsonLd` — homepage-only, cites the 4 named actives
- `faqJsonLd(faqs)` — homepage + ritual-guide article each build their own FAQ array
- `offerCatalogJsonLd(products)` — homepage only, all 8 SKUs including bundles
- `breadcrumbJsonLd(crumbs)` — PDP only
- `productJsonLd(p)` — PDP only, per-product `Product`/`Offer` schema

No sitewide `Organization`/`Person` script tag was found actually emitted in `app/layout.tsx` in this
pass — `organizationJsonLd`/`formulatorJsonLd` are exported but their actual render call sites weren't
located among the pages read; worth a targeted grep for `organizationJsonLd` render usage before relying
on it being live sitewide (flagged, not resolved — outside this pass's read set).

## 17. SEO titles, descriptions, canonicals, sitemap

Every page sets `alternates: { canonical: "/path" }` consistently. [app/sitemap.ts](../app/sitemap.ts)
lists 20 static routes + all 8 product routes (dynamically pulled from `products`, so it will pick up
any real data-layer product-list change automatically — it is not a hardcoded slug list). `app/robots.ts`
exists but wasn't read in this pass (out of scope for the phrase/structure audit; flagged if needed
later).

## 18. Phrase inventory — exact live locations

### "House of Skin Intelligence™"
**Not present anywhere in live code or content.** Only reference is a historical note in
`brand_positioning.md` documenting that it was retired and replaced by "The House of Clarity™" (Decision
037) — this already happened before this audit, not a pending change.

### "Advancing Cellular Clarity™"
Live in: `app/layout.tsx` (root metadata description), `app/page.tsx` (homepage H1 + metadata + FAQ),
`components/Footer.tsx`, `components/HeroIntro.tsx`, `app/house/page.tsx`, `app/press/page.tsx`,
`lib/seo.ts` (`organizationJsonLd.description`). This is the site's mission statement, repeated verbatim
across nav-adjacent, hero, and structured-data surfaces — the single most load-bearing phrase on the
site after the CHIAREL name itself.

### "Modern Biological Stress™"
Live in: `app/house/page.tsx`, `app/press/page.tsx` (both as "...against Modern Biological Stress™,
with restraint..."), `app/page.tsx` (hero subhead, unbolded/no ™ in that one instance — "against Modern
Biological Stress." — worth noting the trademark symbol is inconsistently applied here vs. the House/Press
pages), `data/products.json` (Terra Radiance Crème's blurb).

### "Clinically Dosed. No Hidden Blends."
**The exact phrase does not appear as live page copy anywhere.** The *concept* is fully implemented as
the `ClinicallyDosed()` component on every PDP with dosed actives (header: "The Full Formulation
Record"), and as "Customer-tested, no hidden blends" on the homepage evidence section — but the specific
phrase from the brief is not a current string in the codebase. An old `.impeccable/critique/` file (a
retained design-critique artifact, not live content) references "Clinically Dosed" as a claim that was
"restated 3x in one screen" during a prior draft — meaning this phrase existed in an earlier iteration
of the PDP and was apparently already edited out or renamed to "The Full Formulation Record" since then.

### "CHIAREL 90-Day Ritual"
Live in `app/founding-100/page.tsx` metadata description ("Join the first 100 members of the CHIAREL
90-Day Ritual...") and body copy ("Begin the 90-Day Ritual," "Circle members begin the 90-Day Ritual
at..."). As covered in §10, this phrase currently refers exclusively to the two-shipment Recovery Masque
program, not a 4-product regimen.

### "Founding Pair"
Live as a real SKU (`the-founding-pair`, SET-02) plus its surfaces in the homepage, assessment flow, and
skin-assessment recommendation copy — see §9 for full detail.

### "Five-step ritual" / "5-step"
The literal phrase "five-step" appears exactly once in live code: `app/page.tsx`'s FAQ answer, "...the
complete **five-step** Ritual Set." The ritual-guide journal article separately calls it "**a five-step
daily practice**" in its own intro (§14) without using the word "step" as a count — same underlying
5-item structure (`ritualProducts`), described in two slightly different phrasings in two places. No
page uses "5-step" as a compact numeral form.

### "Six-formulation launch"
Live in `app/press/page.tsx` — both the page's `<meta name="description">` and its visible body copy
("Six formulations, each assigned a signature category color across the ritual"). As shown in §11, this
number is structurally derived (`products.filter(p => !p.set)`, currently 6), not a separately
hardcoded literal that could drift from the data — though the *word* "six" in the sentence itself is
hardcoded prose, so if the underlying non-bundle product count ever changes, that sentence would need a
manual edit even though the grid above it would update itself.

---

## Summary: what a future implementation phase would actually touch

This is a map of surface area, not a task list — no changes are proposed or scoped here per the phase's
own constraint.

| Planned product | Best current candidate | What matches | What's unverified or in conflict |
|---|---|---|---|
| N1-R Neck & Décolleté Renewal Emulsion | None — genuinely new | Category-defining/new is accurate: no data entry, route, or photography exists | Garden Green hex in the brief (`#004B3`) isn't a valid hex; nearest live token is Formal Garden `#1F5129` |
| 1A-R Peptide Hydration Essence | `chiarel-essence` (SKU 03) | Slot (Serum step, ritualOrder 3), Red Ochre-adjacent role as "Signature Serum," AM+PM usage per ritual-guide | Actual formula is Palmitoyl Pentapeptide-4 + Bioactive Ferment Lysate — whether that matches a "hydration essence" naming/positioning wasn't verifiable from code; product's *own* color is Peach Dust #FAD6C9, not Red Ochre — Red Ochre is currently Terra Radiance Crème's product color (it's also the sitewide UI accent, a separate use) |
| 2A-R Barrier Comfort Cream | `terra-radiance-creme` (SKU 04) | Red Ochre #9B4722 matches exactly, AM/day moisturizer slot matches exactly, Ceramide NP + Niacinamide is a genuine barrier-support formula | Current name/positioning is "radiance," not "barrier comfort" — a framing shift, not a data conflict |
| 4A-R Night Renewal Treatment | `recovery-masque` (SKU 04N) | PM/night moisturizer slot matches, L-Ornithine + Panthenol is a genuine recovery-oriented formula | Current color is Formal Garden #1F5129, not the brief's stated `#004B3` (see N1-R row — same open hex question); this slug is the sole anchor of the entire Founding 100 program mechanic and copy (§10) — remapping it has the widest blast radius of any single change in this plan |

Two structural decisions flagged by the brief for review, with their exact current-state anchors:
- **Founding Pair → possible N1-centered Founding Ritual**: today's Founding Pair is Essence + Terra
  Radiance Crème specifically (§9); it has three separate call sites (homepage, assessment result copy,
  `lib/skin-assessment.ts`) that would all need to move together.
- **Five-step ritual → four-product AM/PM**: today's ritual is Cleanse → Tone → Serum → Moisturize(AM/PM),
  5 SKUs (§8, §14); dropping Cleanse (`cellular-cleanser`) and Tone (`cellular-mist`) from the primary
  ritual sequence would leave those two SKUs still fully live and purchasable (per the brief's explicit
  instruction not to unpublish them) but absent from `ritualProducts`' ordered sequence, which currently
  drives the homepage carousel, `/ritual`, `/build-your-ritual`, and the PDP's `CompleteYourRitual`
  cross-sell — all four of those surfaces read from the same `ritualProducts` array, so a ritualOrder
  change would need to be made once in `data/products.json` and would propagate to all four
  automatically, rather than needing four separate edits.
