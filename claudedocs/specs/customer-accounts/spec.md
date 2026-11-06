# Spec + architecture: Customer accounts ("Your Ritual" sign-in)

Status: DRAFT for owner review (Phase 1 Specify + Phase 2 Plan combined, no code yet).
Supersedes Phase C of `claudedocs/specs/social-signin/` (admin sign-in, PR #140, stays as is and stays separate).

## Problem
The only sign-in that exists is the admin console. A customer has no way in, so "Continue with Google"
today ends in `/admin`. Customers need a frictionless, brand-grade way to see orders, manage a ritual
subscription and re-order, without ever being forced to register in order to buy.

## Research basis (verified = read in a source this session; inferred = reasoned)
- Guest checkout must stay the most prominent path; forcing an account at the start of checkout is a known
  abandonment cause, and creating the account after the order is the pattern Baymard recommends. (verified, via Baymard summaries; exact percentages differ by source, so none are used here)
- Shopify's own customer accounts (the benchmark for DTC) are passwordless: email + one-time 6-digit code, with Google / Shop as optional extras and no password to remember. (verified, Shopify help centre via search)
- Vendor sources converge on: passkeys best for returning users, email code or social for new users, SMS only for recovery. (verified as a vendor claim, directional only)
- Subscriptions are the one reason a guest needs an account later. CHIAREL renews every 45 days, so the account is the "Your Ritual" home, not a checkout hurdle. (inferred from product)

## Principles
1. **Never block a purchase.** Guest checkout stays default and first.
2. **No customer passwords.** Email one-time code + Google. Nothing for a password manager to prefill or a customer to forget. Passkeys later.
3. **Ask for the account when it is worth something:** on the order confirmation ("Save your ritual", one tap), and when they want to manage a subscription. Never before payment.
4. **One identity = a verified email.** A code sent to the inbox and a Google `email_verified` both prove inbox control, so both resolve to the same customer. This is why no extra "confirm link" step is needed.
5. **Customers and admins are separate worlds.** Separate tables, cookies, pages, no shared session, no admin button anywhere on the public site.

## Experience (what the customer sees)
- Header "Account" icon -> `/account/login` (also reached from order confirmation and from `/account` when signed out).
- **One screen:** large email field (autocomplete `email`), "Continue" button, divider, "Continue with Google". Copy in house voice, Libre Bodoni, no new claims.
- **Code step (same page, no page load):** "We sent a code to you@..." six boxes, `autocomplete="one-time-code"`, numeric keypad on mobile, auto-submit on the sixth digit, "Resend" after 30 s, "Use a different email".
- **First-time and returning look identical.** Entering a code creates the account if none exists. No separate Register page, no password field.
- **Landing after sign-in** (`/account`, "Your Ritual"): next shipment and subscription state, orders with tracking, reorder, addresses, email, sign out. A safe `return_to` (allow-listed internal paths only) sends them back to where they were (cart, product, checkout).
- **Signed in at checkout:** email and last address prefilled. Guest still one click.
- **After a guest order:** confirmation page offers "Save your ritual" (sends the code; past orders for that email attach on verification).

## Architecture
- **Data (additive migrations only):** `Customer(id, email unique lower-cased, name?, createdAt, lastSignInAt, deletedAt?)`; `CustomerSession(id, customerId, createdAt, expiresAt, userAgent?, lastSeenAt)`; `LoginCode(id, emailHash, codeHash, expiresAt, attempts, consumedAt)`; extend `Identity` with nullable `customerId` (exactly one of `userId` / `customerId`, enforced by a check). `Order` gets nullable `customerId`, back-filled by verified email.
- **Cookies:** `chiarel_session` (customer) is a different cookie, secret and table from `chiarel_admin_session`. 30-day sliding, HttpOnly, SameSite Lax, Secure in production.
- **Routes:** `POST /api/account/code/start`, `POST /api/account/code/verify`, `GET /api/auth/google/start?intent=customer|admin`, shared `callback` routes by `intent` carried in the signed state cookie, `POST /api/account/signout`, `GET /api/account/me`.
- **Google:** same OAuth client and callback code as admin (already built, PR #140). `intent=customer` finds or creates a `Customer` by verified email and binds the `sub`; `intent=admin` keeps the existing-admin rule. An admin's Gmail signing in on the customer page gets a customer account, never admin.
- **Codes:** 6 digits from CSPRNG, stored hashed, 10 min TTL, max 5 attempts then burned, one active code per email, constant-time compare.
- **Rate limits:** per email (3 codes / 15 min), per IP, global ceiling; existing `lib/rate-limit.ts`.
- **Neutral responses:** "If that address can receive mail, a code is on its way" in every case, so the form never reveals which emails have accounts.
- **Mail:** existing `lib/mail.ts` (Hostinger SMTP). A code email is plain, branded, one line of copy. SPF/DKIM/DMARC on the sending domain are a launch requirement, not a nicety (luxury brand, spam-folder codes kill the flow).
- **Resilience:** DB down -> breaker 503 with the readable page and a "continue as guest" link. SMTP down -> message offers Google and guest checkout; a failed send is logged, never retried blindly.
- **Privacy / EU launch:** account deletion and data export on `/account` (soft delete then purge job), marketing consent separate from sign-in, session cookie is essential so no consent banner dependency. Audit rows for sign-in, sign-out, delete (no codes or tokens).
- **Deliberately not built:** passwords, Facebook, SMS, social login on the cart page, account-required checkout.

## Edge cases to handle
Email case and whitespace, plus-addressing; code expired, wrong, reused, resent (older code dies); two tabs; code typed on desktop while mail opened on phone (works, because it is a code not a link); Google account without verified email (refused with neutral message); user cancels Google (back to the form with no error tone); Google email differs from the order email (orders stay on the order email; "Add another email" later); Apple private relay (Phase 3); customer deleted then signs in again (new account, old data not resurrected); disposable-email abuse (rate limits, no allow-list); back button and deep links; return_to open-redirect (allow-list); session fixation (new session id on sign-in); sign out everywhere; shared device (clear signed-out state, no auto sign-in); screen readers and keyboard-only (code boxes are one logical input); slow mobile networks (idempotent submits, disabled button with spinner); Stripe test mode banner unchanged.

## Admin side (unchanged scope)
`/admin/login` keeps password + "Continue with Google" for pre-created admins only (PR #140). The Yahoo address in that form is Chrome's saved login for `localhost:3000`, not our code (inferred from the field being empty in code: `LoginForm` initial state is `""`). Remove it once at `chrome://settings/passwords`; no HTML attribute reliably overrides saved credentials.

## Phases
- **P1 (core):** Customer, codes, Google intent, `/account/login`, `/account` with orders + sign-out, post-purchase prompt, order back-fill, tests, runbook.
- **P2:** subscription self-service (pause/skip/cancel, needs its own spec), addresses, checkout prefill, device list, passkeys.
- **P3:** Apple sign-in, export/delete polish, name/preferences.

## Acceptance (P1)
- A first-time visitor reaches a signed-in `/account` in under three taps and one code, on a phone, with no password anywhere.
- A guest who ordered last month signs in and sees that order.
- Wrong/expired/over-tried codes and unknown emails never reveal whether an account exists.
- Admin and customer sessions cannot be used on each other's routes (tested both ways).
- All existing admin-auth and checkout tests unchanged and green; guest checkout still works with no account.

## Open decisions for the owner (defaults in bold)
1. Email-code + Google at launch, **passkeys in P2**.
2. Apple sign-in: **later (P3)**; Facebook: **never**.
3. Sender address for codes: **accounts@chiarel.com** (needs DNS records).
4. Session length: **30 days sliding**.
5. Subscription self-service: **separate spec after P1**.
