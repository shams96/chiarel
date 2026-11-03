# Runbook: customer sign-in ("Your Ritual")

Spec: `claudedocs/specs/customer-accounts/spec.md`. Tier: assisted triage (diagnose, propose, a human acts).

## What it is
Passwordless. `/account/login`: email, then a six-digit code (10 min, 5 tries, then burned), or Google
(`/api/auth/google/start?intent=customer`). Cookie `chiarel_session` (HttpOnly, SameSite Lax, 30 days sliding),
table `CustomerSession`. Entirely separate from the admin cookie `chiarel_admin_session`.
Guest checkout is untouched; an account is never required to buy.

## Environment variables
| Var | Needed | Notes |
|---|---|---|
| `CUSTOMER_SESSION_SECRET` | recommended | Signs the cookie and hashes codes. If unset, a different key is derived from `ADMIN_SESSION_SECRET` (label `chiarel-customer-session-v1`). Changing it signs everyone out and voids pending codes. |
| `ACCOUNTS_SMTP_USER`, `ACCOUNTS_SMTP_PASS` | optional | Mailbox `accounts@chiarel.com`. Both set: the code is sent From that mailbox. Either missing: falls back to `HOSTINGER_SMTP_USER` (order and other mail never uses these). |
| `HOSTINGER_SMTP_HOST`, `HOSTINGER_SMTP_PORT` | yes for mail | Shared by both mailboxes. |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `OAUTH_STATE_SECRET` | for Google | Same client as admin. Authorised redirect URI is the existing `/api/auth/google/callback`. `SOCIAL_LOGIN_ENABLED=0` turns Google off for both admin and customers. |

The owner sets the passwords in hPanel / `.env.local`; they are never committed.

## Deliverability (launch requirement)
Codes in a spam folder break the flow. On the sending domain, before launch: SPF includes Hostinger's mail servers,
DKIM enabled for the domain in hPanel, DMARC at least `p=none` with a reporting address, then tighten.
Test by sending a code to a Gmail and an Outlook address and checking "Show original" for `spf=pass dkim=pass dmarc=pass`.

## Behaviour to know
- The start endpoint always answers "If that address can receive mail, a code is on its way", for known, unknown,
  rate-limited and mail-failed addresses alike. A support report of "no code" is therefore never explained by the response.
- Limits (in memory, per process): 3 codes / 15 min per address, 10 starts / 15 min per IP, 300 global; 10 verify
  attempts / 15 min per address, 30 per IP.
- Signing in attaches past guest orders with the same email (case-insensitive) to the customer.
- Google identities of customers are stored with provider `google_customer` (admin's stay `google`), so one person can be both.
- `return_to` only honours internal paths under /account, /shop, /cart, /checkout, /ritual, /order, /build-your-ritual, /assessment.

## Troubleshooting
| Symptom | Check |
|---|---|
| "No code arrives" | Server log for `[customer-login] code email failed:` (SMTP error text, never the code). Then SMTP vars, mailbox password, spam folder, SPF/DKIM/DMARC. In `NODE_ENV=development` only, the code is printed to the console when sending fails. |
| Code "does not work" | Expired (10 min), a newer code was requested (older dies), 5 wrong tries burned it, or the address differs in spelling. Ask them to request a new one. |
| "Too many attempts" | Rate limit; clears within 15 min, or restart of the process resets the in-memory counters. |
| Everyone signed out | `CUSTOMER_SESSION_SECRET` (or `ADMIN_SESSION_SECRET` when derived) changed. |
| 503 on sign-in | Database breaker open; see `database-outage.md`. The page offers guest checkout. |
| Google button missing | Google env vars unset or `SOCIAL_LOGIN_ENABLED=0`. |
| Customer cannot see an old order | The order email differs from the sign-in email; orders attach only by exact (case-insensitive) address. |

## Audit actions (AuditLog, no codes or tokens ever)
`customer.sign_in`, `customer.sign_in_failed` (reason in the summary for Google), `customer.sign_out`, `customer.social_link`.
Actor is the address; `entityId` is the customer id.

## Data
Tables `Customer`, `CustomerSession`, `LoginCode` (hashes only), `Identity.customerId`, `Order.customerId`.
Expired `LoginCode` / `CustomerSession` rows are removed when touched; no purge job yet (P2/P3 with delete/export).
