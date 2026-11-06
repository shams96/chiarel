# CHIAREL Site Audit, Luxury Benchmark and Conversion Plan (2026-10-14)

Method: live chiarel.com reviewed on mobile (375) and desktop; page text, structure, scripts, tap targets and
HTML inspected; code read for checkout. Peer comparison (Guerlain, La Mer, Sisley-Paris, Augustinus Bader, Tatcha,
Dr. Barbara Sturm) is from general knowledge of how those brands' public sites are built, not a live measurement, so
treat it as pattern-level, not data. No conversion statistics are quoted because the site has no analytics to
ground them (see Gap 1).

## 1. What is already strong (keep)
- Speed and stability: CLS about 0, LCP under 1.4s on 17 pages, no broken images.
- Radical ingredient transparency (exact percentages on the home page and PDPs). This beats most luxury peers,
  who hide concentrations.
- Named formulator (pharmacist Grazia Savoriti), real provenance (Isola del Liri, Natural You Srl), made-to-order story.
- Subscription-first pricing with honest savings; 90-day guarantee; no fake discounts.
- Technical SEO and AI-search (GEO) foundations: JSON-LD, llms.txt, canonical/OG on all pages.
- Compliance-aware copy ("supports", outcome language, N1 states no testing results yet).

## 2. Gaps, ranked by effect on conversion

| # | Gap | Evidence | Peer standard | Severity |
|---|-----|----------|---------------|----------|
| 1 | **No analytics or tracking at all** | Zero third-party scripts on the home page (no GA4/GTM, Meta pixel, Clarity, Klaviyo, Sentry). | Every peer measures funnel, source and revenue per visitor. | Critical: we are flying blind; every other fix is unmeasurable |
| 2 | **No email/SMS capture** | No email field, newsletter or waitlist anywhere in the HTML. | Peers capture at first visit (sample or ritual-guide offer), then run welcome and abandoned-cart flows. | Critical |
| 3 | **No social proof** | No reviews, ratings, press quotes or UGC on PDPs. Before/after on home are unlabeled testimonials with "complimentary product" disclosure only. | Ratings count, press logos, "as seen in", clinician endorsements. | High |
| 4 | **Checkout advertises 3 payment methods that do not work** | Disabled "Shop Pay / PayPal / Apple Pay: Coming soon" buttons (app/checkout/page.tsx:85-100). Disabled, dashed buttons read as a broken store at the highest-friction moment. | Working Apple Pay/Google Pay one-tap. | High. Fix: Stripe Express Checkout Element (Apple Pay, Google Pay, Link) or remove the buttons |
| 5 | **Mobile first screen** | Hero shows a small bottle and the headline falls below the fold; no primary CTA visible in the first 812px; the scrolling announcement bar truncates ("...PRICE. WE RETURN THE REST. ONLY 100 PLAC"). | Full-bleed image or film, one headline, one CTA in the first viewport. | High |
| 6 | **PDP is text-heavy and image-poor** | Essence PDP: 2 gallery images (one packshot, one flat studio shot), no texture, application, on-skin, scale or video. Price block sits below the fold on phones. No "how to use" (amount, time, order), no full INCI, no shipping/returns summary at the buy button. | 5 to 8 media items incl. texture swatch and application; how-to-use, full ingredient list, delivery and returns at point of purchase; sticky add-to-bag. | High |
| 7 | **Price block is hard to read** | Essence: "$302 Single delivery, every 45 days / $151 / $189 one-time". The three numbers and the 90-day plan are not self-explanatory ($302 total vs $151 per delivery, shown without a clear per-delivery label). | One clear price, then a plain subscribe-and-save toggle with the saving in dollars. | High |
| 8 | **Home page is a long document, not a luxury story** | 955-line page; N1 leads (a new product with no testing results), then ritual, then a dense actives table, a comparison table, FAQ. Science precedes desire. | Emotion first (imagery, ritual, heritage), proof second, detail on demand. | Medium-high |
| 9 | **Photography range** | Flat packshots on grey, plus studio jpgs; no lifestyle, hands, texture, place (Isola del Liri), or film. The Photography Doctrine (70% luxury editorial) is not yet visible on the site. | Rich editorial and motion on every landing page. | Medium-high |
| 10 | **Mobile tap targets** | Footer and in-page links 16 to 21px tall, header "Bag" 30x18px (below the 44px guideline). | 44px minimum. | Medium |
| 11 | **Luxury service layer missing** | No visible free-shipping threshold, gift option, concierge or chat, sample program detail ("Complimentary samples" is stated but unexplained), or consult path. | Shipping threshold, samples, gift-wrap, live advisor. | Medium |
| 12 | **Catalog clarity** | Home calls it a "Four-Product Ritual" while the shop has 10 items; Cleanser and Mist are "optional". Price ladder is high ($189 serum) with little visible justification above the fold. | One clear hero ritual with a visible price rationale. | Medium |
| 13 | **GPTBot blocked at the host** | 429 on all URLs for the GPTBot user agent, though robots.txt allows it. | Allow for AI search visibility. | Medium. hPanel setting, owner action |

## 3. The attached Recovery Masque image
Strong as a mood reference (gold cap, green glass, light), but not usable as-is:
- The jar label reads "Moisturize PM, Overnight recovery that rejuvenates skin": a claim that goes beyond the "supports/optimizes" voice rules and implies an effect claim on the pack; also differs from our real label.
- The setting shows the Faraglioni of Capri. Our story and provenance is Isola del Liri (label says Rome). A Capri backdrop contradicts the origin story.
- It is AI-generated: showing a product that does not match the real jar can mislead customers. Treat as moodboard, or re-shoot or composite the real packshot into a real Isola del Liri / Lazio location.
- 2.4 MB: must be compressed (target under 300 KB) and is a lifestyle image, not a replacement for the transparent 1400x1400 packshot standard.

## 4. Plan

### Phase 0, this week: measure and stop the leaks (code, small)
1. Add privacy-respecting analytics (GA4 or Plausible/PostHog) with consent handling for EU/CA/UAE visitors; track view_item, add_to_cart, begin_checkout, purchase. Add error monitoring (Sentry).
2. Checkout: replace the disabled express buttons with a working Stripe Express Checkout Element (Apple Pay, Google Pay, Link), or remove them if that is deferred.
3. Mobile first screen: headline and CTA above the fold; fix the truncated announcement bar.
4. 44px tap targets for header, footer and inline links.
5. Merge PR #17; owner turns off the GPTBot block in hPanel.

### Phase 1, weeks 2 to 3: capture and convince
6. Email capture (ritual guide or sample offer) plus welcome and abandoned-cart flows (Klaviyo or similar). Needs owner choice of ESP.
7. PDP rebuild: price block with a clear subscribe-and-save toggle, how-to-use, full INCI, delivery and returns at the buy button, ritual pairing, 5+ media slots (texture, application, scale).
8. Social proof: real reviews widget (collect post-purchase), press and clinician quotes only where real; keep "customer tested" disclosures.
9. Home: restructure to emotion first (film or full-bleed hero, ritual, provenance), then proof, then the data tables behind "see the formulation record".

### Phase 2, weeks 3 to 6: luxury feel
10. Photography and film brief aligned to the Photography Doctrine: texture, hands, Isola del Liri / Lazio locations, the real jars. Retake or composite the Recovery Masque image per section 3.
11. Service layer: shipping threshold, gift option, sample program, advisor/consult CTA tied to the Skin Assessment.
12. Re-land Tailwind 4 only after the Hostinger Node version is confirmed (see HANDOFF.md).

### Measurement (set in Phase 0, then review)
Funnel: PDP view to add-to-bag to checkout start to purchase; email capture rate; subscription attach rate; mobile vs desktop split; Core Web Vitals field data. Set targets only after two to four weeks of baseline.

## 5. Decisions needed from the owner
- Analytics and ESP tools (GA4 vs Plausible/PostHog; Klaviyo vs other) and EU/CA/UAE consent approach.
- Whether to enable Stripe Express Checkout now (test mode first).
- Photography: real shoot, composite, or AI moodboard only; which jar images are final.
- Home hero lead: N1 (no test results yet) or the Essence / full ritual.
- Free-shipping threshold and sample program details.
