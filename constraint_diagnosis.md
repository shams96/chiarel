# CHIAREL™ Constraint Diagnosis (Phase 1 — Audit Only)

**Status:** Hypothesis, not a measured conclusion. No analytics integration exists anywhere in this codebase (confirmed by inspection — no GA/GTM/Segment/etc.), so traffic, engagement, and conversion data required by the standard diagnostic table (Awareness vs. Trust vs. Checkout vs. Repeat) do not exist. This diagnosis is inference from the built site and its content, not measurement.

## What was inspected
- Framework: Next.js 14 App Router, TypeScript, Tailwind, Prisma/Postgres (Supabase), Stripe Checkout.
- Full customer-facing route tree: homepage, `/ritual`, `/shop` + `/shop/[slug]`, `/checkout`, `/account`, `/house`, `/science` + subpages, `/journal` + subpages, `/terms`, `/press`, `/contact`, `/assessment`, `/build-your-ritual`, `/founding-100`.
- `data/products.json` (single source of truth for all product data/pricing/images).
- Claims scan across `app/`, `components/`, `data/` for banned/risky terms (heal, cure, treat, repair, regenerate, clinically proven, dermatologist approved, non-toxic, chemical-free, medical-grade, anti-aging, barrier repair, inflammation, eczema, rosacea, acne).
- `npm run build` — confirmed passing.
- Git status and recent commit history.

## Build status
**PASSED** — `npm run build` completes cleanly, all routes compile and prerender.

## Claims audit result (see details below)
No instances of "heal," "cure," "repairs damaged skin," "reverses aging," "clinically proven," "dermatologist approved," "non-toxic," "chemical-free," or "medical-grade" found anywhere in customer-facing copy. Two borderline mentions ("barrier repair") are both hedged as ingredient-literature claims with citation links (e.g., L-Ornithine, PubMed reference), not direct product-efficacy promises — low risk, but flagged for owner awareness, not rewritten without approval (see `claims_audit.md` note below — full audit not run this pass, scoped to a keyword scan only).

## What already exists (trust infrastructure, verified in code this session)
- Functional Stripe checkout, verified end-to-end with a real test payment (webhook confirmed flipping order status).
- 90-Day money-back guarantee, real policy terms defined this session (product-price refund, no return required, first order only).
- Formulator credibility: named pharmacist (Grazia Savoriti, Natural You Srl) with an external, verifiable profile link.
- Every active ingredient/percentage disclosed on PDP pages.
- Free-shipping threshold and cart cross-sell already built.
- Consistent, restrained visual identity (no AI-slop patterns found in the last design audit this session).

## What's verifiably missing (not inferred — confirmed absent by inspection)
1. **Zero third-party social proof anywhere on the site.** No customer reviews, no testimonials, no press mentions beyond a placeholder `/press` page, no UGC. For a brand-new house asking $151–$372 per item/set with no prior reputation, this is the most concrete, unambiguous gap found.
2. **Zero analytics.** No way to measure funnel drop-off at any stage (traffic → engagement → add-to-cart → checkout → repeat). This blocks confirming *any* constraint hypothesis, including the brief's own.
3. **No visible customer support access point** on PDP (per the Phase 3 checklist) beyond `/contact`.

## Primary constraint (hypothesis)
**Proof deficit, not price-trust in the abstract.** The site already does the "tell them why to trust it" work (formulator bio, ingredient disclosure, guarantee) — what it cannot do is show *other people already tried this and it worked*, because that evidence doesn't exist yet (no reviews, no analytics to even know if anyone is stalling pre-purchase). This is narrower than the brief's "trust-adjusted trial" framing: the site isn't failing to *state* trust signals, it's missing the one trust signal (independent social proof) that can't be authored, only earned.

## Confidence level
**Low-medium.** Grounded in a real, verifiable absence (no reviews/analytics exist — checked, not assumed), but with zero traffic or conversion data, this cannot be distinguished from an awareness problem (nobody's reaching the site yet) or a checkout problem (per the diagnostic table, both produce different signatures that only real data can separate).

## Alternative explanations not ruled out
- Awareness/distribution constraint (no traffic yet) — equally plausible, unfalsifiable without analytics.
- Price-value perception specific to a category with no comparable in the customer's mind — the site doesn't currently show category comparisons or "why this vs. drugstore/prestige" framing.

## What data would confirm or reject this
Any analytics integration (even basic pageview + funnel events) for one full sales cycle. Without it, every constraint hypothesis — including this one and the brief's original — stays a guess.

## Recommended first experiment
Not a pricing/discovery-offer A/B test (the brief's suggested experiment) — that assumes traffic and trust are already adequate, which is unverified. **Recommended first step is instrumentation, not a UX experiment**: add minimal funnel analytics before running any test, so the next diagnosis is evidence-based rather than a second hypothesis stacked on the first.
