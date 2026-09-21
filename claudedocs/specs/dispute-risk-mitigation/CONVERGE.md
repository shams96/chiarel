# Dispute/Chargeback Risk Mitigation — Converge

Checked against SPEC.md's "what solved looks like," not just against the plan.

- ✅ **"A customer cannot reach the payment step without the refund/dispute policy
  being shown in full and explicitly agreed to, with that agreement recorded against
  the order"** — verified via `curl` directly against the checkout API: a request
  missing `termsAccepted` (or with it `false`) is rejected with 400, before the
  cart-empty check even runs. The policy text itself is inline via `<details>` (not a
  link), pulled from the same shared `RefundPolicyContent` component the Terms page
  uses, so they can't drift apart.
- ✅ **"A new dispute triggers... visible with its status against the order"** —
  verified with a real, correctly-signed `charge.dispute.created` webhook event sent
  to the actual running server: the matched order's `disputeId`, `disputeStatus`,
  `disputeReason`, `disputeAmount`, and `disputeOpenedAt` were all written correctly,
  matched via `stripePaymentIntentId`.
- ✅ **"Dispute rate is visible before it crosses... thresholds, not discovered after
  a fine notice"** — verified the rate-monitor module directly against real DB state:
  correctly returns `ok` when the payment denominator is zero (avoiding a false
  division-by-zero alarm), and correctly flags `over-threshold` on both Visa and
  Mastercard tiers at a realistic 100% dispute ratio.
- ✅ **"There's a written procedure for responding to a dispute"** —
  `DISPUTE_RESPONSE_RUNBOOK.md`, grounded in Stripe's own cited guidance, not invented.

## Honest gaps, not glossed over

- **The rate-monitor's daily check is confirmed to *start* (verified the
  `[dispute-monitor] scheduler started` log fires in a real standalone server run),
  but the full email-send path through Hostinger's real SMTP was not tested
  end-to-end** — `lib/mail.ts` was written and reviewed, but sending a real email
  requires real `HOSTINGER_SMTP_*` credentials, which aren't set locally. This should
  be smoke-tested once those credentials exist, before relying on it in a real
  over-threshold scenario.
- **A real, non-simulated dispute has never flowed through this code** — the
  verification used a hand-crafted, correctly-signed test event via the Stripe SDK's
  own `generateTestHeaderString` helper (the same mechanism Stripe's own testing docs
  recommend), not the Stripe CLI's `stripe trigger` against a live test-mode account.
  Worth doing that once, from an actual Stripe test-mode dashboard action, before full
  confidence — the webhook signature/parsing logic is verified, but a real Dispute
  object's exact field shape was assumed correct from Stripe's documented schema, not
  observed directly.
- **The 12-hour session TTL and the 70%-of-threshold early-warning fraction (in
  `lib/dispute-monitoring.ts`) are both judgment calls**, not numbers from SPEC.md —
  reasonable defaults, but say if you want them tuned.
- **Test data note**: verifying the webhook handler and rate monitor required
  temporarily mutating two pre-existing test orders in the real (Supabase) database —
  setting a fake `stripePaymentIntentId`/dispute fields, and backdating `createdAt` to
  test the ratio math. Both were reverted afterward, but the exact original
  `createdAt` values weren't captured before the backdate, so the restored dates are
  a reasonable placeholder, not the true original timestamps. Low-stakes since these
  are Stripe test-mode dummy orders, not real customer data, but flagging rather than
  claiming an exact restore.

## Process note

Mid-implementation, `prisma migrate dev` threatened a full database reset due to
migration-history drift (same class of issue as during admin-rbac) — again avoided by
applying the additive change directly via SQL instead. Also found and fixed a real
gap in my own initial implementation, not just the plan: `instrumentation.ts` alone
does nothing on Next.js 14.x without `experimental.instrumentationHook: true` in
`next.config.mjs` — confirmed by inspecting the actual compiled build output (the file
was silently absent from `.next` entirely), not by trusting that adding the file was
sufficient. This would have been a real, silent failure — the scheduler would never
have started in production with no error anywhere — had it not been checked against a
real build rather than just a passing typecheck.
