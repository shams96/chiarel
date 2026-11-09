# CHIAREL Store Enhancement: Spec and Plan (phases 1-2 of spec-driven-development)

Status: DRAFT for owner review. Nothing here is built. Date: 2026-11-07.

## 1. Research: what apple.com/store actually does

Evidence tiers: **verified** = seen in a fetch/search this session; **inferred** = general knowledge of Apple's store, not seen this session.

Limits of the research: `apple.com/store` is JavaScript-rendered. The fetch returned the seasonal shell and the fine print, not the full product tiles. `apple.com/shop/buy-iphone` returned navigation and footnotes only. One Apple configurator URL returned 404. Treat the "inferred" rows as hypotheses to confirm in a real browser before building.

| # | Apple pattern | Tier | Source |
|---|---|---|---|
| A1 | Category-first header nav (Mac, iPad, iPhone, ... Accessories, Support) plus search icon | verified | fetch |
| A2 | Persistent bag icon with live item counter | verified | fetch |
| A3 | Seasonal "gift" hero: one idea, one headline, looping video | verified | fetch |
| A4 | Quick-links strip for returning customers: Find a Store, Order Status, Shopping Help, Returns, Your Saves | verified | fetch |
| A5 | Breadcrumb ("Apple Store Online > Shop iPhone") | verified | fetch |
| A6 | Human help in several forms: Specialist, phone line, Genius Bar, Shopping Help; "Shop with a Specialist" live video (US, 7am-7pm PT) | verified | fetch + [9to5Mac](https://9to5mac.com/2023/03/15/apple-shop-with-a-specialist-over-video/), [AppleInsider](https://appleinsider.com/articles/23/03/14/you-can-buy-your-next-iphone-from-apple-over-a-video-call) |
| A7 | Save favourites, resume where you left off, track order at each step | verified (app) | search, Apple Store app listing |
| A8 | Financing and trade-in surfaced before checkout, with fine print attached | verified | fetch |
| A9 | Delivery promise stated at the point of buying ("see checkout for estimated delivery"; paid fast delivery in some metros) | verified | fetch |
| A10 | Gift cards, accessories, segment stores (education, business) in the footer "Shop and Learn" group | verified | fetch |
| A11 | Certified Refurbished as a trust/value lane | verified | fetch |
| A12 | "Which AirPods are right for you?" side-by-side comparison table on the product page itself | verified (browser, buy page) | browser |
| A13 | Options as equal choices, each with an explicit "No X" option (engraving, coverage); one "Continue" CTA | verified (browser) | browser |
| A14 | "Need a moment? Save this device to Your Saves... pick up right where you left off" inside the buy box | verified (browser) | browser |
| A15 | Per-product "Chat with a Specialist" link at the top of the buy page | verified (browser) | browser |
| A16 | Delivery and returns lines at the very top of the buy page, above the options | verified (browser) | browser |
| A17 | Homepage tiles: one idea, a headline, paired "Learn more" and "Buy" buttons | verified (browser) | browser |
| A18 | /store sections as editorial rails: "The latest", "Personalization", "Holiday picks", with NEW / Only at Apple labels | verified (browser) | browser |
| A19 | "What's in the Box" list and numbered footnotes substantiating every claim | verified (browser) | browser |
| A20 | Free personalisation (engraving) offered as a gift feature and a headline benefit | verified (browser) | browser |

What transfers to a skincare house: Apple's real lesson is **utility under the hero**. The beautiful hero is one idea; everything a returning or hesitant buyer needs (order status, help, returns, saves, delivery promise, a human) is one click away and never buried. Trade-in, financing, carrier deals and refurbished do **not** transfer.

## 2. Where CHIAREL is today (verified from code)

- `/shop`: featured N1 card, then Morning and Evening Ritual product grids (`app/shop/page.tsx`).
- PDP: gallery, buy box (`PurchaseOptions`), sticky purchase bar, accordions, "Complete your regimen" pair add (`app/shop/[slug]/page.tsx`).
- Already built, but not surfaced from `/shop`: skin quiz (`/assessment`), ritual builder (`/build-your-ritual`), account (`/account`), order page (`/order/[id]`), cart, checkout, Founding 100.
- Review slots exist and deliberately render nothing (no fabricated reviews).

## 3. Specify: what and why

**Problem.** `/shop` is a product list. A first-time buyer who is unsure which products to buy has no obvious way in (quiz and builder are hidden), and a returning buyer has no utility strip (order status, help, returns). Trust promises sit in the terms page, not at the point of buying.

**Goal.** `/shop` becomes the House's storefront: one hero idea, a guided path to the right ritual, and visible service, without changing brand voice, claims or pricing.

**Success looks like (testable).**
1. A visitor can reach the quiz or the ritual builder from `/shop` in one click, above the product grids.
2. A returning visitor can reach order status and contact in one click from `/shop`.
3. Returns and delivery promises appear at the buy box, using only owner-approved wording.
4. A product can be saved and found again (signed-in or device-local, see D3).
5. Site search finds the five products and the journal/science pages.
6. No new claim, price, discount, review or shipping time is invented.

**Out of scope.** Trade-in, financing, lease, carrier deals, refurbished, segment stores, live video specialist, discount or promo codes (owner decision: no discounts), repricing, reviews until a real source exists, anything in `components/Footer.tsx` (off-limits without authorisation), new fonts (Libre Bodoni only).

## 4. Owner decisions needed before the affected phase

| ID | Decision | Blocks |
|---|---|---|
| D1 | Approved delivery wording per market (US, CA, IT, AE). Made-to-order means the real lead time is unknown to me. | Phase 2 delivery line |
| D2 | Approved returns wording (what the terms page actually promises) | Phase 2 returns line |
| D3 | Saves: local to the device (no login, fast) or tied to the account (needs sign-in)? | Phase 4 |
| D4 | Human help: contact form and email only, or a booked consultation slot? Who answers, and when? | Phase 3 help module |
| D5 | Gift: a gift note and gift wrapping option, or gift cards? Both need pricing and fulfilment answers. | Phase 5 |
| D6 | Seasonal hero: is there a holiday or launch story for `/shop` right now? | Phase 1 hero copy |

## 5. Plan: phases (each is its own PR, merged only on your "merge N")

**Phase 1: Storefront shell (no new data).** `/shop` gets: a single-idea hero (existing assets only), a "Find your ritual" band linking the quiz and the builder, and a service strip (Order status, Contact, Returns, Shipping), all linking to existing pages. Breadcrumb on `/shop`. Uses existing tokens: ochre headings, ink text `#1d1d1f`, `max-w-container`. Touches `app/shop/page.tsx` and new small components. Risk: low.

**Phase 2: Promise at the buy box.** One compact line under the price on the PDP and in the sticky bar: delivery and returns, in D1/D2 wording, per market. Risk: low once wording exists. Blocked on D1, D2.

**Phase 3: Guided choice.** Make the quiz result land back in the shop (recommended products with add-to-bag), add a "Compare the five" table (step, texture, time of day, size; facts already in `data/products.json`, no efficacy claims), and the help module per D4. Risk: medium (comparison copy must stay inside approved claims).

**Phase 4: Saves and recently viewed.** Heart on product cards and PDP; "Your saves" on `/shop` and `/account`; recently viewed row. Storage per D3. Risk: medium (account tie-in touches auth).

**Phase 5: Search.** Header search over products, journal, science. Static index built at build time; no new service. Footer untouched. Risk: medium (header is shared).

**Phase 6: Gift.** Only after D5. Not planned in detail.

## 6. Constitution checks (this plan against standing rules)

- Claims: nothing that says a product treats or proves an outcome; compare table uses existing product facts only.
- No percentages, no discounts, no new prices, no fabricated reviews.
- Every phase ships with tests (pin the new structure, mutation-checked) and a trail learning.
- Verified in a real browser against the built bundle before "ready".
- Stripe stays in test mode; nothing in this plan touches payment code.

## 6b. Step 2: Apple patterns mapped to the other pages

Browser-verified on apple.com, /store and a buy page (2026-11-07). Verdict: **Use** (as is), **Adapt** (needs owner input or a CHIAREL-specific form), **Skip**.

| CHIAREL page | Pattern (Apple ref) | Verdict | Note |
|---|---|---|---|
| Home | Tile = one idea + paired "Learn more / Buy" (A17) | Adapt | Each product section gets a quiet "Discover" and "Add to bag" pair; no new copy |
| Home, /shop | Editorial rails with honest labels (A18) | Adapt | Labels only when true: "Made to order", "New" for the next launch. Never "Only at" or sale tags |
| /shop | Quick-links strip (A4) | Use | Phase 1 |
| PDP | Delivery + returns lines above the options (A16) | Adapt | Phase 2, wording D1/D2 |
| PDP | "Need a moment? Save for later" in the buy box (A14) | Use | Phase 4, D3 |
| PDP | Product-level human help link (A15) | Adapt | D4: "Ask the House" |
| PDP | On-page comparison "Which is right for you" (A12) | Use | Phase 3, facts only, no efficacy |
| PDP | Options as equal choices with an explicit "No X" (A13) | Use | Matches the existing Ritual Plan vs one-time choice; keep both visually equal |
| PDP | "What's in the box" (A19) | Adapt | Needs the real unboxing contents; the Masque's spatula is known, the rest is not |
| PDP, Science | Numbered footnotes substantiating claims (A19) | Use | Strong fit with the claims discipline: each science statement gets a visible source note |
| PDP, Cart | Free personalisation as a gift feature (A20) | Adapt | D5: a gift note, not engraving; needs fulfilment answer |
| /ritual | Compare table of the AM/PM steps (A12) | Use | Same data as Phase 3 |
| /build-your-ritual, /assessment | Surface from the shop top (A6) | Use | Already built; Phase 1 links them |
| Cart | Persistent bag counter (A2) | Verify | Confirm it exists on every page including phone width |
| Cart, Checkout | Delivery and returns reassurance near the pay button (A9, A16) | Adapt | Same wording as Phase 2 |
| Account | "Your Saves" and order status in one place (A4, A7) | Use | Phase 4 |
| Contact, FAQ | One "Shopping Help" hub: orders, shipping, returns, contact (A4, A6) | Use | New page that only links existing policy text |
| Footer | Shop-and-learn grouping (A10) | Skip | Footer is off-limits without your authorisation |
| All | Financing, lease, trade-in, carrier deals, education and group stores, refurbished, AppleCare-style add-ons, free-trial bundles, "free extended returns" promo | Skip | Do not fit a skincare house, or conflict with the no-discount rule |

## 7. Recommended order

1 → (answer D1, D2) → 2 → 3 → (answer D3) → 4 → 5. Phase 1 can start now with no decisions except D6, which can default to "no seasonal story".
