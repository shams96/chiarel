# CHIAREL checkout redesign: implementation plan

Branch `feat/checkout-redesign`, 2026-11-05. Inputs: `CHIAREL_COMMERCE_AUDIT.md` (code, verified), `GUERLAIN_EXPERIENCE_AUDIT.md` (browser, desktop to checkout step 2; mobile checkout blocked by Guerlain's CDN). Stripe is in TEST mode, so no real customer is affected by anything below until launch.

Scope of this round: the buying path (Ritual Bag, checkout, payment, confirmation, post-purchase email, subscription management). The master product page and the Ritual Advisor are later rounds; the existing `/ritual` and assessment pages are not touched.

## Principles

1. Keep hosted Stripe Checkout as the payment surface. It already carries card data off our servers and supports wallets. Replacing it is a separate decision (D2), not a visual preference.
2. Fix what is untrue before adding what is new. Today the site promises renewals and an emailed receipt that the code does not deliver.
3. One code path marks an order paid. Everything downstream (email, cart clear, analytics) hangs off its "first transition" result.
4. Every phase ships as its own PR, CI green, owner says "merge N". Schema changes get a prod-DB drift check first.
5. Existing brand system stays: ratified Garden `#1F5129`, Red Ochre `#9B4722`, the Apple-palette ground and ink just merged in PR 145, and the fonts already implemented. The brief's `#004B37`, Peach Dust and "sans-serif for checkout" are not adopted; they conflict with ratified decisions.

## Owner decisions (defaults proposed; nothing in Phase A needs them)

| # | Decision | Default I will use if you say "your call" | Why it matters |
|---|---|---|---|
| D1 | Subscriptions: build real recurring billing, or relabel until built | Build with Stripe Subscriptions (Phase D); until then relabel to match one-off charge | Three surfaces promise renewal; terms say management "is being built" |
| D2 | Payment surface: stay on hosted Checkout, or move to embedded Payment Element | Stay hosted; add Apple/Google Pay via hosted-page wallets | Embedded needs CSP, success-flow and metadata changes |
| D3 | Refund and 90-day guarantee handling | Record refunds from Stripe webhook; refunds still issued in Stripe Dashboard | No system support for the guarantee today |
| D4 | Sending mailbox for order mail | Reuse the Hostinger SMTP orders address already configured | Confirmation, shipping, receipt emails |
| D5 | Charge currency for CA, IT, AE | Stay USD, show the approximate local amount as now | EUR/CAD/AED changes the order model |

## Phases

### A. Make checkout true and safe (no owner decision needed) — PR 1
- `markOrderPaid()` shared by webhook and order page: stores PaymentIntent id, `amount_total`, tax, currency; returns whether this call made the transition. Fixes audit #4 / S1.
- Webhook handles `checkout.session.expired`, `payment_intent.payment_failed`, `charge.refunded`; new statuses `failed`, `expired`, `refunded`; session `expires_at`; purge of stale pending orders.
- Reconcile Stripe `amount_total` against our total plus tax; log and alert on mismatch and on the no-tax fallback.
- Idempotency key and reuse of the open pending order for an unchanged cart (stops double-pay from two tabs).
- Link the order to the signed-in customer at checkout; prefill from the account.
- Order total shown as "Total (incl. tax)" everywhere; GA4 `purchase.value` from the stored total.
- Order-confirmation email on first paid transition (D4 default). Remove "a receipt has been sent" wording until the email exists, then restore.
- Tests: unit for each webhook event; integration test of redirect-wins and webhook-wins orderings; test for `app/order/[id]/page.tsx`.

### B. Ritual Bag drawer and bag page — PR 2
- One shared plan-label module replacing five copies; one CTA vocabulary ("Begin the Ritual" on the product page, "Checkout" in the bag, "Complete Your Order" at pay).
- Drawer: plan switcher, quantity stepper with live announcement, 44px targets, free-shipping line, a single ritual recommendation that is dismissible and never repeats (default tier follows the item, not always a subscription).
- Sticky purchase bar follows the selected tier (audit: it always adds a subscription).
- Bag page: summary reachable without 2,600 px of scroll on mobile (Guerlain friction avoided): summary first on mobile, docked total and button.
- Tests: tier consistency across product page, sticky bar, drawer, bag page.

### C. Checkout page and confirmation — PR 3
- Stripped header and footer on cart and checkout, a quiet step indicator, one primary button.
- Field-level validation tied to inputs, focus the first error, human field names, state select for US and CA, terms in a collapsible that does not navigate away.
- Collapsible order summary at the top on mobile; pass shipping address to Stripe.
- Express checkout: confirm Apple Pay and Google Pay appear on hosted Checkout in test mode; add only what Stripe supports for this account.
- Confirmation: "Welcome to the House of Clarity", order number, items, delivery estimate only from real fulfilment rules, "Your CHIAREL Ritual" start-using guidance from existing approved product content, bag refresh, a real contact link on the unpaid state.
- Analytics: add `view_cart`, `remove_from_cart`, `add_shipping_info`, `add_payment_info`; consent unchanged.

### D. Subscriptions (needs D1) — PR 4, spec first
- Spec and plan for Stripe Subscriptions: Product and Price objects, `Subscription` model, webhook lifecycle, dunning email, tax, 90-day plan representation, migration of test-mode orders.
- Account "My Deliveries": next billing date, skip, pause, cancel, change frequency, backed by Stripe, never frontend-only.
- If D1 is "relabel": reword the three surfaces and terms, keep reorder reminders, no billing changes.

### E. Post-purchase emails and account — PR 5
- Shipping email from the admin fulfilment action; product-introduction and day-7 / day-21 ritual emails, configurable timing, transactional and marketing separated by consent.
- Account: order detail page, saved addresses, communication preferences.

### F. Verification — PR 6
- Playwright end-to-end against Stripe test mode and a throwaway Postgres: add, change quantity, remove, guest checkout, successful and failed card, exactly-one order, confirmation, email generated, cross-customer access denied, mobile viewport.
- Accessibility pass (keyboard, focus, contrast) and the predeploy security audit.
- `CHIAREL_TEST_REPORT.md` with only what was actually run.

## Deferred (not this round)
Master product page template, gallery zoom, reviews, the Ritual Advisor, price single-source-of-truth refactor (a startup or CI check that DB prices equal `products.json` lands in A as the smaller fix), moving off the in-memory rate limiter.

## Risks to manage
- Prod migration drift has happened twice: every schema change gets a diff against the prod DB before `migrate deploy`, and the deploy needs your explicit go.
- Copy-pinning tests (`founding-members-copy`, `fix2-claims`, `cart-page`) must be updated deliberately when labels change.
- Integer-dollar money blocks cents; tax is stored as a separate integer in A and the larger money migration stays out of scope.
- Unknowns that need your Stripe Dashboard, not code: live receipt setting, wallet settings, Stripe Tax head-office address and registrations, whether the production webhook subscribes to the new events, and whether prod `Product` prices equal `products.json`.

## Docs not written yet
`CHIAREL_CHECKOUT_SPEC.md`, `CHIAREL_DESIGN_SYSTEM.md`, `CHIAREL_PRODUCT_PAGE_SPEC.md`, `CHIAREL_SECURITY_REVIEW.md`, `CHIAREL_TEST_REPORT.md`: each is written in the phase that produces its content, not up front.
