# Phase 1 deliverable: audit, component inventory, design assessment

Brief section 2 and 11 (Phase 1). Read-only; no code modified. Evidence: 8 auditors + critic on 2026-10-31, re-verified where marked V. Companion: `SPEC.md` (conflicts D1-D15, rulings accepted).

## Brief section 2 checklist

| # | Item | Result |
|---|---|---|
| 1-2 | Codebase, framework, routing | V. Next 15.5 App Router, React 18, Tailwind 3.4 JS config, framer-motion 13 (5 files), `output: standalone`, ~88 tsx files. Routes: `/`, shop, shop/[slug], science (+5), journal (+4), house, press, ritual, build-your-ritual, assessment, founding-100, cart, checkout, account, admin, order |
| 3 | Templates and reusable components | Content pages are bespoke `mx-auto max-w-3xl py-16` wrappers (~2,100 lines, 19 files); no shared page shell, section or type component. Shared: RoutineBand, EmailSignup, ComingSoonPackshot, cart libs |
| 4 | CSS, tokens, typography | `globals.css` 372 lines; tailwind extends only colours, fontFamily, one tracking value. No fontSize/spacing/container tokens. Two fonts (Bodoni + Jost, Jost implicit body default). 8 tracking values for one eyebrow role; 221 labels at 11-12 px |
| 5 | Images and assets | `images.unoptimized: true`; hero 438 KB; packshots `clarity-*`, scenes, OG files, 4 testimonial photos, formulator cutout, Cascata/bridge/illustration. No lab photography. See SPEC photo inventory |
| 6 | Breakpoints | Tailwind defaults only. Uses: md 116, sm 50, lg 35, xl 0, 2xl 0. 1440/1920 untuned |
| 7 | Nav, cart, checkout, subscription | Header, CartDrawer, CartPageContent, PurchaseOptions (3 tiers), StickyPurchaseBar (always adds subscription), Stripe, Klaviyo (server-side), GA4 with Consent Mode v2. Strict CSP |
| 8 | Animation | Reveal (whileInView once), HeroIntro (6.8 s modal, scroll lock, animated gradient masks), AmbientVideo, hover scale. Global reduced-motion kill switch exists; StickyPurchaseBar lacks the hook. No parallax, no scroll hijack |
| 9 | Homepage and PDP content map | Home order: HeroIntro > Hero > FaceBeyond > Ritual > IconProduct > FitGuidance > Provenance > Proof > Philosophy > FormulationRecord > FAQ > FinalCta > EmailSignup. PDP: single 782-line server component. Maps in SPEC section 5 and PLAN |
| 10 | Duplication and inconsistency | 20+ max-widths, 4 gutter systems, two reds, ~12 stray hex values, copy-pasted science-page blocks, orphan RitualCarousel (0 imports, V), 3 dark sections against a "light only" rule |

## Component inventory

**Reuse as-is:** Analytics, AnalyticsProvider, TrackViewItem, TrackPurchase, HideOnAdmin, StagingBanner, CookieSettings*, CartDrawer, CartPageContent, AddPairButton, PurchaseOptions, ProductGallery, Reveal, AmbientVideo, EmailSignup, RefundPolicyContent, ComingSoonPackshot, RibbonBand, and all `lib/*` commerce, pricing, cart, SEO and analytics code.
**Modify (restyle/re-layout, same data flow):** Header (grid margin, navigation tone), Footer (**no file edit**; inherits font/colour tokens), ProductCard, ProductAccordions, StickyPurchaseBar (reduced motion), EvidenceGrid, EditorialFeature, RoutineBand + HomeRitual (split into Morning/Evening, keep ids and markup contract), HomeHero, HomeFaceBeyond, HomeIconProduct, HomeFitGuidance, HomeProof, HomeFormulationRecord, HomeFaq (JSON-LD parity), HomeClosing (`HomePhilosophy`, `HomeFinalCta`), the shop index, every content page wrapper.
**Replace (kept to the minimum, per brief rule "do not replace working components"):** none wholesale. HeroIntro is *modified* (shortened, same session/reduced-motion logic); HomeProvenance is *modified* in place (light colours, two blocks separated); the PDP stays one file, reordered in place, with only the two genuinely new blocks (Formulation, Ingredient notes) added as small components; `RitualCarousel` is an orphan, left untouched unless the owner asks to delete it.
**New:** layout primitives (Container, Grid, Section, Eyebrow, Heading); HomeObservations, HomeScience (structured), HomeHouse, HomeJournal, HomeDiscovery; PDP Formulation and Ingredient-notes blocks.

## Design assessment (what is weak today)

1. No system: edges do not align between header, footer and sections; no grid; type scale is ad hoc.
2. Colour-block homepage in two reds, peach and green bands with velvet ribbons: reads as campaign, not editorial house.
3. Hierarchy is carried by tiny tracked labels rather than scale and whitespace.
4. Science and provenance are present but thin and unstructured; Journal absent from home; no observation section.
5. PDP is long and uninterrupted; no formulation or references structure.
6. First-visit overlay and unoptimised images work against performance and "restrained".

## Functionality risks (carried into PLAN gates)

Footer inherits global tokens; 21 source-grep tests will fail mechanically; JSON-LD must keep matching visible text; CSP blocks any external asset; 44 px tap-target and verbatim-copy contracts; `next build` does not type-check; owner's uncommitted images live in a different checkout; photo permissions and licences unconfirmed (SPEC section 3, D8, D9).

## Brief section 12 rule compliance check

Rules 1-14 each have an owner in PLAN "Strict-rule gates". Rule 7 (no invented clinical evidence) is the binding constraint on Section 07; rule 10 (no new dependencies) holds because everything uses Tailwind, CSS and existing framer-motion.
