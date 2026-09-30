# International Launch (EU, Middle East, Americas) — Plan

Grounded in [SPEC.md](./SPEC.md) and this project's existing conventions (Next.js App Router,
Prisma, Stripe Checkout Sessions in `app/api/checkout/route.ts`, the zero-JS `<details>` accordion
pattern already used for the refund-policy block).

**Two decisions need your sign-off before Tasks/Implementation starts** (flagged inline below, not
silently chosen) — everything else in this plan is ready to build once you confirm.

## 1. Country scope for v1 — exactly 4 countries, not "EU"/"Americas" as open regions

Per the constitution's "no unapproved scope changes to... product architecture" gate, this plan
builds a **fixed, explicit country list**, not a generic "supports any country" system — adding a
5th country later is a small, repeatable addition to this list, not a redesign.

**v1 list:** United States, Canada, Italy, United Arab Emirates — matching your named examples
exactly. Not all of "EU" or "the Middle East" broadly; each additional country needs its own
regulatory check (tax treatment, address format, consumer-protection nuance) before being added, per
SPEC.md's explicit call-out that UAE/Canada-specific research (labeling, Health Canada rules) is
still open.

**DECISION NEEDED: does Italy launch in the same release as the other three, or does it wait on the
EU Responsible Person answer?** The checkout/currency/tax work below is identical either way — this
only affects whether "Italy" is enabled in the country selector at ship time. My recommendation:
build Italy support now (it's the same code either way) but keep it feature-flagged off
(`LAUNCH_COUNTRIES` env var or a simple `enabled: false` in the country config) until you confirm the
RP question, rather than blocking the US/Canada/UAE work on an answer that has nothing to do with
them.

## 2. Currency — DECISION NEEDED: display-only conversion vs. real multi-currency charging

Two real options, meaningfully different in scope:

**Option A — USD charging, localized display only (recommended for v1).** Every charge still
happens in USD regardless of country; the site shows an approximate converted price next to the USD
price for EUR/AED/CAD ("≈ €140" next to "$151") using a small static/periodically-updated rate table,
clearly labeled "approximate, charged in USD." No changes to `data/products.json`'s price shape, no
Stripe Tax currency complexity, no FX-rate infrastructure. Matches this project's own Scope
Discipline (MVP first) — ships fast, is honest (nothing is hidden or misleading about what currency
actually gets charged), and is easy to upgrade later.

**Option B — real per-currency charging.** `data/products.json` gains a price object per currency
(`price: { usd: {...}, eur: {...}, cad: {...}, aed: {...} }`), the checkout session's `line_items[].
price_data.currency` is set from the selected country, and someone (you) owns keeping 4 currencies'
worth of prices aligned as USD prices change. Real, meaningfully larger scope — a pricing-architecture
change, which the constitution explicitly gates behind your sign-off.

**This plan proceeds on Option A** unless you tell me otherwise — it's reversible (Option B can be
layered on later without redoing the country/tax work below), and doesn't touch pricing data, which
this project treats as a decision requiring explicit approval, not an engineering default.

## 3. Checkout form — country selector + conditional address fields

`app/checkout/page.tsx`:
- Add a `country` select as the first field in the address block (before City), populated from a new
  `lib/countries.ts` config: `{ code: "US", name: "United States", requiresState: true, postalLabel:
  "ZIP" }`, `{ code: "CA", requiresState: true, postalLabel: "Postal Code" }` (Canada uses
  province, same UI slot as "state"), `{ code: "IT", requiresState: false, postalLabel: "Postal
  Code", enabled: <ties to the Italy flag from §1> }`, `{ code: "AE", requiresState: false,
  postalLabel: "PO Box / Postal Code" }`.
- The "State" input becomes conditional (`requiresState`) — hidden entirely for IT/AE instead of a
  required field they don't have a value for. This directly fixes the SPEC.md finding that every
  customer currently sees a US-shaped form.
- Postal code input's `placeholder`/label driven by `postalLabel` instead of the hardcoded "ZIP".
- Approximate-currency display (Option A, §2) shown next to the total once a country is selected.

`app/api/checkout/route.ts`:
- Accept `country` (and `state` only when `requiresState`) in the payload; validation logic updates
  to not require `state`/`zip` unconditionally — required-field check becomes country-aware.
- `prisma/schema.prisma`'s `Order` model: add `country String`, make `state` and `zip` optional
  (`String?`) since not every country has both. Small, additive migration — matches this project's
  existing pattern of extending `Order` flatly (see the dispute-risk-mitigation fields already there)
  rather than a new related table.

## 4. Stripe Tax — enabled, registration tracked as a separate business task

`app/api/checkout/route.ts`:
- Add `automatic_tax: { enabled: true }` to the `stripe.checkout.sessions.create(...)` call.
- Add `tax_behavior: "exclusive"` (or `"inclusive"` — your call on whether displayed prices already
  include tax, matching how you want it to read at checkout; US customers generally expect exclusive,
  EU customers generally expect inclusive — worth a short explicit decision when we reach Tasks, not
  guessed here) to each `price_data` line item.
- Requires `shipping_address_collection` or a customer address on the session for Stripe to calculate
  correctly — the existing custom address form's data can be passed via `customer_update` /
  `line_items` metadata, or (cleaner) the checkout session can collect address itself once submitted;
  exact wiring is a Tasks-level detail, not a design decision.

**Not code-gated, and not something I can do for you:** Stripe Tax calculates correctly only once
the account is registered to collect tax in a given jurisdiction (EU OSS registration, UAE VAT
registration if applicable, US state registrations past economic nexus thresholds, Canada GST/HST).
This plan makes the code *ready* the moment each registration exists — it does not perform the
registrations. Flagging this explicitly so "the code is done" is never confused with "we're legally
collecting tax everywhere."

## 5. Terms of Service — add the EU withdrawal right, fix the governing-law clause

`app/terms/page.tsx`:
- New section, "Your Right to Cancel (EU Customers)": 14-day no-reason withdrawal right on distance
  sales, correctly scoped — state the right clearly, and separately and accurately describe the
  sealed-goods/hygiene exception (cosmetics with a broken seal) rather than either omitting the right
  entirely or over-claiming the exception covers everything. Drafted from Directive 2011/83/EU per
  SPEC.md's research; **not a substitute for attorney review** before this governs real EU
  transactions, same disclaimer standard already applied to the refund-policy work in
  `dispute-risk-mitigation`.
- Governing-law clause: add a sentence clarifying that for EU/UK consumers, mandatory consumer-
  protection law of their country of residence still applies regardless of the stated governing law —
  standard, expected language, not a weakening of the existing clause.

## 6. Privacy Policy — GDPR section added alongside the existing content, not replacing it

`app/privacy/page.tsx`:
- New "EU/UK Data Subject Rights (GDPR)" section: lawful basis for processing (contract performance
  for order data, consent for marketing if any), the existing data-subject rights reframed in GDPR
  terms (access/rectification/erasure/portability — largely already promised in the current "Your
  rights" section, just needs GDPR framing added, not new rights invented), and a statement on
  international data transfers if data leaves the EU (e.g. if hosting/Stripe processing happens
  outside the EU).
- **DECISION NEEDED for one line item, not blocking the rest:** GDPR expects an EU contact point for
  data subjects (doesn't always require a formal DPO at this company size, but does expect a reachable
  contact). Plan defaults to reusing the existing `hello@chiarel.com` unless you want a distinct
  address — small enough not to hold up the rest of this section.

## 7. Product data — Responsible Person field, built but left explicitly empty

`data/products.json` / `lib/products.ts`:
- Add an optional `euResponsiblePerson: { name: string; address: string } | null` field to the
  Product type. Left `null` for every product until §1's open RP question is answered — this is the
  "honest gaps stay visible" constitution gate in action: the field exists so the PDP can render it
  the moment there's a real answer, but nothing is invented in the meantime, and the Italy
  country-selector flag (§1) stays off regardless of this field's state until that answer exists.
- INCI ingredient-name labeling is a separate, already-known gap (N1's formula itself isn't
  finalized — see [[chiarel-launch-formulas-register]]) and is out of scope here, not newly
  discovered.

## Explicitly not in this plan (matches SPEC.md's out-of-scope list)

- Actually registering for VAT/GST/sales tax anywhere.
- UAE-specific labeling/import research, Canada Health Canada cosmetics labeling — still flagged open,
  not silently assumed fine just because the checkout code is ready.
- Site translation.
- Customs/duties wording and carrier selection for international shipping.

## Sequencing

§3 (checkout form) and §5/§6 (legal copy) have no dependencies on each other and can be built in
parallel. §4 (Stripe Tax) depends on §3's country field existing. §7 (RP field) is a 10-minute
addition, sequenced last since it's inert until §1's Italy question resolves. Waiting on your call on
the two flagged decisions (§1's Italy-timing, §2's currency approach) before I write Tasks — everything
else above is ready to convert to Tasks as-is.
