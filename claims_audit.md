# CHIAREL™ Claims Audit (Phase 4)

**Method:** Full keyword scan of `app/`, `components/`, `data/` for banned/risky
terms (heal, cure, treat, repair, regenerate, clinically proven, dermatologist
approved, non-toxic, chemical-free, medical-grade, anti-aging, barrier repair,
inflammation, eczema, rosacea, acne, miracle, reverses, damaged skin) — same
scan as Phase 1, re-run and tabulated per the brief's required format. This
supersedes the informal Phase 1 keyword scan with the full audit table.

| Current claim | Location | Risk | Recommended replacement | Evidence needed | Action |
|---|---|---|---|---|---|
| "Treat with CHIAREL Essence™" | `app/journal/chiarel-ritual-guide/page.tsx:26` | Low-risk cosmetic claim | None — "Treat" is used as the ritual step name (Cleanse/Tone/Treat/Moisturize), matching `step: "Serum"` in the product data, not a medical claim | None | No action |
| "Anti-Aging" / "Miracle" / "Wrinkle Repair" | `app/journal/reading-a-label/page.tsx:12,14,16,45` | None — these are *retired-words examples*, listed on a page that teaches customers to spot bad label claims | N/A | None | No action — this page is doing its job |
| "...barrier repair." (L-Ornithine, studied for its role in NMF and overnight barrier repair) | `app/page.tsx:519` | Requires substantiation | Citation link is already present (PubMed search link follows) — acceptable as an ingredient-literature claim, not a product-efficacy claim, per [[CHIAREL Claims Hierarchy V1.0]] | Confirm the linked search actually supports "barrier repair" specifically, not just general skin-barrier research | Legal/regulatory spot-check of the citation link before next content freeze |
| "...hydration–barrier–repair cascade" | `app/science/l-ornithine/page.tsx:94` | Requires substantiation | Same ingredient-mechanism framing as above — describes formulation approach, not a guaranteed outcome | Same as above | Same as above |
| "...treat, cure, or prevent any disease" | `app/terms/page.tsx:121` | None — standard FDA-disclaimer boilerplate, the correct place for this exact language | N/A | None | No action — this is doing its job |

## Summary

**Zero unsupported claims found in production copy.** No instances of "heal,"
"cure," "repairs damaged skin," "reverses aging," "clinically proven,"
"dermatologist approved," "non-toxic," "chemical-free," or "medical-grade"
anywhere in customer-facing code. The two "barrier repair" mentions are
hedged ingredient-literature claims with citation links, not bare product
promises — real risk, but low, and already following the correct pattern
(cite, don't assert).

**Not scanned (per Phase 1's stated limitations):** FAQs (JSON-LD content
embedded in pages was not separately extracted), blog/social copy (none
exists outside `/journal`), paid-ad copy, email copy (no email system is
integrated — see [[chiarel-website-build]]), reviews/testimonials beyond the
new Customer Testing section (audited separately, see
[[CHIAREL Claims Hierarchy V1.0]] for its Tier 3 framing), influencer briefs
(none exist), packaging copy (governed separately by Decision 027, see
`05 Packaging/CHIAREL_Manufacturer_Packaging_Label_Specification_V1.0.md`).

## Cross-reference

The Customer Testing before/after section (`components/ResultsSection.tsx`)
and the new efficacy-tier structure are audited in full in
[[CHIAREL Claims Hierarchy V1.0]] (`07 Marketing/CHIAREL_Claims_Hierarchy_V1.0.md`)
— not duplicated here. That document is the authority on what timeframe
claims the actual formulation can support.
