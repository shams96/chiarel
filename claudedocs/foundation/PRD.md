# Product Requirements: chiarel.com

## 1. Purpose

A direct-to-consumer skincare store for CHIAREL™, "The House of Clarity™", formulated in Isola del Liri, Italy with Natural You Srl. The site sells the product line, explains the science behind it, and takes payment. It is subscription-first: the default way to buy is a recurring or prepaid ritual, with one-time purchase available.

## 2. Users

- **Shopper (guest):** browses, builds a ritual, checks out. There are no customer accounts, and checkout is guest-only.
- **Operator (Admin, Member, Viewer):** runs the business through `/admin`. Roles are enforced on the server, not in the interface.
- **Search and answer engines:** the site is built to be read by search and AI answer engines (structured data, `llms.txt`).

## 3. Products

Source of truth: `data/products.json`.

- **Launch lineup (five products):** CHIAREL Essence™ (serum), Terra Radiance Crème™ (AM moisturizer), Recovery Masque™ (PM moisturizer), N1 Neck & Décolleté Renewal Emulsion™ (40 ml bottle), and Eye Contour Concentrate™ (standalone, outside the four-step ritual).
- **Ritual:** AM is Essence then Terra Radiance Crème. PM is Essence, Recovery Masque, then N1.
- **Also available:** Cellular Cleanser™ and Cellular Mist™ (optional preparation), Lip Concentrate, and two sets (The Founding Pair, The Ritual Set).

## 4. Features

| # | Feature | Pages / routes | Status |
| --- | --- | --- | --- |
| F1 | Product catalog and detail pages with gallery, benefits, actives, science links | `/shop`, `/shop/[slug]` | Live |
| F2 | Three purchase modes: 90-day Ritual Plan (one delivery), subscription every 45 days, one-time | PDP purchase box, cart | Live |
| F3 | Cart (drawer and server-backed) with savings line, free-shipping and bonus-sample thresholds | `CartDrawer`, `/api/cart` | Live |
| F4 | Guest checkout via Stripe Checkout with automatic tax, in US, CA, IT, AE | `/checkout`, `/api/checkout` | Live in test mode |
| F5 | Order confirmation page | `/order/[id]` | Live |
| F6 | Stripe webhook reconciles paid orders and records disputes | `/api/webhooks/stripe` | Live |
| F7 | Skin assessment and guided ritual builder | `/assessment`, `/build-your-ritual` | Live |
| F8 | Founding 100 program: signup list, 20% off the 90-day prepay for enrolled products, 25% credit-back ledger | `/founding-100`, `/api/founding-list`, admin credits | Live |
| F9 | Editorial and science content (origin story, ingredient pages, comparison, label reading) | `/journal/*`, `/science/*`, `/house` | Live |
| F10 | Press kit | `/press` | Live |
| F11 | Admin: user management and Founding 100 credit tracking, role-based | `/admin/*`, `/api/admin/*` | Live |
| F12 | Dispute-risk mitigation: consent record at checkout, dispute tracking, rate alert email | webhook, `lib/dispute-*.ts` | Live |
| F13 | Discoverability: structured data, sitemap, robots, `llms.txt` | `lib/seo.ts`, `app/sitemap.ts` | Live |
| F14 | Account page for managing subscriptions | `/account` | **Preview only.** Shows a demo, no real subscription management |
| F15 | Legal and contact | `/terms`, `/privacy`, `/contact` | Live |

## 4a. Business rules (enforced in code)

- Subscription price is `priceSub`, one-time is `priceOneTime`, and the 90-day price is 2x the subscription price (`lib/pricing.ts`). Founding 100 products get 20% off that 90-day total, with 25% of the discounted total credited back later (`lib/founding100.ts`).
- Shipping is a flat $12, free at a $150 subtotal. A bonus sample is flagged on orders at $250 (`app/api/checkout/route.ts`).
- Prices and totals are computed on the server; the client never sets them.
- Enabled countries: United States, Canada, Italy, United Arab Emirates (`lib/countries.ts`). Non-USD amounts are display-only approximations; Stripe charges in USD.

## 5. Requirements that govern content

From `claudedocs/specs/CONSTITUTION.md`: real product photography only (no invented packaging), light visual treatment only, no claims above what is substantiated, honest placeholders stay visible, and no unapproved changes to price, claims or product architecture.

## 6. Out of scope (today)

- Customer accounts and login. Real subscription billing and management (the `/account` page is a preview).
- Order fulfillment tooling, inventory, returns processing. Email receipts to customers beyond Stripe's own.
- Multi-currency charging (display-only conversion today).
- Programmatic dispute evidence submission (Stripe Dashboard remains the response mechanism).

## 7. Open items

- Stripe is in test mode. Going live needs live keys, a Stripe Tax head-office address on the live account, and a live webhook secret.
- EU Cosmetics Regulation Responsible Person for Italy sales needs an answer from Natural You Srl (business-side, not a code change).
- N1 has no owner-approved formula or evidence data yet, so its page shows honest placeholders.
- Subscription management (F14) is waiting on a real billing system.
