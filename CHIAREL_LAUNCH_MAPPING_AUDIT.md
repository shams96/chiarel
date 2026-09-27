# CHIAREL Launch Mapping Audit

Audit date: 2026-09-23. Scope: read-only audit of the production CHIAREL website and its source, mapped to the
planned four-product launch (N1-R, 1A-R, 2A-R, 4A-R). Nothing was implemented or deployed.

Sources inspected:
- **Production source:** `C:\Users\New User\dev\Chiarel brand\chiarel` (git `main` at `b1e0934`, remote
  `github.com/shams96/chiarel`).
- **Live site:** `https://chiarel.com`. All 30 sitemap URLs were fetched, plus robots, `llms.txt` and the
  JSON-LD on each product page.
- **Other CHIAREL codebases found on this machine** (section 1.6).

---

## 0. Headline finding: the brief's "current site" is already out of date

The brief describes the publicly indexed site as of an earlier crawl. The live site and `main` have since moved
most of the way to the planned structure (commits `1bf179d` on 2026-09-18 and `2c38ca4` on 2026-09-21,
"four-product launch with N1"). Verified on the live site today:

| Brief says the current site has | Live and `main` today (verified 2026-09-23) |
|---|---|
| "CHIAREL™ — House of Skin Intelligence™" | **Gone.** Replaced by "The House of Clarity™" (commit `a151a23`, 2026-09-16). Zero occurrences in source or on any live page. |
| A five-step ritual page | **Gone.** `/ritual` is "The CHIAREL Four-Product Ritual": AM Essence → Terra; PM Essence → Masque → N1. The only remaining "five-step" text is in code comments. |
| Press kit with a six-formulation launch lineup | **Gone.** `/press` lists "a focused four-product ritual led by a dedicated neck and décolleté treatment" plus an "Also Available" group. |
| "Clinically Dosed. No Hidden Blends." | "Clinically Dosed" is **gone**. "no hidden blends" remains once on the homepage. "clinically studied ingredients" appears in the homepage research section. |
| Terra Radiance Crème as Icon Product | Still true: badge "Icon of the House", role "Icon Product". |
| The Founding Pair, delivered every 45 days | Still live: `/shop/the-founding-pair`, $347 one-time or $243 every 45 days. |
| The Founding 100 / 90-Day Ritual | Still live: `/founding-100`, built on **Recovery Masque™**, not N1. |
| Advancing Cellular Clarity™, Modern Biological Stress™ | Still live. The first is on every page (footer and metadata); the second is on 6 pages. |
| N1 as a new product | **Already live and purchasable** at `/shop/n1-neck-decollete`: SKU `N1-R`, $138 one-time or $118 every 45 days. |

This report therefore maps the **actual** current state to the target. Most structural work is done, and the
remaining gaps are naming, claims, bundles, the Founding 100, and several launch blockers (section 10).

---

## 1. Repository audit

### 1.1 Framework and commerce platform
- Next.js `^14.2.35` (App Router), React 18, TypeScript, Tailwind 3, framer-motion.
- Output `standalone` for the Hostinger Node.js Web App (`next.config.mjs`). Image optimizer disabled (`images.unoptimized`).
- Commerce is custom: no CMS and no Shopify.
  - **Catalog:** the source of truth is `data/products.json`. It is typed and read by `lib/products.ts`, and seeded into Postgres through Prisma (`prisma/seed.ts` into model `Product`, with `priceSub` and `priceOneTime`).
  - **Cart:** server-side, Prisma `Cart`/`CartItem`, keyed by the httpOnly `chiarel_cart_id` cookie set in `middleware.ts`. `lib/cart-context.tsx` runs the client and `components/CartDrawer.tsx` is the UI. The API is `app/api/cart/*`.
  - **Pricing rule:** `lib/pricing.ts`, with three modes:
    - `oneTime`.
    - `subscription`, every 45 days.
    - `ninetyDay`, the "Ritual Plan", which charges 2 × the subscription price.
  - **Checkout:** `app/api/checkout/route.ts` creates a Stripe Checkout Session with **`mode: "payment"`**, a single charge. Shipping is $12 below $150 and free at $150 and above.
  - **Webhooks and orders:** `app/api/webhooks/stripe/route.ts` handles webhooks, and `/order/[id]` is the confirmation page.
- Other features:
  - Admin with role-based access (`app/admin/*`, `app/api/admin/*`, `lib/auth.ts`).
  - Dispute monitoring (`lib/dispute-*`, started from `instrumentation.ts`).
  - Email through nodemailer (`lib/mail.ts`).
  - Founding list signup (`app/api/founding-list`, Prisma `FoundingSignup`).

### 1.2 Commands (from `package.json`)
| Purpose | Command | Status today |
|---|---|---|
| Dev | `npm run dev` | not run |
| Build | `npm run build`, whose postbuild step runs `scripts/copy-standalone-assets.mjs` | not run (it would write `.next`) |
| Start (production) | `npm start`, which runs `node .next/standalone/server.js` | not run |
| Test | `npm test`, which runs `vitest run` | **Run: 1 file, 8 tests, all passed** (`lib/pricing.test.ts`) |
| Lint | `npm run lint`, which runs `next lint` | not run |
| DB | `npm run db:seed`, `db:migrate`, `db:studio` | not run |

### 1.3 Git status (`main`, level with `origin/main`)
Uncommitted local changes, none made by this audit:
- **Deleted, not staged:**
  - `public/assets/products/essence-freeze-frame.png`
  - `public/assets/products/founding-pair-shore.png`
  - `public/assets/products/lip-concentrate-ivory.png`
  - **Risk:** `data/products.json` still points The Founding Pair and CHIAREL Lip Concentrate at the second and third files. Both still return 200 on the live site today, but a deploy from this working tree would break those images.
- **Untracked:**
  - `Jars productText and artwork/` and its `.zip`
  - `Perlixity_Skincare brand blueprint for November 2026.md`
  - `public/assets/Chiarel product group.avif`
  - `public/assets/recovery-masque-jar1.png`
  - In `public/assets/products/`: `Fiounding 3.jpg`, `New folder/`, `Recovery masque.jpg`, `Residency.png`, `Terra RadianceCream.png`, `chiarel_final_color_identity.png`, and `dimentions 120ML.jpg`, `40ML.jpg` and `50G.jpg`.
- **Branches:** `main`, `feature/luxury-motion-system` (merged), `new-web-design`.
- **Added by this audit:** this report only, untracked and not committed.

### 1.4 Routes, files and components
| Area | Files |
|---|---|
| Homepage | `app/page.tsx`, `components/HeroIntro.tsx`, `components/EvidenceGrid.tsx`, `components/ResultsSection.tsx`, `components/CellularHydrationCascade.tsx`, `components/RitualCarousel.tsx` |
| Navigation | `components/Header.tsx` (primary nav plus the Founding 100 announcement bar), `components/Footer.tsx` (footer nav plus trust strip) |
| Shop | `app/shop/page.tsx` |
| Product page template | `app/shop/[slug]/page.tsx` (all 9 product pages), `components/PurchaseOptions.tsx`, `components/StickyPurchaseBar.tsx`, `components/ProductHeroImage.tsx`, `components/ComingSoonPackshot.tsx`, `components/ProductCard.tsx` |
| Ritual | `app/ritual/page.tsx`, `app/build-your-ritual/page.tsx` (plus `layout.tsx`) |
| Founding Pair | No standalone page. It is the product page `/shop/the-founding-pair` (`/founding-pair` returns 404). It also appears as a homepage section and in the shop's "Existing Sets" group. |
| Founding 100 / 90-Day Ritual | `app/founding-100/page.tsx`. Promoted in the `components/Header.tsx` announcement bar. |
| Press | `app/press/page.tsx` |
| House | `app/house/page.tsx` |
| Science | `app/science/page.tsx`, plus `comparison`, `barrier-resilience`, `lasting-hydration`, `synergy`, `application`, `ectoine`, `bifida-ferment-lysate`, `l-ornithine` |
| Journal | `app/journal/page.tsx`, plus `chiarel-ritual-guide`, `three-skins-one-house`, `isola-del-liri-waterfall`, `reading-a-label` |
| Assessment | `app/assessment/page.tsx`, `lib/skin-assessment.ts` |
| Cart | `components/CartDrawer.tsx` (drawer, no `/cart` route), `app/api/cart/*`, `lib/cart-*.ts` |
| Checkout | `app/checkout/page.tsx` (shows the refund policy), `app/api/checkout/route.ts`, `app/order/[id]/*` |
| Account | `app/account/page.tsx` plus `components/AccountSubscriptions.tsx`. **This is a mock preview**, and the page itself says subscription management "arrives with the CHIAREL™ boutique on Shopify". |
| Policies | `app/privacy/page.tsx`, `app/terms/page.tsx` (includes `components/RefundPolicyContent.tsx`), `app/contact/page.tsx`. There are no `/shipping`, `/returns` or `/refund-policy` routes; all three return 404. |
| SEO | `app/layout.tsx` (default metadata and Organization JSON-LD), `lib/seo.ts` (all JSON-LD builders), `app/sitemap.ts`, `app/robots.ts`, `app/llms.txt/route.ts` |
| Redirects | **None.** Nothing in `next.config.mjs` or `middleware.ts`, and no `redirects()`. |
| Data | `data/products.json`, `lib/products.ts`, `prisma/schema.prisma`, `prisma/seed.ts` |

### 1.5 Asset directories
- `public/assets/products/` holds the live product images:
  - `cellular-cleanser-shore.png`, `cellular-mist-shore.png`
  - `chiarel-essence-jar.png`, `terra-radiance-creme-jar.png`, `recovery-masque-jar.png`, `n1-neck-decollete-jar.png`
  - `lip-concentrate-shore.png`, `lip-concentrate-transparent.png`
  - `ritual-set-shore.png`, `applicator-spatula.png`
  - It also holds the deleted and untracked files listed in 1.3.
- `public/assets/brand/`: wordmarks and monogram (the press kit links to these).

### 1.6 Other CHIAREL codebases on this machine (not production)
| Path | What it is | Risk |
|---|---|---|
| `dev\Accio\Chiarel` | An older "V8.0" Next 15 build with next-intl and a 12-SKU line-up, and uncommitted edits. It has the **same git remote** (`shams96/chiarel`). | A push from here would overwrite production `main` with a stale site. It should be archived or have its remote detached (owner decision). |
| `dev\projects2026\website\chiarel` | A static N1 landing page, product page and bag prototype built in this workspace. **Not deployed.** | It conflicts with production: a placeholder price of $145 against the live $138, "50 g" against "Size to be confirmed", and checkout closed against the live N1 on sale. Treat it as a design reference only. |

### 1.7 Unavailable or blocked
- Stripe dashboard, Hostinger panel and database contents were not accessed. Real order and subscription data are unknown.
- Search Console and index coverage were not accessible. "Indexed" in this report means live and listed in the sitemap.
- `npm run build` and `lint` were not run, to avoid writing build output (the build was last reported passing in `CHIAREL_FOUR_PRODUCT_COMPLETION_REPORT.md`).
- Formula records (INCI) for N1, and confirmation of which formula maps to 1A-R, 2A-R and 4A-R, are not in the repository.

---

## 2. Current product inventory

Prices are one-time, with the 45-day subscription price in brackets. All verified against the live `Offer.price` JSON-LD.

| Current product | Current URL | Current price | Current subtitle/role | Formula/SKU data found | Current bundle/ritual role | Recommended action | Owner decision needed |
|---|---|---:|---|---|---|---|---|
| N1 Neck & Décolleté Renewal Emulsion™ | /shop/n1-neck-decollete | $138 ($118) | "Fragrance-Free Nightly Renewal Emulsion"; role "The Neck & Décolleté Treatment"; launchRole `hero`; Formal Garden #1F5129; family CHIAREL Verde™ | SKU **N1-R** (already matches the plan). **No actives, no complex, size "Size to be confirmed".** | PM step 3 (Essence → Masque → N1). In no bundle. Not in the Founding 100. | Keep | Confirm size, formula and INCI before continuing to sell. Confirm the public name ("N1-R" vs "N1"). The page shows "Customer Tested" and "Every Active Disclosed" badges that are not true for N1 (section 10). |
| CHIAREL Essence™ | /shop/chiarel-essence | $189 ($151) | "Cellular Clarity Concentrate"; "Signature Serum of the House"; launchRole `preparation`; AM/PM | SKU 03; Palmitoyl Pentapeptide-4 3%, Bioactive Ferment Lysate 0.30%; 40 ml; "Cellular Intelligence Complex™"; color token **Peach Dust #FAD6C9**, although photography switched to a red jar (`9d0c66d`) | AM step 1 and PM step 1; Founding Pair; Ritual Set; assessment (pigment and structure) | Requires formula confirmation | Is Essence the 1A-R Peptide Hydration Essence formula? Rename it publicly? Recolor to Red Ochre? |
| Terra Radiance Crème™ | /shop/terra-radiance-creme | $158 ($126) | "Daily Radiance Treatment"; "Icon Product" / "Icon of the House"; launchRole `day-foundation`; AM | SKU 04; Ceramide NP 0.8%, Niacinamide 3.0%; 50 g ("50 g / 1.7 fl. oz.", mixed units); "Dermal Support Complex™"; Red Ochre #9B4722 | AM step 2; Founding Pair; Ritual Set; assessment (sebum) | Requires formula confirmation | Is Terra the 2A-R Barrier Comfort Cream? Rename? Keep the "Icon" status once N1 leads? |
| Recovery Masque™ | /shop/recovery-masque | $148 ($118) | "Overnight Recovery Treatment"; "Night Recovery Hero" / "Night Icon"; launchRole `night-treatment`; PM | SKU **04N**; L-Ornithine 1.0%, Panthenol 2.0%; 50 g; "Contour Renewal Complex™"; Formal Garden #1F5129 | PM step 2; **the only product in the Founding 100 / 90-Day Recovery Ritual** | Requires formula confirmation | Is a masque the right format for 4A-R "Night Renewal Treatment"? Its actives are hydration and soothing, not renewal. If it maps, the Founding 100 product, and possibly its name, change. |
| Cellular Cleanser™ | /shop/cellular-cleanser | $98 ($78) | "Adaptive Purifying Cleanser"; launchStatus `deferred` | SKU 01; BFL 0.30%, Prebiotic Complex 0.3%; 120 ml; Cloud Dancer | "Optional preparation" on /ritual and in the ritual guide; Ritual Set; assessment (reactivity); homepage product matcher | Defer from primary navigation | Keep it purchasable? Keep it in the assessment? |
| Cellular Mist™ | /shop/cellular-mist | $88 ($70) | "Conditioning Preparation Mist"; `deferred` | SKU 02; LMW Hyaluronic Acid 0.3%; 120 ml; Cloud Dancer | Optional preparation; Ritual Set; assessment fallback ("no dominant concern") | Defer from primary navigation | Same as above, and it is the assessment's default result. |
| CHIAREL Lip Concentrate™ | /shop/lip-concentrate | $58 ($46) | "Dual-Action Volumizing & Radiance Lip Treatment"; badge "New"; `deferred` / standalone | SKU 05; **no actives listed**; 5 ml; Peach Dust; image points to a deleted file (1.3) | "Beyond the Ritual" on the homepage, /ritual and /shop | Defer from primary navigation | Keep it for sale? "Volumizing" needs substantiation. The product page shows the "Every Active Disclosed" badge with no actives listed. |
| The Founding Pair (set) | /shop/the-founding-pair | $347 ($243) | "The Signature Serum & The Icon"; launchStatus `legacy` | SET-02, which includes Essence and Terra; image points to a deleted file (1.3) | Homepage section; shop "Existing Sets"; assessment "bundle" upsell | Requires owner decision | Replace with an N1-centred Founding Ritual? Keep, retire, or redirect later? |
| The Ritual Set (set) | /shop/the-ritual-set | $533 ($372) | "The Complete Daily Ritual · Cleanse · Tone · Serum · Moisturize"; `legacy` | SET-01, which includes Cleanser, Mist, Essence and Terra | Shop "Existing Sets" | Archive later | Built on the old four-step routine without N1 or Masque. Retire it, or rebuild it as "Complete Ritual" (Essence, Terra, Masque, N1)? |

Checkout note: every product also offers the "Ritual Plan", a 90-day supply billed as 2 × the subscription price in a single charge.

---

## 3. Current page inventory

| Current page | URL | Purpose | Current messaging | Product references | Keep/change/defer recommendation | SEO/redirect risk |
|---|---|---|---|---|---|---|
| Homepage | / | Brand, N1 hero, ritual, trust | "The Neck & Décolleté Treatment Your Routine Forgot."; Four-Product Ritual; product matcher; active-percentage table; Grazia Savoriti; research links; before/after "Customer testing"; philosophy (Advancing Cellular Clarity™ against Modern Biological Stress™); FAQ; Founding Pair; "Beyond the Ritual" | All 9. Founding Pair priced. Cleanser + Terra matched for reactive barriers. | Change: rename products after the mapping; replace the Founding Pair with the N1 ritual; review the before/after block and research wording (section 4) | Low. The URL stays. FAQ and OfferCatalog JSON-LD must match new names and prices. |
| Shop | /shop | Catalog | "Consumer Collection™"; N1 hero; Day Ritual; Night Ritual; Beyond the Ritual; Existing Sets | All 9 | Change to the future map (section 9): N1, Day, Night, Complete Ritual; deferred products in a secondary group | Low |
| Product pages | /shop/{9 slugs} | Buy | Shared template: trust badges "Customer Tested" and "Every Active Disclosed"; ritual plan; "A House Built on One Rule" | Pairs-with, routine position | Change names and descriptors after the mapping. **Fix the N1 and Lip badge claims.** | **High** if slugs change (section 8) |
| Ritual | /ritual | The AM/PM routine | "The CHIAREL Four-Product Ritual" (AM 2 steps, PM 3 steps) plus optional preparation and Beyond the Ritual | Essence, Terra, Masque, N1 (+ Cleanser, Mist, Lip) | Keep the structure. Rename products after the mapping. | Low |
| Build Your Ritual | /build-your-ritual | Ritual builder | Uses `launchRitualProducts` | 4 launch products | Keep. Rename after the mapping. | Not in the sitemap. Low. |
| Founding Pair | /shop/the-founding-pair (no standalone page) | Legacy bundle | "The essential ritual, in two gestures", every 45 days | Essence, Terra | Requires owner decision: replace with an N1-centred Founding Ritual | Medium. Indexed URL, linked from the homepage and assessment. Needs a redirect if retired. |
| Founding 100 / 90-Day Ritual | /founding-100 | Launch offer | "Half the price. Then none of it." First 100 get the **90-Day Recovery Ritual (2 × Recovery Masque)** at $118 instead of $236, fully refunded after a video and before/after photos. CHIAREL Circle™: next 750, 20% off, 25% credit back. | Recovery Masque only | Change: rebuild around N1 or the N1 ritual; legal review (section 10) | Low (URL can stay). The header bar links to it site-wide. |
| Press | /press | Press kit | Fact sheet; tagline The House of Clarity™; mission "Advancing Cellular Clarity™ … Modern Biological Stress™"; four-product lineup with colors and families; "Also Available" | 4 launch + 3 deferred | Change names and colors after the mapping. Reorder the mission below the N1 promise. | Low |
| House | /house | Brand story | Mission line with both platform phrases; Grazia Savoriti; Natural You Srl; Isola del Liri | Few | Keep. Reorder the platform language later. | Low |
| Science | /science and 8 sub-pages | Ingredient education | Mechanism explainers (BFL, ectoine, L-ornithine, barrier resilience, hydration, synergy, application, comparison) | Essence, Terra, Masque, Mist, Cleanser | Change: claims review of mechanism language; rename products | Medium. Several are indexed. Keep the URLs. |
| Journal | /journal and 3 articles | Content | Isola del Liri, label reading, three skins | Terra, Masque (index) | Keep | Low |
| Ritual guide | /journal/chiarel-ritual-guide | How-to plus FAQ JSON-LD | Four-Product Ritual steps; day vs night texture; Masque application; eye area; FAQ | Essence, Terra, Masque, N1, Cleanser, Mist | Change names after the mapping. Review "reducing overnight transepidermal water loss". | Low (FAQ schema must match) |
| Assessment | /assessment | Quiz → recommendations | Maps concerns to Terra, Cleanser, Essence (×2) and Mist; recommends the Founding Pair for 2+ concerns. **Never recommends N1 or Masque.** | 4 legacy mappings | Change: add N1 and the launch ritual; drop the Founding Pair upsell | Low |
| Cart | Drawer (no route); /api/cart | Bag | Free shipping from $150, extra samples from $250 | Any | Keep | None (not indexed) |
| Checkout handoff | /checkout → Stripe Checkout | Payment | Refund policy shown; `mode: "payment"` | Any | Change: "Subscription · every 45 days" is charged **once**. There is no recurring billing in code (section 7). | Disallowed in robots.txt |
| Order confirmation | /order/[id] | Receipt | Gated on the Stripe session id | Any | Keep | Not indexed |
| Account | /account | Subscription preview | "Preview … No deliveries, pauses, or cancellations shown here are real"; mentions a Shopify boutique | Mock data | Requires owner decision (the Shopify plan vs the current custom stack) | noindex |
| Policies | /privacy, /terms (refund policy inside) | Legal | Footer trust strip: "90-Day Guarantee on your first order", "Every active ingredient disclosed" | none | Change: add shipping and returns pages (the N1 product page links to "shipping & returns" with no real destination) and align the guarantee wording | Not in the sitemap |
| Contact | /contact | Contact | hello@chiarel.com | none | Keep | Not in the sitemap |
| llms.txt | /llms.txt | AI-crawler summary | Lists every product with price, and the Four-Product Ritual | All | Change names after the mapping | Low |

---

## 4. Phrase inventory

Counts are source occurrences; "live pages" lists where the phrase renders on chiarel.com today.

| Phrase | Files/routes where found | Customer role | Keep/rewrite/defer recommendation | Notes |
|---|---|---|---|---|
| House of Skin Intelligence™ | **None.** 0 in source, 0 on any live page. Replaced by "The House of Clarity™" in `a151a23` (2026-09-16). | n/a | Nothing to do on-site | May still sit in search snippets, press coverage or social bios. Check off-site. |
| Advancing Cellular Clarity™ | `app/layout.tsx` (site description), `lib/seo.ts` (Organization JSON-LD), `components/Footer.tsx` (every page), `components/HeroIntro.tsx` (intro), `app/page.tsx`, `app/house/page.tsx`, `app/press/page.tsx`. **Live on all 30 pages checked** through the footer. | Brand mission and platform line | Defer: move it out of the hero intro and footer lockup, and keep it on House, Press and Science after the N1 promise | "Cellular" is flagged by the brief's own risk table ("cellular turnover" implies structure/function). As a trademarked mission line it is lower risk than a product claim, but it sits next to product names ("Cellular Clarity Concentrate", "Cellular Cleanser/Mist"). Needs owner and legal review. |
| Modern Biological Stress™ | `app/page.tsx` (philosophy), `app/house/page.tsx`, `app/press/page.tsx`, `data/products.json` (Terra blurb). Live on home, house, press, ritual, science, and the Terra product page. | Problem framing | Defer: keep on House and Science, remove it from product blurbs (Terra) | A product blurb tying a cream to "biological stress" reads as a physiological claim. |
| Clinically Dosed. No Hidden Blends. | "Clinically Dosed": **none**. "no hidden blends": `app/page.tsx` ("Customer-tested, no hidden blends — every active, stated") and `components/EvidenceGrid.tsx` (comment only). Related: "clinically studied ingredients" in the homepage research section. | Transparency proof | Keep "no hidden blends / every active disclosed" **only after** N1 and Lip publish actives. Rewrite "Customer-tested" until testing exists for each product it covers. | The trust strip and product-page badges say "Every Active Disclosed" on products with no actives listed (N1, Lip). |
| CHIAREL 90-Day Ritual | `app/founding-100/page.tsx` (×3, including metadata), `components/Header.tsx` (announcement bar ×2), `components/PurchaseOptions.tsx` ("the full 90-day ritual" on every product page), `lib/pricing.test.ts`. Live on founding-100, home, and the recovery-masque product page. | Offer and plan name | Rewrite: separate the "Ritual Plan" purchase mode from the Founding 100 offer, and re-base the offer on N1 | Two different "90-day" concepts share one name: the plan mode, and the Masque-only Founding 100 offer. |
| Founding Pair | `data/products.json` (SET-02), `app/page.tsx` (homepage section), `app/shop/[slug]/page.tsx`, `app/assessment/page.tsx` (×2), `lib/skin-assessment.ts`. Live on home, shop and the product page. | Legacy flagship bundle | Requires owner decision: replace with an N1-centred Founding Ritual | Needs a redirect plan if the slug is retired. |
| Five-step ritual | Code comments only (`app/page.tsx` lines 50–51, 320; `app/ritual/page.tsx` line 8). 0 live occurrences. | n/a | Nothing to do | The Ritual Set still sells the old "Cleanse · Tone · Serum · Moisturize" routine. |
| Six-formulation launch | **None** in source or live. Only a comment in `app/page.tsx` line 51, and `lib/skin-assessment.ts` line 170 ("all six" in a comment). | n/a | Nothing to do | Check the off-site press kit PDFs and pitches for the old line-up. |

Other platform phrases found:
- House of Clarity™ appears on every page.
- CHIAREL Intelligence™, Cellular Intelligence Complex™, Dermal Support Complex™, Contour Renewal Complex™, Cascata Complex™ and Terra Shield Complex™ are in the product data.
- "La Bella Figura" is on the homepage.
- Grazia Savoriti and Natural You Srl appear on home, house, the product pages and the JSON-LD author.

**Claims review, from the brief's risk table:**

| Found (file) | Why it is risky | Suggested direction |
|---|---|---|
| "overnight barrier repair" (homepage research block, L-Ornithine) | "Barrier repair" is therapeutic | "helps support the skin's moisture barrier overnight" |
| "Dermal Support Complex™" (Terra) | "Dermal" suggests effects below the surface | Rename the complex |
| "strengthens and supports facial recovery" (Masque blurb) | Implies bodily restoration | "overnight renewal treatment" |
| "reducing overnight transepidermal water loss" (ritual guide) | Needs product-specific testing | Keep only with data |
| "supports the skin's own regulatory processes" (Essence, homepage) | Structure/function claim | "helps refine the appearance of skin texture" |
| "Cellular Clarity Concentrate", "Cellular Cleanser™", "Cellular Mist™", "Cellular Intelligence Complex™" | "Cellular" in product names reads as a mechanism claim | Decide with the renames |
| Before/after "Real subjects, unretouched" (homepage) | Needs a documented study, disclosure, and a representative-results statement | Keep only with study records |
| "Volumizing" (Lip) | Needs substantiation | Review |

**Staged claim profile (from the brief), for later:** immediate softer and cushioned feel; at 24 h, reduced appearance of dryness and dehydration lines; at 2–4 weeks, smoother-looking texture and suppleness; at 6–8 weeks, fine lines and crepey-looking skin **only if demonstrated**. Current N1 copy is already inside the "immediate" and "continued use" language.

---

## 5. Product mapping

| Planned launch product | Proposed current-site mapping | Confidence | Required confirmation | Public naming recommendation | Packaging color | Action required later |
|---|---|---:|---|---|---|---|
| N1-R Neck & Décolleté Renewal Emulsion | `n1-neck-decollete` (SKU **N1-R** already) | High (already live) | Size, final formula and INCI; unisex positioning (current imagery and copy read female-led); the "Customer Tested" and "Every Active Disclosed" badges | Keep "N1 Neck & Décolleté Renewal Emulsion™"; show "N1-R" as the SKU only | "Garden Green **#004B3**" in the brief is **not a valid hex (5 digits)**. The site uses Formal Garden **#1F5129**. Confirm the intended value (e.g. #004B3x). | Fix the badges; publish the size; keep the route |
| 1A-R Peptide Hydration Essence | `chiarel-essence` (SKU 03) | Medium | Is the Palmitoyl Pentapeptide-4 3% + BFL 0.30% formula the 1A-R formula? The name promises "hydration" but the listed actives are peptide and postbiotic, with no humectant disclosed. | Descriptor change, e.g. "CHIAREL Essence™, Peptide Hydration Essence". Keep the brand name to preserve equity and the URL. | Red Ochre #9B4722. The data token says Peach Dust #FAD6C9 while photography already shows a red jar, which needs aligning. | Update data, press and schema. Keep the slug. |
| 2A-R Barrier Comfort Cream | `terra-radiance-creme` (SKU 04) | Medium-High | Ceramide NP 0.8% + Niacinamide 3.0% matches "barrier comfort". Confirm it is the 2A-R formula. | "Terra Radiance Crème™, Barrier Comfort Cream" (keep the name, change the descriptor from "Daily Radiance Treatment") | Red Ochre #9B4722 (matches) | Descriptor, "Icon" status, press, schema. Keep the slug. |
| 4A-R Night Renewal Treatment | `recovery-masque` (SKU 04N) **only if** the formula, format and use match | Low | The format is a "masque" (lentil-sized, 15–30 min film), not a nightly treatment cream. Its actives (L-Ornithine 1.0%, Panthenol 2.0%) support hydration and soothing, not renewal. The planned 4–8 week texture and fine-line claim needs a renewal active and testing. | If the formula differs: a new product and a new route (e.g. `/shop/night-renewal-treatment`), with Recovery Masque deferred. If it maps: rename to "Night Renewal Treatment" and redirect `recovery-masque`. | Garden Green (same hex issue as N1); currently Formal Garden #1F5129 | **Decision needed first.** It drives the Founding 100 as well. |

---

## 6. Deferred-product plan

| Product | Stay accessible? | Stay indexed? | Remove from primary Shop navigation? | Future redirect? | Affects a current bundle or ritual? | Owner decision |
|---|---|---|---|---|---|---|
| Cellular Cleanser™ | Yes (live, purchasable, has subscribers potentially) | Yes, while sold | Yes: move to a secondary "More from the House" group. It is already absent from the header nav, which links to Shop only. | Only if discontinued → `/shop` or a successor | **Yes:** The Ritual Set; "optional preparation" on /ritual and the ritual guide; the assessment "reactivity" result; the homepage product matcher | Keep selling? Keep it in the assessment? |
| Cellular Mist™ | Yes | Yes, while sold | Yes (as above) | Only if discontinued | **Yes:** The Ritual Set; optional preparation; the assessment's **default** result when no concern is detected | Same, plus a new assessment fallback |
| CHIAREL Lip Concentrate™ | Yes | Yes, while sold | Yes | Only if discontinued | No ritual role. It appears in "Beyond the Ritual" (homepage, /ritual, /shop) and in Press "Also Available". Its image file is deleted locally. | Keep? Remove the "New" badge? Publish actives or drop the "Every Active Disclosed" badge on its page? |
| The Ritual Set (SET-01) | Yes, until retired | Yes, while sold | Yes (legacy set) | Yes, if retired → the new Complete Ritual | It *is* the old four-step bundle | Retire, or rebuild as the four-product Complete Ritual |
| The Founding Pair (SET-02) | Yes, until replaced | Yes, while sold | After replacement | Yes → the N1 Founding Ritual | Homepage section and assessment upsell | Replace, and decide the timing |
| Recovery Masque™ (if 4A-R is a new formula) | Yes | Yes | Yes | Only if discontinued | Founding 100 product; PM step 2 | Depends on the 4A-R decision |

None of these may be deleted, unpublished, redirected or renamed in this phase. Nothing was changed.

---

## 7. Ritual and bundle impact

**Current structure, verified live:**
- **Ritual (`/ritual`, ritual guide, homepage, build-your-ritual):**
  - AM: 1 CHIAREL Essence™ → 2 Terra Radiance Crème™.
  - PM: 1 CHIAREL Essence™ → 2 Recovery Masque™ → 3 N1.
  - Optional preparation: Cellular Cleanser™ + Cellular Mist™.
  - Beyond the Ritual: Lip Concentrate™.
  - This already matches the target shape `AM 1A-R → 2A-R` and `PM 1A-R → 4A-R → N1-R`, provided Essence = 1A-R, Terra = 2A-R and Masque = 4A-R.
- **The five-step ritual:** retired from the site. Its product form survives as **The Ritual Set** (Cleanse, Tone, Serum, Moisturize: Cleanser, Mist, Essence, Terra), at $533, or $372 every 45 days.
- **The Founding Pair:** Essence + Terra, $347 one-time or $243 every 45 days, or $486 as the 90-day Ritual Plan. No N1 and no Masque.
- **The Founding 100:**
  - The first 100 members get the "90-Day Recovery Ritual", which is two 45-day shipments of Recovery Masque at 50% off ($118 instead of $236). They get a full refund of the balance after submitting a routine video and before/after photos within 30 days of the second delivery.
  - Next, the **CHIAREL Circle™**: 750 members or six months, 20% off ($189), and 25% credit back ($47) for content.
  - Terms include a perpetual content licence, FTC disclosure, and "provisional program names pending trademark clearance".
- **Subscription and replenishment:**
  - The site sells "every 45 days" and "90-day Ritual Plan" modes. The **code charges a single Stripe payment (`mode: "payment"`)**. There is no Stripe Subscription or recurring price, and no scheduler for a second shipment.
  - The account page is an explicit mock ("No deliveries, pauses, or cancellations shown here are real").
  - Anyone buying "every 45 days" today gets one charge. Fulfilling the second shipment or re-billing would be manual, and the Founding 100 depends on a "second shipment". **Verify in Stripe before launch** (section 10).

**What would need to change later to support `AM 1A-R → 2A-R` and `PM 1A-R → 4A-R → N1-R` (not done):**
1. **Product data:**
   - Descriptor and name changes for Essence, Terra and Masque (or a new 4A-R entry).
   - SKU display for 1A-R, 2A-R and 4A-R (the current SKUs are 03, 04 and 04N).
   - Color tokens: Essence to Red Ochre; confirm the Garden Green hex.
2. **Bundles:**
   - New "Day Ritual" (1A-R + 2A-R), "Night Ritual" (1A-R + 4A-R + N1-R) and "Complete Ritual" (all four) sets.
   - Retire or redirect the Founding Pair and The Ritual Set.
   - Bundle pricing to decide (the brief's ranges are $138–$168 for two products and $178–$228 for three; current single prices are already above those ranges).
3. **Founding offer:** rebase the Founding 100 / Circle on N1 or the N1 ritual, and rename the "90-Day" concept so it is distinct from the Ritual Plan mode.
4. **Assessment:** map concerns to the launch four, add a neck and décolleté question that leads to N1, replace the Founding Pair bundle result, and replace the Cellular Mist default.
5. **Recurring billing:** real Stripe Subscriptions, or an honest "one delivery, reorder reminder" model.
6. **Copy on every surface:** ritual page, ritual guide and its FAQ JSON-LD, homepage, shop, press, llms.txt, product-page "Routine Position" and "Pairs with".

---

## 8. SEO impact

- **Indexed product URLs (in the sitemap, all 200):**
  - `/shop/cellular-cleanser`, `/shop/cellular-mist`, `/shop/chiarel-essence`, `/shop/terra-radiance-creme`, `/shop/recovery-masque`
  - `/shop/lip-concentrate`, `/shop/the-founding-pair`, `/shop/the-ritual-set`, `/shop/n1-neck-decollete`
- **Sitemap (`app/sitemap.ts`, 30 URLs):**
  - 21 static routes:
    - `/`, `/ritual`, `/shop`, `/house`, `/press`, `/assessment`, `/founding-100`
    - `/science` and its 8 sub-pages
    - `/journal` and its 4 articles
  - Plus one entry per product, generated from `products.json`.
  - Every entry uses `lastModified: new Date()`, which marks all pages as changed on every build. That is a weak freshness signal.
  - Not in the sitemap: `/build-your-ritual`, `/contact`, `/privacy`, `/terms`.
- **Robots:** allows all; disallows `/checkout` and `/account`; explicitly allows GPTBot, PerplexityBot, ClaudeBot and Google-Extended.
- **Canonicals:** a relative canonical on every page. `metadataBase` is `https://chiarel.com` and product pages use `/shop/${slug}`. A rename that keeps the slug has no canonical impact.
- **Structured data:**
  - Organization site-wide (the description contains "Advancing Cellular Clarity™").
  - WebPage, Article, FAQPage and OfferCatalog on the homepage. OfferCatalog lists every purchasable product.
  - Product + Offer + Brand + BreadcrumbList on each product page (`productJsonLd` in `lib/seo.ts`).
  - FAQPage on the ritual guide.
  - All of it uses live product names and prices, so renames update the schema automatically. **Risk:** the N1 Product schema publishes a price with no size.
- **Internal links to products** (hard-coded, beyond data-driven cards and nav):
  - `/shop/recovery-masque` ×4, `/shop/n1-neck-decollete` ×4, `/shop/chiarel-essence` ×3, `/shop/the-founding-pair` ×2, `/shop/terra-radiance-creme` ×1, `/shop/the-ritual-set` ×1.
  - These sit across the homepage, assessment, founding-100, ritual, ritual guide, science pages (application, BFL, ectoine, L-ornithine), `EvidenceGrid`, `llms.txt` and `lib/seo.ts`.
  - Header and footer link to `/shop/n1-neck-decollete` on every page.
- **Press links:** `/press` links to `/shop` and to brand SVGs under `/assets/brand/`. It has no product deep links.
- **Journal links:** the ritual guide links to Terra, Masque and N1, and to the assessment. The other three articles have no product links.
- **Redirect requirements if URLs change later** (none exist today; add them in `next.config.mjs` `redirects()` as 301):
  - `/shop/recovery-masque` → the new 4A-R route, *if* renamed with a new slug.
  - `/shop/the-founding-pair` → the N1 Founding Ritual set.
  - `/shop/the-ritual-set` → the Complete Ritual set.
  - `/shop/chiarel-essence` and `/shop/terra-radiance-creme` need no redirect if the recommended "keep slug, change descriptor" approach is used.
  - Any deferred product that is later discontinued → `/shop`, or its closest successor.
  - Update the sitemap, llms.txt, hard-coded internal links and the Stripe product names in the same change.

---

## 9. Proposed future site map (not implemented)

```text
Home                              (N1 category promise first; ritual; proof; House platform last)
Shop
  N1 Neck & Décolleté             /shop/n1-neck-decollete
  Day Ritual                      1A-R Essence → 2A-R Barrier Comfort Cream (set + singles)
  Night Ritual                    1A-R Essence → 4A-R Night Renewal → N1-R (set + singles)
  Complete Ritual                 all four (replaces The Ritual Set; hosts the N1 Founding Ritual)
  More from the House             Cellular Cleanser™, Cellular Mist™, Lip Concentrate™ (secondary, not in nav)
Our Science                       /science + ingredient pages (claims-reviewed)
The House                         /house (Advancing Cellular Clarity™, Modern Biological Stress™, Grazia Savoriti, Natural You Srl, Isola del Liri)
Results & Testing                 new: approved evidence only; per-product status (N1: "testing in progress")
Journal                           /journal + ritual guide
Footer: Press · Founding 100 (N1-based) · Contact · Shipping · Returns · Privacy · Terms
```

Deferred products: they stay live, purchasable and indexed at their current URLs. They are listed only under
"More from the House" on /shop and linked from their product pages, and removed from ritual steps, the assessment
default, bundles and homepage modules. No redirect is needed unless a product is discontinued.

---

## 10. Owner decisions required

1. **Final public product names**, and whether the "1A-R / 2A-R / 4A-R / N1-R" codes appear publicly or only as SKUs.
2. **Formula-to-product mapping.** Confirm with Natural You Srl, in writing, which formula is 1A-R, 2A-R and 4A-R.
3. **Whether Terra Radiance Crème™ becomes 2A-R** (Barrier Comfort Cream), and whether it keeps "Icon of the House".
4. **Whether Recovery Masque™ becomes 4A-R**, given the masque format and hydration/soothing actives, or whether 4A-R is a new product with a new route.
5. **N1 final name, size, price, packaging and route.** N1 is **on sale now at $138 with "Size to be confirmed"** and no disclosed formula. Decide whether to pause purchase until size and INCI exist.
6. **N1 and Lip trust badges.** "Customer Tested" and "Every Active Disclosed" show on every product page (hard-coded in `app/shop/[slug]/page.tsx`), including N1, which has no testing and no actives, and Lip, which has no actives. Approve removing or conditioning them.
7. **Retain or defer** Cellular Cleanser™, Cellular Mist™, Lip Concentrate™ and The Ritual Set: nav placement, assessment role, and bundle membership.
8. **Founding Pair replacement** with an N1-centred Founding Ritual: contents, price and timing.
9. **Founding 100 and CHIAREL Circle revision:** move from Recovery Masque to N1 or the N1 ritual. Also legal review of before/after content incentives, the perpetual licence, FTC disclosure, and the trademark clearance of the program names.
10. **Subscriptions:** "every 45 days" and the 90-day plan are charged once (`mode: "payment"`), and the account page is a mock referencing a future Shopify boutique. Decide on real recurring billing (Stripe Subscriptions or Shopify) vs reorder reminders, and check existing orders for customers expecting a second shipment.
11. **Pricing architecture:** current singles ($138–$189) sit above the brief's comparison ranges (hero $78–$98, cream $68–$88). Also set bundle prices and decide on a discovery set.
12. **Press kit revision:** names, colors, lineup, and any off-site PDFs or pitches still citing the six-formulation line-up or "House of Skin Intelligence".
13. **Claims approval:** every item in the section 4 claims table, the staged claim profile per product, the before/after homepage block, and the "90-Day Guarantee on your first order" wording against the refund policy.
14. **Evidence and testing page approval:** what can be published, and per-product status.
15. **Redirect approval:** the section 8 list, applied only when slugs actually change.
16. **Color-system approval:** confirm the Garden Green hex (#004B3 is invalid; the current value is #1F5129), and recolor Essence from Peach Dust to Red Ochre to match its photography.
17. **Men's product architecture:** N1 is described as unisex, but current imagery and copy are female-led. Decide whether to use shared SKUs with inclusive imagery or separate line extensions.
18. **Repository hygiene:**
    - Restore or replace the three deleted product images before any deploy.
    - Commit or remove the untracked assets.
    - Retire or detach `dev\Accio\Chiarel`, which pushes to the same remote.
    - Treat `projects2026\website\chiarel` as a prototype, not a source.
19. **Shipping and returns pages:** the N1 product page links to "shipping & returns", but no such page exists. The policy lives inside /terms and checkout.

---

## 11. No-change confirmation

```text
NO-CHANGE CONFIRMATION

- Code modified: No
- Content modified: No
- Product data modified: No
- Routes modified: No
- Redirects modified: No
- Prices modified: No
- Claims modified: No
- Deployment performed: No
```

The only file created is this report (untracked, not committed). The unit tests (`vitest run`) were executed
read-only. The pre-existing uncommitted changes in the repository (section 1.3) predate this audit and were left untouched.
