# Commerce plan status (Phases A-C)

Every bullet of `CHIAREL_IMPLEMENTATION_PLAN.md` Phases A, B and C against what is on `main`, checked in
code on 2026-11-06. A bullet is only "Done" when the code or a test shows it; anything not done says why
and who owns it. This file exists because Phase B shipped without its CTA-vocabulary bullet and nothing
recorded the omission.

Legend: **Done** (in code, with a test or a verifiable string) | **Owner** (needs the Stripe Dashboard or a
decision, not code) | **By design** (deliberately different from the plan)

## Phase A: make checkout true and safe

| Bullet | Status | Evidence |
|---|---|---|
| `markOrderPaid()` shared by webhook and order page | Done | `lib/order-payment.ts` `settleCheckoutSession`; `tests/order-payment.test.ts` |
| Webhook: expired / failed / refunded; statuses; session expiry | Done | `app/api/webhooks/stripe/route.ts`; `tests/stripe-webhook.test.ts` |
| Purge of stale pending orders | Done (marks `expired`, never deletes) | `lib/order-sweep.ts`, hourly from `instrumentation.ts`; `tests/plan-gaps.test.tsx` |
| Reconcile `amount_total`; alert on mismatch and no-tax fallback | Done | `[alert] checkout.amount_mismatch`, `checkout.no_tax_fallback` |
| Idempotency key, reuse of the open order | Done | fingerprint reuse in `app/api/checkout/route.ts` |
| Link order to the signed-in customer; prefill from the account | Done | route `customerId`; `app/checkout/page.tsx` prefill |
| "Total (incl. tax)" everywhere | Done | `lib/order-total.ts` read by order page, email, account page, admin list and admin detail |
| GA4 `purchase.value` from the stored total | Done | `app/order/[id]/page.tsx` |
| Order-confirmation email on first paid transition | Done in code | `lib/order-email.ts`. **Owner:** the sending mailbox (D4) is unconfirmed |
| Startup or CI check that DB prices equal `products.json` | Done (CI) | `scripts/smoke.mjs` check "prices equal data/products.json prices". **Owner:** a one-off comparison against the production database has not been run |
| Tests | Done | see the files above |

## Phase B: Ritual Bag

| Bullet | Status | Evidence |
|---|---|---|
| One shared plan-label module | Done | `lib/plan-labels.ts` |
| One CTA vocabulary: Begin the Ritual / Checkout / Complete Your Order | Done | `CTA` and `addCtaLabel` in `lib/plan-labels.ts`; `tests/plan-gaps.test.tsx` |
| Drawer: plan switcher, quantity stepper with announcement, 44px targets, free-shipping line, one dismissible recommendation | Done | `components/CartDrawer.tsx`, `components/PlanSelect.tsx` |
| Sticky bar follows the selected tier | Done | `lib/pdp-plan.ts`; label from `addCtaLabel(tier)` |
| Bag page: summary first on mobile, docked total and button | Done | `order-1` summary, `order-2` items, `order-3` guidance below `lg`; `data-testid="bag-dock"` |
| Tests: tier consistency | Done | `tests/bag-consistency.test.ts` |

## Phase C: checkout page and confirmation

| Bullet | Status | Evidence |
|---|---|---|
| Stripped header on cart and checkout | Done | `components/CheckoutChrome.tsx` (cart links to the shop, checkout links to the bag) |
| Stripped **footer** on cart and checkout | By design | `components/Footer.tsx` is off-limits (owner rule) |
| One primary button, quiet step indicator | Done | `app/checkout/page.tsx` |
| Field-level validation, focus first error, human names, state select, terms that do not navigate away | Done | `lib/checkout-validation.ts`, `lib/regions.ts`, `<details>` terms |
| Collapsible order summary on mobile; shipping address to Stripe | Done | `app/checkout/page.tsx`; Stripe Customer with the shipping address in `app/api/checkout/route.ts` |
| Express checkout: confirm Apple Pay and Google Pay on hosted Checkout | **Owner** | depends on the Stripe account's wallet settings; not checkable from code |
| Confirmation page content | Done | `app/order/[id]/page.tsx` |
| Analytics: `view_cart`, `remove_from_cart`, `add_shipping_info`, `add_payment_info` | Done except `add_payment_info` (By design) | the card is entered on Stripe's page, so no event is claimed |

## Still needs the owner (not code)

1. Production Stripe webhook (test mode): subscribe to `checkout.session.expired`, `payment_intent.payment_failed`, `charge.refunded`. Until then the order sweep above keeps abandoned orders from staying "pending", but failed and refunded orders will not update.
2. Order-confirmation mailbox (D4).
3. Apple Pay / Google Pay on hosted Checkout (Stripe Dashboard wallet settings).
4. A read-only comparison of production `Product` prices with `data/products.json`.
5. Decision D1 (real recurring subscriptions) before Phase D; Phases D, E and F are not started.
