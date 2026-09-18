# CHIAREL Four-Product Launch — Implementation Plan

Status: plan only. No files have been changed yet as of this document. Implementation begins after this
plan (execution proceeds in the same session per the owner's instruction; this document is the required
gate artifact, not a request for a separate approval round-trip).

## 0. Non-negotiable constraints carried into every change below

- No prices set, changed, or invented anywhere, for any product, including N1.
- No checkout, payment, or subscription-calculation code touched.
- No change to Founding Pair contents/price/route/subscription cadence.
- No change to Founding 100 DB logic, scarcity counter, refund logic, or CHIAREL Circle mechanics.
- No change to Ritual Set contents/price/route.
- No product deleted, unpublished, renamed, or redirected. No existing slug changes.
- No deployment, no external service calls, no email sends.
- No medical/clinical/regulated claims anywhere (see §8 claims list).
- Owner will supply N1 pricing separately; nothing here blocks on it — N1 ships as a fully browsable,
  non-purchasable PDP until price arrives.

## 1. Necessary technical decisions not explicitly specified in the brief

The brief correctly forbids inventing an N1 price, but the codebase's `Product` type currently requires
`price: { subscription: number; oneTime: number }` as non-optional, and that field is read (without a
null check) in ~9 files, including the DB seed script that populates the actual purchasable-product
table read by checkout. Three decisions follow from "do not invent a price" taken literally:

1. **`price` becomes optional on the `Product` type.** Every current call site that reads `p.price.*` is
   either guarded with a `p.price &&` check, or simply never called for N1 because N1 is routed to a
   different UI branch (see below). This is the only type change in the plan; it's additive (optional),
   so no existing product's behavior changes.
2. **`prisma/seed.ts` skips seeding any catalog product without a `price` field.** This means N1 gets no
   row in the purchasable `Product` DB table used by `/api/cart` — which is correct, since it can't be
   purchased yet. No schema migration needed (no new required column).
3. **Every UI surface that would otherwise render a price for N1 instead renders "Price to be
   announced"** (plain customer-facing copy, not an internal review label) or, on the PDP itself, a
   static "not yet available for purchase" notice in place of the buy box — no new backend endpoint, no
   new signup-capture mechanism invented.

None of this touches the three existing launch products' price fields, checkout flow, or the cart API.

## 2. N1 placeholder image

No product photography exists for N1 (confirmed in the prior audit). Per the brief's explicit
permission to "use a clearly labeled product-image placeholder," a new static SVG asset is added:
`public/assets/products/n1-placeholder.svg` — solid Formal Garden (#1F5129) field with an ivory "N1"
mark and no photographic content, so it cannot be mistaken for real product photography. Alt text on
every use states plainly that it is a placeholder pending final photography.

## 3. DRAFT/OWNER-REVIEW marking mechanism

Per §15 of the brief, review labels must never render in customer-facing UI. All "DRAFT — OWNER /
REGULATORY APPROVAL REQUIRED" markers therefore live as **code comments directly above the copy blocks
they cover**, plus a consolidated list in the completion report. The customer-visible copy itself is
drawn only from the brief's own pre-approved cosmetic-language templates (§15) or paraphrases within
that same register — nothing invented beyond what the brief already authorized as safe draft language.

## 4. Files to be changed

| File | Change |
|---|---|
| `data/products.json` | Add `launchRitual`, `launchRitualOrder`, `launchRole`, `timeOfUse`, `launchStatus`, `productColorToken` to all 8 existing entries per the brief's exact mapping. Add new `n1-neck-decollete` entry (no price, no actives, no invented complex). |
| `lib/products.ts` | Add optional fields to `Product` type (incl. optional `price`). Add `launchRitualProducts` selector (sorted by `launchRitualOrder`), independent of the existing `ritualProducts` array, which is left untouched. |
| `prisma/seed.ts` | Skip seeding any product whose `price` is absent (currently only N1), with a console note, instead of crashing on `undefined.subscription`. |
| `public/assets/products/n1-placeholder.svg` | New placeholder asset. |
| `components/Header.tsx` | Nav: add "Neck & Décolleté" → `/shop/n1-neck-decollete`; keep all other items and routes. |
| `components/Footer.tsx` | Mirror the same nav addition; Press/Contact/Privacy/Terms columns untouched. |
| `components/ProductCard.tsx` | Guard price rendering — show "Price to be announced" instead of `$undefined` when `product.price` is absent. |
| `app/shop/[slug]/page.tsx` | Guard `PurchaseOptions`/`StickyPurchaseBar`/`productJsonLd` behind `p.price` presence; render an N1-specific buy-box placeholder and the 10 N1 PDP sections from §10 when `p.slug === "n1-neck-decollete"`; extend `CompleteYourRitual` to use `launchRitualProducts`-aware next-step logic **only for the four launch products**, leaving legacy PDPs' existing behavior unchanged; add N1 entries to `mechanismBySlug`. |
| `app/page.tsx` | Full hero replacement (N1-led) and homepage section reorder per §6 of the brief; FAQ price-list answer reworded to remove the now-inaccurate "five-step"/hardcoded catalog-price sentence; `offerCatalogJsonLd` call filtered to priced products only. |
| `app/shop/page.tsx` | Restructure into the 5 required sections (N1 hero, Day Ritual, Night Ritual, Beyond the Ritual, Existing Sets) — no product removed, only regrouped. |
| `app/ritual/page.tsx` | New H1/copy, Morning/Evening structure, "Optional Preparation" section for Cleanser/Mist, "Beyond the Ritual" for Lip Concentrate. |
| `app/build-your-ritual/page.tsx` | Switch to `launchRitualProducts`; N1 rendered as a non-selectable, clearly labeled "coming soon" tile excluded from subtotal/add-to-cart, so the builder never attempts to price or cart a priceless product. |
| `app/journal/chiarel-ritual-guide/page.tsx` | Replace the 5-step AM/PM sequence with the new 2-step AM / 3-step PM structure; move Cleanser/Mist to an "Optional Preparation" note; FAQ answer about ritual order updated to match. |
| `app/press/page.tsx` | Replace "six-formulation launch lineup" metadata description and "Six formulations..." body copy with the brief's supplied replacement line; remove the auto-derived `launchSkus` grid in favor of the four-product framing (Cleanser/Mist/Lip Concentrate remain listed, just not under a "six formulations" claim). |
| `lib/seo.ts` | No signature changes; `offerCatalogJsonLd`/`productJsonLd` already accept whatever list is passed — call sites are what change, not this file. *(Included in this table for completeness; see "no change" note in the diff summary if it ends up untouched.)* |
| `app/llms.txt/route.ts` | Guard the per-product price line for products without a price. |
| `app/sitemap.ts` | No code change needed — it already maps over `products` generically, so N1's route is included automatically once added to the data file. |

Not changed, and why: `lib/skin-assessment.ts` (already scoped to launched SKUs only, per its own
doc comment — no unlaunched product is recommended); `components/CartDrawer.tsx` (its "Complete the
Ritual" upsell reads the old `ritualProducts` array, which is unchanged by this plan, so its behavior is
unaffected — not a launch-ritual surface per the brief's list in §5); `app/api/checkout/route.ts`,
`lib/cart-context.tsx`, `lib/cart-server.ts`, `lib/pricing.ts` (checkout/payment/subscription logic —
explicitly out of scope); `app/founding-100/page.tsx` (Founding 100 logic — explicitly out of scope);
`app/science/page.tsx` and all science sub-pages (existing complexes/disclaimers preserved verbatim, no
edits needed since the brief's N1 science requirement is satisfied via `mechanismBySlug`, not a change
to the Science hub page itself); `app/house/page.tsx` (provenance content preserved as-is).

## 5. Product mapping (confirmed, no slug changes)

| Internal code | Public product | Route | Price | Action |
|---|---|---|---|---|
| 1A-R | CHIAREL Essence™ | `/shop/chiarel-essence` | unchanged | add launch fields only |
| 2A-R | Terra Radiance Crème™ | `/shop/terra-radiance-creme` | unchanged | add launch fields + day-comfort copy reposition |
| 4A-R | Recovery Masque™ | `/shop/recovery-masque` | unchanged | add launch fields + PM-routine copy reposition; Founding 100 untouched |
| N1-R | N1 Neck & Décolleté Renewal Emulsion™ | `/shop/n1-neck-decollete` (new) | **none — owner to supply** | new product, new route, placeholder image, no actives invented |

## 6. Legacy behavior explicitly preserved

- Cellular Cleanser™, Cellular Mist™, CHIAREL Lip Concentrate™: live, purchasable, indexed, unchanged
  routes/prices/data — only their *placement* in ritual-sequence UI changes (moved to "Optional
  Preparation" / "Beyond the Ritual" groupings), never their existence or purchasability.
- The Founding Pair, The Ritual Set: unchanged contents, price, route, subscription logic; homepage
  placement moves lower, CTAs unchanged.
- Founding 100 program: zero code changes. Still anchored to `recovery-masque`, still using the real DB
  counter, still the same refund/credit terms.
- All 8 existing product slugs, all existing sitemap entries, all existing canonical URLs: unchanged.

## 7. New N1 requirements (data + PDP)

`data/products.json` entry summary — every field either taken directly from the brief or left honestly
empty/placeholder rather than invented:

```
slug: "n1-neck-decollete"
sku: "N1-R"
name: "N1 Neck & Décolleté Renewal Emulsion™"
descriptor: "Fragrance-Free Nightly Renewal Emulsion"
role: "The Neck & Décolleté Treatment"
step: "Renew PM"
ritualOrder: null            (kept OUT of the legacy 5-item ritualProducts array)
family: "CHIAREL Verde™"     (Formal Garden family, matching Recovery Masque's color line)
color: { name: "Formal Garden", hex: "#1F5129" }
complex: ""                  (no complex name invented)
line: ""                     (not attributed to an existing formulation line without confirmation)
size: "Size to be confirmed" (honest placeholder, not an internal-review label)
price: <omitted entirely>
image: "/assets/products/n1-placeholder.svg"
icon: true
benefits: [cosmetic-appearance language only, drawn from the brief's approved list — see PDP section below]
launchRitual: true
launchRitualOrder: 4
launchRole: "hero"
timeOfUse: "PM"
launchStatus: "launch"
productColorToken: "Formal Garden"
```

PDP (`/shop/n1-neck-decollete`) will render, in order, exactly the 10 sections specified in §10 of the
brief: name/descriptor, what it's for, what it feels like, how to use, routine position, pair-with,
formula-transparency placeholder, testing/evidence placeholder, general cosmetic FAQ, and existing
support/returns links (`/contact`, `/terms`) — reusing the same components/link targets already proven
on other PDPs, not new infrastructure.

## 8. Claims content requiring owner/regulatory approval before real launch

All N1 copy (benefits, "what it's for," "what it feels like," FAQ, mechanism blurb) is drafted using only
the brief's own pre-approved cosmetic-appearance phrasing. It is flagged in code comments as pending
final owner/regulatory sign-off, per the brief's own instruction that this content needs review before
being treated as final. None of the following forbidden terms are used anywhere in the new copy:
clinically proven, lifts, tightens sagging skin, rebuilds collagen, repairs skin damage, regenerates
skin, cellular repair, DNA repair, wound healing, treats/prevents disease, medical-grade, dermatologist
approved, non-toxic, chemical-free.

## 9. SEO effects

- New route added to `generateStaticParams` (automatic, data-driven) and `app/sitemap.ts` (automatic,
  same mechanism).
- No `Product`/`Offer` JSON-LD emitted for N1 (guarded on `p.price` presence) until a real price exists —
  satisfies the brief's explicit schema-accuracy requirement.
- Homepage `offerCatalogJsonLd` call updated to pass only priced products.
- Metadata (`generateMetadata`) works unchanged for N1 since it only needs `name`/`descriptor`/`blurb`/`image`, none of which require a price.
- Press page metadata description changes (removes "six-formulation" claim) — the only metadata text
  change outside N1 itself.
- All existing canonical URLs, titles, and descriptions for the 8 existing products are untouched.

## 10. Accessibility requirements

- AM/PM and role are communicated via visible text labels ("Morning," "Evening," "Optional Preparation,"
  "Beyond the Ritual," "Neck & Décolleté") everywhere color-coded product cards appear — never color
  alone.
- N1's placeholder image ships with descriptive alt text stating it is a placeholder.
- Existing heading hierarchy patterns (h1 → h2 → h3) followed on every rewritten page; no heading level
  skipped.
- No new custom interactive controls introduced (build-your-ritual's N1 tile is a non-interactive,
  visually distinct "coming soon" card — no new keyboard trap, no new focus target that does nothing).
- Contrast: Formal Garden (#1F5129) on ivory and Red Ochre (#9B4722) on ivory are both already in
  production use elsewhere on the site (Recovery Masque, Terra Radiance Crème, sitewide UI accent) — no
  new color-on-background combination is introduced that hasn't already shipped.

## 11. Risks / blocked items going in

- **N1 has no price** → PDP cannot offer "Add to Bag"; a static "Price to be announced" state ships
  instead. This is expected and matches the owner's own note that pricing will follow.
- **N1 has no real photography** → placeholder graphic ships; must be swapped before any real-traffic
  promotion of the route.
- **No formula/actives data for N1** → the "Full Formulation Record" pattern used by every other PDP is
  intentionally *not* reused for N1 (it would otherwise render an empty/misleading module); a distinct
  placeholder module ships instead, clearly non-committal.
- **Press page product-count claim**: replacing "six formulations" removes a load-bearing but now-stale
  number; no replacement count is asserted, per the brief's own instruction.
- **Future recommendation (not implemented now, per instruction)**: consider replacing/supplementing The
  Founding Pair with an N1-centered Founding Ritual once N1's formula, price, photography, claims,
  evidence, offer terms, margin, and fulfillment plan are finalized.

## 12. Explicit confirmations

- Prices: not changed anywhere, for any product.
- Checkout/payment: not touched.
- Founding Pair: contents, price, route, subscription cadence unchanged; only homepage placement moves.
- Ritual Set: contents, price, route unchanged.
- Founding 100: zero code changes; DB logic, scarcity counter, refund terms, CHIAREL Circle mechanics untouched.
- Deployment: not performed. No build is pushed, no environment touched, no email sent, no external
  service called.

Implementation proceeds now.
