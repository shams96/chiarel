# CHIAREL Commerce Audit: cart, checkout, payments, orders, subscriptions, accounts

Branch `feat/checkout-redesign` (from origin/main). Read-only audit, 2026-11-04. Stripe is in TEST mode.

Evidence tags: **[V]** verified (I read the code, or ran the test file), **[I]** inferred from code but not executed, **[U]** unknown (needs runtime, Stripe dashboard, or hosting access).

Test run [V]: `vitest run tests/checkout.test.ts tests/stripe-webhook.test.ts tests/cart.test.ts tests/cart-page.test.ts tests/checkout-form-a11y.test.ts` gave 5 files, 78 tests, all passing. Those tests mock `db` and `stripe` (e.g. `tests/checkout.test.ts:20-38`), so they prove route logic, not real Stripe or DB behaviour.

---

## 1. Existing architecture

**Stack [V]:** Next.js 15 App Router, Prisma/Postgres, `stripe` SDK, `nodemailer` over Hostinger SMTP, GA4 via gtag (consent-gated). Single Node process on Hostinger (`lib/rate-limit.ts:1-8`).

**Payment model [V]:** Hosted Stripe Checkout, `mode: "payment"` for every order (`app/api/checkout/route.ts:197-206`). Line items use inline `price_data` (no Stripe Product/Price objects), `payment_method_types: ["card"]`, `automatic_tax` with a silent fallback to no tax (`route.ts:195-232`). Currency is hard-coded `"usd"` (`route.ts:138`).

**Cart state [V]:** Server-side, in Postgres. `Cart` and `CartItem` tables (`prisma/schema.prisma`), identified by an httpOnly cookie `chiarel_cart_id` (UUID, 90 days) minted by `middleware.ts:197-201` only on the first `POST /api/cart`. Unique `(cartId, productSlug)`, so **one line per product**; the mode (`ninetyDay | subscription | oneTime`) is a column on that line. Client state is a React context (`lib/cart-context.tsx`) mirroring the server, with optimistic updates (`lib/cart-math.ts`) and a serial request queue (`lib/cart-ops.ts`). Stale carts are pruned daily (`lib/cart-prune.ts`).

**Price sources [V]:** Two. (a) Server charges from `Product.priceSub/priceOneTime` in the **database** (`lib/cart-server.ts:241`, via `computeUnitPrice` in `lib/pricing.ts`). (b) The client shows and optimistically computes from `data/products.json` (`lib/cart-math.ts`, `components/CartPageContent.tsx:249`, PDP props). The DB row is only created from JSON on first add (`lib/ensure-catalog-row.ts:8-10`, "never touches an existing row") or by `prisma/seed.ts`. No runtime check that the two agree.

**Pricing rule [V]:** 90-day = 2 x subscription price; subscription = `priceSub`; one-time = `priceOneTime`. Shipping is constant 0 (`lib/shipping.ts`). No discount codes. Tax left to Stripe. Catalog: 5 priced products (`data/products.json`, e.g. 151/189, 126/158, 118/148, 118/138, 151/189 sub/one-time).

**Orders [V]:** `Order` + `OrderItem`. `Order.status` is only ever `pending` or `paid` (no failed, expired, cancelled, refunded). Separate `fulfilmentStatus` (unfulfilled/packed/shipped/delivered/cancelled) driven from admin. Dispute fields filled by the webhook.

**Accounts [V]:** Passwordless `Customer` (6-digit emailed code, or Google), own cookie `chiarel_session` and HMAC secret (`lib/customer-session.ts`). Guest orders back-filled to a customer by exact lower-cased email at sign-in (`lib/customer-auth.ts:38-42`).

**Email [V]:** `lib/mail.ts` (Hostinger SMTP). Used for sign-in codes (`lib/customer-auth.ts:78-93`), the dispute-rate alert (`lib/dispute-alert-scheduler.ts`), and `/api/subscribe`. **No order-confirmation, shipping, or subscription email is sent by this codebase.**

**CI [V]:** `.github/workflows/ci.yml`: tsc, lint, vitest, build, smoke vs throwaway Postgres.

---

## 2. Current customer journey (step by step, with files)

1. **Browse / PDP.** `components/PurchaseOptions.tsx`: three tiers; default is the 90-day plan (`:242`); CTA "Begin the Ritual" for plan tiers, "Add to Bag" for one-time (`:403`). Click calls `useCart().add(slug, mode)` (`:400`).
2. **Add.** `lib/cart-context.tsx:111-142` -> `POST /api/cart` (`app/api/cart/route.ts:472`). Validates slug in JSON catalog and mode in the three values; ensures DB row; create/update `CartItem`. Same slug + same mode = qty +1 (cap 10); same slug + different mode = mode switch, qty kept (`route.ts:501-512`). Server returns recomputed totals. `add_to_cart` fires; drawer opens.
3. **Sticky bar (PDP).** `components/StickyPurchaseBar.tsx:563-567` always adds `"subscription"`, ignoring the tier selected above.
4. **Drawer.** `components/CartDrawer.tsx`: qty +/-, Remove, "Complete the Ritual" upsell (adds next product as subscription, `:161`), totals, links to `/cart` and `/checkout`. No plan switcher in the drawer.
5. **Bag page.** `app/cart/page.tsx` -> `components/CartPageContent.tsx`: plan `<select>` per line (`:255-265`), qty stepper, Remove, summary, Checkout link.
6. **Checkout form.** `app/checkout/page.tsx`: email, name, country (US/CA/IT/AE), address, city, state (if required), postal code, refund-policy `<details>`, required terms checkbox. `begin_checkout` fires once (`:44-59`). Totals shown mirror server numbers.
7. **Order creation.** `POST /api/checkout` (`route.ts:34`): IP rate limit (20 per 10 min), field validation, terms check, **recomputes cart from DB** (`:86`), writes a `pending` Order with `termsAcceptedAt/termsVersion` (`:97-124`), finds or creates a Stripe Customer, creates the Checkout Session with `metadata.orderId`, stores `stripeSessionId`, returns `checkoutUrl`. Client navigates (`checkout/page.tsx:92`).
8. **Stripe hosted page.** Card entry. Cancel returns to `/checkout` (`route.ts:204`).
9. **Success redirect.** `/order/[id]?session_id=cs_...` (`app/order/[id]/page.tsx`). Loads order; requires `session_id === order.stripeSessionId` else 404 (`:47`); if still `pending`, `stripe.checkout.sessions.retrieve` and, if `payment_status === "paid"`, sets `status: "paid"` and **clears the visitor's cart** (`:52-63`). Renders confirmation, fires `purchase` once (localStorage dedupe), offers account creation to signed-out users.
10. **Webhook (parallel).** `POST /api/webhooks/stripe`: verifies signature; on `checkout.session.completed` + `payment_status === "paid"` flips `pending -> paid` and stores `stripePaymentIntentId`. Also records `charge.dispute.created/closed`.
11. **Account.** `/account` lists the customer's non-pending orders (`app/account/page.tsx:272-276`). "Reorder" is a PDP link. "Subscription Care" is a static mailto block.
12. **Fulfilment.** Admin console updates fulfilment/tracking; **no customer email is generated** (`claudedocs/runbooks/admin-orders.md:36`).

---

## 3. Existing functionality (what genuinely works)

| Capability | Evidence | Tag |
|---|---|---|
| Server recomputes line prices, subtotal, savings from DB; client price ignored | `cart-server.ts:221-269`; `checkout/route.ts:86-92,136-147`; `tests/cart.test.ts:118`, `tests/checkout.test.ts:191` | V |
| Cart ownership check on PATCH/DELETE | `app/api/cart/[itemId]/route.ts:530-535`; `tests/cart.test.ts:231,238` | V |
| Qty bounds 1..10 server-side | `[itemId]/route.ts:558`; `cart/route.ts:510` | V |
| Removed catalog products dropped from bag and checkout | `cart-server.ts:228` | V |
| Webhook signature verification on raw body | `webhooks/stripe/route.ts:272-280`; `tests/stripe-webhook.test.ts:62-89` | V |
| Webhook idempotent paid transition (`updateMany ... status:"pending"`) | `route.ts:293-300`; test `:101` | V |
| Webhook returns 500 on DB failure so Stripe retries | `route.ts:301-308` | V |
| Order page requires matching Stripe `session_id` (not just order id) | `order/[id]/page.tsx:47` | V |
| Paid state on success page verified with Stripe, not trusted from redirect | `order/[id]/page.tsx:53-54` | V |
| Server-enforced terms acceptance, timestamp and version stored | `checkout/route.ts:79-84,112-113` | V |
| Open-redirect protection on Stripe return URLs | `lib/site-origin.ts` | V |
| Account order history scoped to signed-in `customerId` | `account/page.tsx:272-274` | V |
| Passwordless login, layered rate limits, hashed codes | `api/account/code/*`; `tests/customer-accounts.test.ts` | V |
| GA4 funnel events, consent-gated, purchase deduped per order | `lib/analytics.ts` | V |
| Dispute capture + daily dispute-rate monitor | `webhooks/stripe/route.ts:317-346` | V |
| Form labels bound to inputs with autocomplete tokens | `checkout/page.tsx:22-31`; `tests/checkout-form-a11y.test.ts` | V |
| Drawer is a labelled modal dialog with focus handling | `CartDrawer.tsx:38-43`; `lib/use-dialog.ts` | V markup / I behaviour |

---

## 4. Broken or incomplete functionality (severity-ranked)

**HIGH**

1. **Subscriptions are not recurring billing. [V]** Every mode, including `subscription`, is charged once via `mode: "payment"` (`checkout/route.ts:197`). No Stripe subscription mode, no Price/Product objects, no `recurring`, no re-billing scheduler (grep of `app/` and `lib/` found nothing). The UI says "Renews every 45 days" (`PurchaseOptions.tsx:334`), "Subscription items renew and ship every 45 days ... until paused or cancelled" (`checkout/page.tsx:205-209`), and the home FAQ says "recurring delivery every 45 days" (`app/page.tsx:86`). `/terms` is more candid ("Self-service subscription management ... is being built", `terms/page.tsx:48-58`) and `claudedocs/foundation/PRD.md:54,64` + `IMPLEMENTATION_PLAN.md:33` say real billing is not built. Consequence: a "Subscribe & save" customer pays once at the subscription price; nothing renews unless an operator bills manually (whether any manual process exists: [U]).
2. **No skip / pause / cancel / change-address / change-frequency. [V]** `/account` has a static mailto only (`account/page.tsx:229-249`). No Subscription model exists in `schema.prisma`.
3. **No order-confirmation email, though page and terms promise one. [V]** Page: "a receipt has been sent to {email}" (`order/[id]/page.tsx:93`); terms: "you will receive an email receipt" (`terms/page.tsx:40-41`). Code sends none. Only Stripe's own receipt could, depending on dashboard settings; no `receipt_email` is passed (`route.ts:179-183,197-206`). Stripe does not send receipts in test mode. Live behaviour [U]. No shipping/tracking email either.
4. **Success page can mark an order paid without recording the PaymentIntent. [V]** The page's update is `data: { status: "paid" }` only (`order/[id]/page.tsx:55-59`). The webhook writes `stripePaymentIntentId` only if the order is still `pending` (`webhooks/stripe/route.ts:293-300`). If the redirect wins the race (the usual case), the webhook matches zero rows and the id is never stored. Dispute matching keys on that id (`:325-326`), so disputes on those orders silently fail to attach (`updateMany` returns count 0, no log). Frequency in prod [U].
5. **Abandoned / failed / expired payments never reconciled. [V]** Only `checkout.session.completed` and dispute events are handled. No `checkout.session.expired`, `payment_intent.payment_failed`, `charge.refunded`, `async_payment_*` (`webhooks/stripe/route.ts:282,317`). Every checkout click leaves a `pending` Order with PII forever; nothing purges them (`cart-prune.ts` prunes carts only). The unpaid confirmation message links to `/` (`order/[id]/page.tsx:99-100`).
6. **No refund state or flow. [V]** No `charge.refunded` handler, no refunded status; refunds happen only in the Stripe Dashboard and are invisible in app/admin/account. The 90-day guarantee has no system support.

**MEDIUM**

7. **Order total excludes tax but is labelled "Total". [V]** `Order.total = subtotal + shipping` (`checkout/route.ts:92`); Stripe adds tax at payment. Order page, account, and GA4 `purchase.value` use `order.total` (`order/[id]/page.tsx:77,145`; `account/page.tsx:303`). Stripe `amount_total`/tax are never stored.
8. **Silent no-tax fallback. [V]** On Stripe's "head office address" error the route logs and retries without tax (`route.ts:214-232`). Which branch prod takes is [U]. No alert.
9. **No amount/currency reconciliation. [V]** Neither webhook nor page compares `session.amount_total`/`currency` with `order.total`.
10. **Charged in USD for CA/IT/AE. [V]** Approximate local amount shown (`checkout/page.tsx:309-313`, static FX in `lib/countries.ts`). FX-fee and EU price-presentation risk [I].
11. **Signed-in checkout does not link the order to the customer. [V]** `checkout/route.ts` never reads the customer session; `customerId` is set only at the next sign-in by email match (`customer-auth.ts:38-42`; runbook `customer-login.md:51`). No prefill.
12. **One line per product. [V]** `@@unique([cartId, productSlug])`; adding another mode silently switches the existing line (`cart/route.ts:501-512`) with no notice.
13. **Founding 100 credit and bonus sample never written. [V]** `tests/checkout.test.ts:200` asserts no founders credit; nothing outside admin sets `founding100Credit`; `bonusSample` is never set (schema comment cites removed `EXTRA_SAMPLE_THRESHOLD`). Dead fields and admin screen.
14. **No inventory/stock check. [V]** Only the 10-per-line cap.
15. **Cart cleared by page view, not payment event. [V]** Deletion happens only inside the order page render (`order/[id]/page.tsx:60-61`). Pay-then-close-tab leaves the cart intact and re-checkout-able (duplicate order). `getOrCreateCart()` there also creates an orphan cart if the cookie is absent (`cart-server.ts:197-199`).

**LOW**

16. **Dead/placeholder controls.** No express-pay buttons exist in code [V: grep for Apple Pay / Google Pay / Shop Pay / PayPal / express across `app components lib tests` and foundation/runbook docs returned nothing]. Oddities: unexplained "Key ingredients named" line in the drawer (`CartDrawer.tsx:192-194`); empty `<div className="pt-4">` (`CartPageContent.tsx:380-381`); account "Reorder" only links to PDP; no customer order-detail page.
17. **Raw field names in validation errors** (`checkout/route.ts:56` -> printed verbatim, `checkout/page.tsx:88,241`).
18. **Pending-order spam surface:** see S4.

---

## 5. Design inconsistencies

- **Sticky bar vs PDP.** PDP defaults to the 90-day plan and labels CTA by tier; sticky bar always adds a subscription and says "Add to Bag" (`StickyPurchaseBar.tsx:560-567`).
- **CTA vocabulary.** "Begin the Ritual", "Add to Bag", "Subscribe . $X" (drawer), "Checkout - $X", "Continue to Payment - $X", heading "Complete your order": six phrasings for one funnel.
- **Plan naming.** "90-day plan" (cart, checkout), "The 90-Day Plan" (PDP), "Ritual Plan" (code comments, `pricing.ts`), "Ritual savings" (totals), "Subscribe & save" vs "Subscription"; the PDP's internal tier `single` means subscription (`PurchaseOptions.tsx:218`).
- **Plan control differs per surface:** select on bag page, radiogroup on PDP, none in drawer.
- **Tier order vs default:** list order Subscribe, 90-Day, One-time; default selection 90-Day (`:242,250`).
- **Totals label:** "Estimated total" (drawer, bag), "Total" (checkout, order page, which omits tax).
- **Duplicated chrome:** mode-label maps re-declared in CartDrawer, checkout page, order page, checkout route, CartPageContent.
- **Qty control size:** drawer `h-7 w-7` with a `tap-area` helper vs bag `h-11 w-11` (`CartDrawer.tsx:101`, `CartPageContent.tsx:283`).
- **Subscription copy tone:** checkout says "No commitment"; terms says management is "being built".

---

## 6. Conversion problems

1. Card-only, no express-pay buttons in code; wallets inside hosted Checkout [U].
2. Shipping address collected on-site, but `shipping_address_collection` is not set, so the Stripe session/receipt carries no shipping address (only the Customer record and our Order) [V `route.ts:159-183,197-206`].
3. On mobile the order summary `<aside>` follows the whole form in DOM order (`checkout/page.tsx:126,261`); total is only repeated in the CTA (`:251`) [I].
4. No sign-in/prefill/guest fork until after purchase (`SaveRitual`).
5. No abandoned-checkout recovery (no email infra for it).
6. Subscription value is "cheaper single delivery"; the 90-day plan saves only by doubling the subscription price. If real recurring billing is built, the pricing story must be restated.
7. Terms link in the checkbox label navigates away mid-form (`checkout/page.tsx:233`, no `target`) and could lose typed fields [I]; policy text is already inline.
8. No edit-bag link or returns reassurance beside the pay button at checkout.
9. Drawer upsell adds a subscription by default (`CartDrawer.tsx:161`).
10. Unpaid confirmation sends the user to `/`, not to contact or retry.

---

## 7. Technical debt

- **Two sources of truth for price** (JSON vs DB), reconciled by a hand-run seed [V]. `ensureCatalogRow` never updates an existing row, so a JSON price edit shows on PDP while the server charges the old DB price until reseeded. The bag corrects to the server's number after each server response (`cart-ops.ts`).
- **Stale/contradictory code:** schema comment cites `EXTRA_SAMPLE_THRESHOLD`; `lib/mail.ts:10` says confirmation email "later"; checkout route imports unused `getOrCreateCart`, `getProductOrThrow`.
- **Whole-dollar integer money** (`Order.total Int`, `unitPrice Int`) and hard-coded `"USD"`/`$`; no cents, no tax breakdown possible without a schema change.
- **Free-string enums** for `status`, `fulfilmentStatus`, `mode` [V].
- **No Stripe idempotency keys, no Product/Price objects, no `client_reference_id`** [V].
- **Side effects in a GET render** (marks paid, deletes cart items) duplicating webhook logic with different fields [V].
- **In-memory rate limiter**, per process, resets on restart [V].
- **No integration/e2e tests** (no Playwright in `package.json`); no test touches `app/order/[id]/page.tsx` (grep of `tests/` found none). Checkout/webhook tests mock Stripe and DB.
- `useCart().refresh()` is documented for post-checkout cart sync but the confirmation page never calls it, so header/drawer may show a stale bag until the next fetch [I].
- Local `tsc` fails on `oauth4webapi` (environmental, not audited).

---

## 8. Security concerns (severity-ranked, with exploit scenario)

**S1. MEDIUM. Disputes can fail to attach to orders** (Broken #4). No attacker needed: customer pays, redirect page sets `paid` with no PaymentIntent id, webhook becomes a no-op; a later chargeback matches no order, and the dispute monitor (`lib/dispute-monitoring.ts`) undercounts. Fix: one shared mark-paid function storing `payment_intent`.

**S2. MEDIUM. Price drift JSON vs DB can charge a price the shopper did not see** [V mechanism, U whether prod differs]. Owner edits `products.json`, deploys, forgets to reseed prod: PDP shows new price, Stripe charges the old one. Mostly a trust/consumer-law risk; terms reserve the right to correct pricing errors (`terms/page.tsx:30-33`).

**S3. MEDIUM. No amount/currency/tax reconciliation** (Broken #7-9). Amounts are server-derived today, so this is a defence-in-depth gap rather than an open exploit.

**S4. MEDIUM-LOW. Unauthenticated order-row and Stripe-API amplification.** `POST /api/checkout` needs only a non-empty cart (anyone can create one; cart add is 60/min/IP, `cart/route.ts:475`) and is limited to 20 per 10 min per IP (`checkout/route.ts:17-18,35`). Each call writes a `pending` Order with caller-chosen PII, calls `stripe.customers.list`, may create a Stripe Customer, and creates a Session. Scenario: a script cycling IPs (or ~2,880 calls/day from one IP) fills `Order` and the Stripe customer list with junk; nothing deletes them. The limiter keys on the **rightmost** `X-Forwarded-For` (`rate-limit.ts:143-147`): correct if the proxy appends; if requests can reach Node without a trusted proxy, an attacker controls that value and the limit is defeated [U, depends on Hostinger topology].

**S5. LOW-MEDIUM. Order confirmation URL is a bearer capability.** `/order/[id]?session_id=...` shows name, email, postal data and items to anyone holding both values (`order/[id]/page.tsx:47`). `cs_` ids are unguessable and the page is `noindex`; Referrer-Policy is `strict-origin-when-cross-origin` (`middleware.ts:212`), so the query string does not leak cross-site. Risks: browser history, shared screens, URL-logging tools; no expiry, no rate limit. **Customer A cannot read customer B's order** without B's `session_id` [V]; `/account` is scoped to `customerId` [V].

**S6. LOW. Visitor-typed email trust.** Anyone can place an order with another person's email; after that person signs in, the order is attached to their account (`customer-auth.ts:38-42`) and appears in `/account` (items and total; address not rendered). Minimal exposure.

**S7. LOW. No `rejectCrossSite` guard on checkout/cart routes** (used only on account routes, `lib/request-guard.ts`). `req.json()` parses any content type (`checkout/route.ts:42`), but the cart cookie is `SameSite=Lax` and not sent on cross-site POST, so not practically exploitable [I].

**S8. LOW. Webhook** fails closed when `STRIPE_WEBHOOK_SECRET` is unset (500, `route.ts:264-267`); handlers are idempotent so replays are harmless [V]. Whether the prod endpoint is registered with the right events [U].

**S9. LOW. CSP allows `'unsafe-inline'` scripts** (`middleware.ts:229`) for JSON-LD; nonce-based CSP is future work.

**S10. Not found [V].** Client-supplied prices are never trusted; cart routes use explicit fields (no mass assignment); the only raw SQL with user input is parameterised; no secret values appear in this audit (names only below).

---

## 9. Integration dependencies and env vars required (names only)

- **Stripe:** `STRIPE_SECRET_KEY` (module throws at import if unset, `lib/stripe.ts:3`), `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (listed in `.env.example`; no code reference found [V], effectively unused). Dashboard side [U]: webhook endpoint subscribed to `checkout.session.completed`, `charge.dispute.created`, `charge.dispute.closed`; Stripe Tax head-office address and registrations; receipt-email setting; wallet settings.
- **Database:** `DATABASE_URL`, `DIRECT_URL`.
- **Sessions/auth:** `ADMIN_SESSION_SECRET`, `CUSTOMER_SESSION_SECRET` (falls back to a key derived from the admin secret), `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `OAUTH_STATE_SECRET`, `OAUTH_REDIRECT_ORIGIN`, `SOCIAL_LOGIN_ENABLED`.
- **Mail (Hostinger SMTP):** `HOSTINGER_SMTP_HOST`, `HOSTINGER_SMTP_PORT`, `HOSTINGER_SMTP_USER`, `HOSTINGER_SMTP_PASS`, `ACCOUNTS_SMTP_USER`, `ACCOUNTS_SMTP_PASS` (or `ACCOUNTS_SMTP_PASSWORD`), `DISPUTE_ALERT_EMAIL`.
- **Marketing/analytics:** `NEXT_PUBLIC_GA_MEASUREMENT_ID`, `NEXT_PUBLIC_EMAIL_SIGNUP`, `KLAVIYO_PRIVATE_KEY`, `KLAVIYO_LIST_ID`, `UNSUBSCRIBE_SECRET`, `FOUNDING_LIST_WEBHOOK_URL`.
- **Runtime:** `APP_ENV`, `NODE_ENV`, `NEXT_RUNTIME`, `TOKIO_WORKER_THREADS`.
- **Static data:** `data/products.json`, seeded `Product` rows, `lib/countries.ts` (static FX), `lib/seo.ts` (`SITE_URL`, `ORDERS_EMAIL`).

---

## 10. Recommended improvements

**P0. Make the stated product true, or restate it.**
1. Decide subscription truth: (a) implement real recurring billing (Stripe Subscriptions or a billing job; Price objects, a `Subscription` model, portal or in-app skip/pause/cancel, dunning emails), or (b) relabel honestly (reminders / reorder cadence) until built. Three surfaces promise renewal today.
2. Send an order-confirmation email from the server on the first `pending -> paid` transition (one code path shared by webhook and page, gated by the update count), and a shipping/tracking email from the admin fulfilment action. Until then, drop "a receipt has been sent" from the order page.
3. Fix the PaymentIntent race: one shared `markOrderPaid` storing `payment_intent`, `amount_total`, tax, currency.

**P1. Payment robustness.**
4. Handle `checkout.session.expired`, `payment_intent.payment_failed`, `charge.refunded`; add enum statuses `failed/expired/refunded`; expire and purge stale pending orders; set session `expires_at`.
5. Stripe idempotency keys and reuse of an open session/pending order for an unchanged cart (stops double-submit and two-tab double-pay).
6. Reconcile `amount_total` against `order.total` (+ tax) in the webhook; alert on mismatch and on the no-tax fallback.
7. Store tax/Stripe total and label "Total (incl. tax)" consistently; fix GA4 `purchase.value`.
8. Link `customerId` at checkout when signed in; prefill from account.

**P2. Conversion and UX.**
9. Express checkout (Apple Pay/Google Pay via Express Checkout Element, or confirm hosted-page wallets [U]); pass shipping details to Stripe.
10. One CTA vocabulary, one shared plan-label constant; sticky bar follows the PDP's selected tier.
11. Mobile checkout: collapsible summary at top; remove or `target=_blank` the terms link.
12. Field-level validation with `aria-invalid`/`aria-describedby`, focus first error, human field names, state select for US/CA.
13. Confirmation page: call `refresh()`, offer an emailed order link and a real contact link on the unpaid state.

**P3. Hygiene.**
14. Single price source, or a CI/startup check that DB prices equal `products.json`.
15. Remove dead fields (`bonusSample`, `founding100Credit` if dropped) or build the feeder; enums for status/mode.
16. Integration layer (Stripe test mode + Playwright): add -> checkout -> webhook -> confirmation; a test for `app/order/[id]/page.tsx`.

---

## 11. Implementation risks

- **Subscription redesign is the largest change**: pricing, schema, Stripe objects, tax, emails, account UI, terms, every "renews" string. Needs a spec (spec-driven-development default) and an owner build-vs-relabel decision. Existing `subscription` orders are test-mode only (per project memory), so migration is cheapest now.
- **Two paid-transition paths** must be unified before adding emails, or customers get duplicate/missing mail; use the DB update count as the "first time" gate.
- **Prod migration drift** has happened twice (project memory); any schema change (statuses, tax columns, Subscription) needs diff-and-backfill and a prod-DB check.
- **Integer-dollar money** blocks cents/tax detail; changing it touches admin exports, GA4, dispute amounts, and every `$${n}` render.
- **Stripe Tax and multi-currency** need account-level prerequisites (head-office address, registrations; EU Responsible Person still open per project notes); charging in EUR/CAD/AED changes the order model.
- **Express checkout / Payment Element** changes hosted-Checkout assumptions (success URL, metadata, CSP `frame-src`/`connect-src` in `middleware.ts:238-241`).
- **Rate-limit store**: only move off in-memory if hosting topology changes.
- **Brand/claims constraints** (project memory): plan names, "no discounts / Founding Members" decision, guarantee wording are owner-approved; label changes need sign-off, and copy-pinning tests (`tests/founding-members-copy.test.ts`, `tests/fix2-claims.test.ts`, `tests/cart-page.test.ts:46-61`) must be updated deliberately, not skipped.
- **Unknowns to resolve first:** live Stripe receipt/wallet/tax settings; whether prod `Product` rows match `products.json`; proxy `X-Forwarded-For` behaviour; any manual re-billing process; count of `pending` orders in prod.

---

### Appendix: direct answers

- **Add/update/remove:** `POST /api/cart`, `PATCH/DELETE /api/cart/[itemId]`; state in `Cart`/`CartItem` keyed by `chiarel_cart_id` cookie, mirrored in `lib/cart-context.tsx`. [V]
- **Totals:** subtotal and savings recomputed server-side from DB prices on every cart read and at checkout; shipping always 0; tax via Stripe Tax with silent no-tax fallback; no discount codes. [V]
- **Session/idempotency:** `stripe.checkout.sessions.create` (`checkout/route.ts:197`), no idempotency key, no session reuse; each submit = new Order + Session. Client disables the button while submitting (`checkout/page.tsx:247`). Two sessions for one cart can both be paid. [V]
- **Webhook vs redirect:** both flip `pending -> paid` after verifying with Stripe (`payment_status === "paid"`); webhook is signature-verified, page retrieves the session. Confirmation is based on verified payment. They write different fields (S1). [V]
- **Statuses:** `pending`, `paid`; fulfilment separate. [V]
- **Guest checkout:** the only path; no sign-in needed. [V]
- **Cross-customer reads:** `/account` no; `/order/[id]` no without the other party's `session_id` (S5). [V]
- **Analytics events:** `view_item`, `add_to_cart`, `begin_checkout`, `purchase`, `subscribe_toggle`, `email_signup`, `assessment_complete` (`lib/analytics.ts:14-28`). Absent: `remove_from_cart`, `view_cart`, `add_shipping_info`, `add_payment_info`, checkout errors. [V]
- **Rate limiting:** checkout 20/10 min/IP; cart add 60/min/IP; account codes layered per IP/address/global. None on order page, cart PATCH/DELETE, webhook. In-memory. [V]
- **A11y gaps:** errors not tied to fields (`aria-describedby`/`aria-invalid` absent), no focus move on error, drawer quantity not announced (bag page has `aria-live`, `CartPageContent.tsx:287`), raw server field names shown, state is free text with no validation, drawer buttons 28px with a hit-area helper (`CartDrawer.tsx:101`). Positives: bound labels + autocomplete tokens, `role="alert"`, 44px bag controls, reduced motion in sticky bar. [V markup / I behaviour]
- **Mobile (code-visible):** summary below form; sticky bar has no safe-area inset (no `safe-area` string in `app/` or `components/`) [I]; terms link navigates away mid-form [I].
- **Duplicated product data:** `data/products.json` + DB `Product` + `prisma/seed.ts` + `ensure-catalog-row.ts` field mapping; mode-label maps in five files. [V]
- **Checkout test coverage:** mocked unit tests for validation, totals, session creation, tax fallback, webhook signature/idempotency/disputes, cart rules, account auth. Not covered: order-page reconcile, real Stripe, email, e2e, a11y behaviour, mobile layout. [V]
