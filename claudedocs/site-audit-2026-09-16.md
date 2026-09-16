# CHIAREL Site Audit — 2026-09-16

Full-site UX, visual design, content, navigation, and mobile-responsiveness review. Method: read all 28 page routes and 15 shared components in full or by targeted grep, live-tested at 375px/740px/desktop in a real browser against the running dev server, and cross-checked against the site's own established conventions (`lib/motion.ts`, `globals.css` craft-floor rules) and the `ui-ux-pro-max` skill's accessibility/touch/performance checklist.

**Overall read:** this is an unusually well-built site for its stage — real AEO/GEO content strategy, a bespoke restrained motion system, correct `next/image` usage almost everywhere, thoughtful copy discipline (no fabricated claims), and accessibility already considered in most interactive components (`role="radiogroup"`, `aria-label`s, `aria-pressed`, focus outlines). The findings below are refinements on a solid base, not a rescue job — with one exception (P0-1) that's a genuine ship-blocker already flagged in your own code comments.

---

## P0 — Fix before more traffic arrives

### P0-1. Live homepage section still has placeholder data, by the developer's own explicit warning
[`components/ResultsSection.tsx`](../components/ResultsSection.tsx:1) is rendered directly on the homepage (`app/page.tsx` → `<ResultsSection />`, right after the hero) and its own top-of-file comment reads: *"Product/duration fields are TODO pending owner input; do not ship this section live with the TODOs still showing."* It is currently live with `duration: "2 days"` hardcoded for both subjects — an unverified efficacy-adjacent claim sitting on the homepage. This is already tracked in `claims_audit.md` / `CHIAREL_Claims_Hierarchy_V1.0.md`, but the code hasn't caught up to that tracking. **Action: get the real duration/product data from the owner, or pull the section until you have it — don't let a known-placeholder claim stay live.**

### P0-2. Fluid hero headline breaks in the 600–767px range
The homepage hero `<h1>` uses `text-[13vw]` with no override until `md:` (768px). Tested live at 740px width: the headline (`Advancing Cellular Clarity™`) renders at ~96px, nearly edge-to-edge, forcing the CTA and assessment link off the first screen and visibly crowding the layout — this is still single-column stacked mode at that width (the `md:grid-cols-2` side-by-side layout hasn't kicked in yet), so there's no image alongside to balance it. This band (large phones in landscape, small tablets, e.g. iPhone Pro Max landscape, iPad Mini portrait edge cases) is a real, non-trivial slice of mobile traffic. **Action: cap the fluid size with a `clamp()` (e.g. `clamp(2.5rem, 13vw, 4.5rem)`) or add an intermediate `sm:`/`min-[640px]:` step instead of jumping straight to `md:`.**

---

## P1 — High-value fixes

### P1-1. Touch targets below the 44×44px minimum on cart quantity controls
[`components/CartDrawer.tsx:104-117`](../components/CartDrawer.tsx:104) — the qty `−`/`+` buttons are `h-7 w-7` (28×28px), and the "Remove" line-item button has no defined height at all. This is the site's own **CRITICAL**-priority rule (Touch & Interaction, `touch-target-size`) being violated in the one place users adjust an order right before checkout — the highest-friction spot to have a mis-tap. **Action: bump qty buttons to `h-11 w-11` (or keep visual size and add invisible padding/hit-slop), and give "Remove" at least a `py-2` tap area.**

### P1-2. `PurchaseOptions` radiogroup doesn't support arrow-key navigation
[`components/PurchaseOptions.tsx:32-94`](../components/PurchaseOptions.tsx:32) correctly sets `role="radiogroup"`/`role="radio"`/`aria-checked` — but a real ARIA radiogroup implies arrow-key navigation between options (per the ARIA Authoring Practices), which these plain `<button>`s don't implement. A screen reader user gets an interaction model promised by the role that isn't actually there. **Action: either add roving-tabindex + arrow-key handling to match the role, or drop to a plain button group with `aria-pressed` (like `build-your-ritual` already does) if full radiogroup semantics aren't worth the added code.**

### P1-3. No dynamic imports anywhere on the site
`grep -rl "next/dynamic"` returns zero matches across `app/` and `components/`. Every page ships `HeroIntro` (Framer Motion, SVG animation sequence), `CellularHydrationCascade`, `CartDrawer`, and `StickyPurchaseBar` in the initial client bundle even on pages that never show them. This is the site's own **HIGH**-priority `lazy-loading` rule. **Action:** at minimum, `dynamic()`-import `CellularHydrationCascade` (only renders on `/shop/cellular-mist`) and consider deferring `HeroIntro`'s Framer Motion children until after first paint, since the overlay is already deliberately blank on first paint.

### P1-4. Assessment flow has no back/edit step
[`app/assessment/page.tsx`](../app/assessment/page.tsx:19) — `choose()` immediately advances `step` with no way to revisit a prior answer; the only recovery is "Retake the Assessment" from scratch at the end. For a multi-question flow (check `lib/skin-assessment.ts` for exact count) this is real friction against the site's own Forms & Feedback standard (`multi-step-progress`: *"allow back navigation"*). **Action: add a simple back button that decrements `step` and restores the previous answer from `answers` state.**

### P1-5. Homepage is doing a lot of work — 15 sequential centered sections
`app/page.tsx` runs: Hero → Results → Provenance → Evidence table → Full ingredient table → Signature Duo → Formulated By → Backed by Research → Ritual Carousel → Fit Guidance → Comparison table → Founding Pair → Icon Products → FAQ → Philosophy → House note. Individually each section is well-written and the code comments show real effort to vary layout (asymmetric grids, left/right splits) to avoid monotony — but the sheer count means a first-time visitor scrolls through ~15 full-width sections before reaching the footer, most opening with a centered `<Reveal>` heading. This is a content-density/pacing question, not a bug: **worth deciding deliberately** whether all 15 belong on the homepage itself, or whether 4-5 of the more reference-y ones (full ingredient table, category-norm comparison table, backed-by-research citations) would serve better linked from `/science` and summarized here, tightening the path to the first purchase decision.

---

## P2 — Worth doing, lower urgency

### P2-1. LCP image warning in dev console
Console shows: `Image with src "/assets/products/essence-freeze-frame.png" was detected as the Largest Contentful Paint (LCP). Please add the "priority" property` — even though `app/page.tsx:240` already sets `priority` on that image. Worth a quick Lighthouse pass to confirm this isn't costing real LCP time in production (dev-mode warnings can be noisy, but this one names the exact hero image, so it's worth ruling out rather than assuming it's noise).

### P2-2. Header hamburger icon is two bars, not three
[`components/Header.tsx:110-113`](../components/Header.tsx:110) renders only two `<span>` lines for the mobile menu icon. Minor, but it reads as an unfinished icon rather than an intentional minimalist mark — worth a design call either way (confirm intentional, or add the third bar).

### P2-3. "Two complimentary samples" repeated verbatim in three places
Appears in `PurchaseOptions`, `CartDrawer`, and `checkout/page.tsx`. Not wrong, just redundant enough across one purchase flow that a first-time buyer sees it three times before finishing checkout — consider trimming to two mentions (PDP + checkout) since the cart drawer is a mid-flow stop most people pass through quickly.

### P2-4. `/ritual` heading hierarchy has two consecutive `<h2>`s
[`app/ritual/page.tsx:90-91`](../app/ritual/page.tsx:90) — "Beyond the ritual" (h2) is immediately followed by the Lip Concentrate product name (also h2), with no intermediate level. Cosmetically invisible but a screen-reader-navigation nitpick; consider `h3` for the product name since it's a sub-item of that section.

### P2-5. Skiper UI/Aceternity component adoption — separate thread
Per our earlier conversation about pulling in Aceternity UI / Skiper UI components: nothing in this audit changes that recommendation — the taste guidance still applies (pick one signature moment, recolor to brand tokens, don't stack effects). Given `HeroIntro` already *is* the site's one signature moment and it's well-crafted, the better candidates for a borrowed component (if you still want one) are lower-stakes spots: the `RitualCarousel` peek-scroll interaction, or a Bento-style layout for the `/science` complexes list, both recolored to ivory/ochre/champagne. Happy to scope either specifically — say the word.

---

## What's already working well (don't touch)

- **Motion system** (`lib/motion.ts`, `HeroIntro.tsx`): per-product hover physics, `prefers-reduced-motion` respected, transform/opacity-only animations, hover gated to real pointers (`@media(hover:hover)`) so touch doesn't get stuck hover states.
- **Image discipline**: every `<Image>` across the codebase has real `alt` text (verified via grep, zero misses) except the two raw `<img>`s in `ResultsSection` (see P0-1) — and even those have descriptive alt text, just not `next/image`.
- **SEO/AEO/GEO layer**: JSON-LD (`faqJsonLd`, `productJsonLd`, `offerCatalogJsonLd`, `researchArticleJsonLd`, `breadcrumbJsonLd`), per-product fact summaries written for LLM extraction, `llms.txt`, real citation links to PubMed rather than bare claims.
- **Claims discipline**: every efficacy statement is hedged correctly ("studied for," "supports," never "cures"/"eliminates"), actives disclosed with real percentages, comparison table framed generically (no named competitors) — this matches your own brand rules from memory.
- **Founding 100 program page**: real scarcity counter from the database (not fabricated), FTC-compliant disclosure language for the referral/content-rights terms, honest "authenticity not outcome" review language.
- **Checkout**: correct `role="alert"` on errors, disabled-state handling on submit, clear security messaging ("processed by Stripe"), sensible express-payment placeholders (disabled, not hidden, with an honest tooltip on why).
- **Account/subscription preview**: undo-pattern on cancel (6s window), confirm-before-cancel step, clearly labeled as a preview so it can't be mistaken for real account state.

---

## Suggested order of operations

1. **P0-1** — get real duration/product data for `ResultsSection` or pull it; this is a compliance-adjacent issue already flagged by your own team.
2. **P0-2** — clamp the hero headline; five-minute CSS fix, real visible bug.
3. **P1-1** — touch targets in the cart; five-minute fix, protects checkout conversion.
4. **P1-3** — dynamic-import `CellularHydrationCascade` at minimum; easy win, real bundle-size payoff.
5. **P1-2, P1-4** — accessibility/UX flow fixes, schedule for the next iteration pass.
6. **P1-5** — a product/content decision, not a bug — worth a deliberate call on homepage scope rather than an engineering fix.
7. **P2s** — batch into a general polish pass whenever convenient.
