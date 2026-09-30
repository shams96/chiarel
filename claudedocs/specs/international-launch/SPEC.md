# International Launch (EU, Middle East, Americas) — Spec

**Trigger:** user confirmed the launch is not US-only — EU (example given: Italy), Middle East
(example given: UAE), and Americas (examples given: US, Canada) — and asked whether Stripe already
handles this, then asked for it to be scoped properly against real international protocols and
settings.

**Status: pre-implementation scoping.** Nothing in this document has been built yet. This is the
Specify phase — what's actually required and why, grounded in the current code and real regulatory
sources (cited below) — not the technical plan. No code changes should happen from this document
alone; Plan/Tasks come after this is reviewed.

**Not legal, tax, or customs advice.** Several items below (Responsible Person, VAT/GST registration,
customs duty terms) are business/legal decisions with real financial and compliance consequences.
This spec identifies what needs a decision and cites the relevant regulation; it does not substitute
for an attorney, a VAT/customs advisor, or the manufacturing partner's own compliance team signing off.

## Direct answer: does Stripe handle this?

**Partially, and only for the payment-processing layer — and the current checkout isn't even using
the parts that would help.** Confirmed by reading `app/api/checkout/route.ts` and `app/checkout/page.tsx`:

- The Stripe Checkout Session is created with `currency: "usd"` hardcoded on every line item — no
  multi-currency, no presentment-currency logic.
- The checkout form is a **custom-built HTML form** (email/firstName/lastName/address/city/state/zip)
  that collects the address *before* handing off to Stripe — it does not use Stripe's own Address
  Element or Checkout's built-in `shipping_address_collection`, which is where Stripe's
  country-aware field localization (e.g., no "State" shown for countries that don't use it, "Postal
  code" instead of "ZIP") actually lives. As built, every customer sees a US-shaped address form
  regardless of country.
- No `automatic_tax` is enabled on the session — no VAT/GST is calculated or collected today, for any
  region.
- No `allowed_countries` restriction is set on shipping — the form doesn't even ask which country the
  customer is in.

**What Stripe genuinely does solve, once configured (not automatic today):**
- **Stripe Tax** calculates and collects VAT (EU/UK), GST (Canada/others), and US sales tax across 50+
  countries, validates EU VAT numbers against VIES, and supports the EU's Non-Union/Union OSS scheme
  for simplified EU-wide VAT remittance from a single registration. [Stripe Tax](https://docs.stripe.com/tax) · [EU OSS](https://stripe.com/resources/more/one-stop-shop-oss-vat-scheme)
- **Stripe Checkout / Elements Address Element** auto-adapts address fields per country (drops
  "State" where irrelevant, relabels "ZIP"→"Postal code", etc.) if used instead of the current custom
  form.
- **SCA (Strong Customer Authentication)** for EU card payments is handled automatically by Stripe
  Checkout — required under EU PSD2, currently irrelevant only because no EU checkout flow exists yet.
- **Multi-currency charging** is supported (Stripe can settle a card in EUR, CAD, AED, etc. even from
  a USD-based account), but presentment currency and pricing per region is something *this
  application* has to decide and pass to Stripe — Stripe doesn't invent a EUR price for you.

**What Stripe does not solve, regardless of configuration:**
- VAT/GST/sales-tax **registration** (Stripe calculates once you're registered; registering with the
  relevant tax authority is a business/accounting task).
- EU Cosmetics Regulation 1223/2009 compliance (Responsible Person, INCI labeling, Product
  Information File) — this is product-labeling/regulatory law, unrelated to payments.
- EU Consumer Rights Directive disclosures (14-day withdrawal right) — a legal disclosure obligation.
- GDPR-shaped privacy practices — Stripe itself is GDPR-compliant as a data processor, but the site's
  own privacy policy, cookie consent, and data-subject-rights handling are this application's
  responsibility.
- Customs/duties on cross-border shipping, or which carrier can actually deliver to UAE/Canada/EU from
  Isola del Liri — a fulfillment/logistics decision, not a payments one.
- Site language localization — Stripe's hosted payment page can localize its own UI text, but product
  pages, cart, and legal copy stay in whatever language they're coded in.

## Confirmed current state (read from the actual codebase)

- Checkout (`app/checkout/page.tsx`, `app/api/checkout/route.ts`): USD-only, custom US-shaped address
  form (State + ZIP, no country field), no tax calculation, no `allowed_countries`.
- Terms (`app/terms/page.tsx`): "All prices are listed in USD." No EU 14-day withdrawal right
  disclosure. Governing-law clause is vague ("laws applicable to 1HubSolutions, LLC") and doesn't
  address that EU/UK consumer-protection law applies to EU/UK consumers regardless of a chosen
  governing law.
- Privacy (`app/privacy/page.tsx`): describes data collection and a functional cart cookie, gives a
  generic "your rights" section, but has no GDPR framing (no stated legal basis for processing, no EU
  representative/DPO contact, no international-transfer safeguard language).
- `data/products.json` / product pages: no INCI ingredient-name labeling field, no Responsible Person
  field, no country-of-sale gating per product.
- Manufacturing partner Natural You Srl is physically in Isola del Liri, **Italy** — i.e., already
  inside the EU. This is materially relevant to the EU Responsible Person requirement below; it does
  not automatically satisfy it (see Open Decisions), but it means EU-bound shipping and EU regulatory
  presence aren't starting from zero the way UAE/Americas distribution would.
- Controlling entity is `1HubSolutions, LLC` (confirmed in [[chiarel-launch-audit-reconciliation]] and
  prior specs) — presumed US-registered; not independently re-verified in this pass.

## Per-region protocol & settings requirements

### EU (launch example: Italy)
| Area | Requirement | Source |
|---|---|---|
| Payments | EUR presentment currency; SCA via Stripe Checkout/Elements (automatic if using Stripe's hosted flow) | Stripe docs, PSD2 |
| Tax | VAT calculation + collection. EU's One-Stop-Shop (OSS) scheme lets a single registration cover distance sales across all EU member states instead of registering in each one | [Stripe: EU OSS](https://stripe.com/resources/more/one-stop-shop-oss-vat-scheme) |
| Consumer right of withdrawal | 14-day no-reason withdrawal right on distance sales must be disclosed before purchase. **Real, narrow exception**: sealed goods "unsealed... after delivery" for hygiene reasons (cosmetics named explicitly) can be exempted from *return* once opened — but the right to disclose the withdrawal right, and to honor it for an unopened/unused product, still applies. This must be stated correctly, not just omitted. | Directive 2011/83/EU (as amended by 2023/2673); ECJ case law says the exception is read strictly | 
| Product regulation | A **Responsible Person established in the EU** is mandatory before placing cosmetics on the EU market — bears legal responsibility for the safety assessment, GMP compliance, claims substantiation, and a Product Information File retained 10 years. Labeling must show the RP's name and address. **Open question, not resolved in this spec**: does Natural You Srl's role as manufacturer already position them (or an affiliate) to serve as RP under a written agreement, or does 1HubSolutions LLC need a separate EU-based RP arrangement? Needs a direct answer from the manufacturing partner/legal counsel before EU listings go live — this is the single highest-stakes open item in the entire launch. | EC Regulation 1223/2009, Art. 4 |
| Privacy | GDPR: lawful basis for processing, data subject rights (access/erasure/portability) correctly scoped, a contact for EU data subjects, international-transfer safeguards if data leaves the EU | GDPR (Regulation (EU) 2016/679) |

### Middle East (launch example: UAE)
| Area | Requirement | Source |
|---|---|---|
| Payments | Stripe supports UAE as an account market, but **full local benefits (AED settlement, local payment methods) require a UAE-registered Stripe account** — a US-based Stripe account can still accept UAE customers' card payments internationally today (Visa/Mastercard), with cross-border/currency-conversion fees, no new setup required for basic card acceptance | Stripe UAE docs |
| Currency | AED is a reasonable presentment currency once decided; not required for basic card acceptance | — |
| Tax | UAE has a 5% VAT (since 2018) on most goods; Stripe Tax's UAE coverage was not clearly confirmed in the sources checked for this spec — needs direct confirmation from Stripe support/docs before relying on automatic calculation, or handle manually | Needs direct verification — flagged, not assumed |
| Product regulation | UAE cosmetics import/labeling requirements (UAE.S GSO standards, Arabic-language labeling in some cases) were not researched in this pass — flagged as a gap, not a confirmed requirement | Needs dedicated research before UAE listings go live |
| Consumer protection | UAE has its own e-commerce/consumer protection framework, distinct from EU's — not researched in this pass | Needs dedicated research |

### Americas (launch examples: US, Canada)
| Area | Requirement | Source |
|---|---|---|
| Payments | Already functional for US (current state). Canada: CAD presentment currency recommended, not required — Stripe accepts CAD cards from a USD account | — |
| Tax | US: sales tax nexus is state-by-state (economic nexus thresholds vary); Stripe Tax covers all 50 states. Canada: GST (federal) + province-specific HST/PST/QST — Stripe Tax lists Canada GST support | Stripe Tax docs |
| Privacy | US: no federal omnibus law, but state laws (e.g. CCPA/CPRA for California residents) may apply depending on where customers are. Canada: PIPEDA governs personal information in commercial activity | CCPA/CPRA; PIPEDA |
| Consumer protection | FDA disclaimer already present (US) and correct. Canada has its own cosmetics labeling rules (Health Canada) — not researched in this pass | Needs dedicated research |

## Scope

### In scope for this spec (to be broken into Plan/Tasks after review)
1. Checkout: country selector, country-aware address fields (replace the custom US-shaped form or
   adopt Stripe's Address Element), multi-currency presentment for EUR/AED/CAD alongside USD.
2. Stripe Tax enabled and configured for the confirmed launch countries, with registration handled as
   a business task tracked alongside the engineering work, not assumed automatic.
3. Terms of Service: add the EU 14-day withdrawal right disclosure (correctly scoped against the
   sealed-goods exception), clarify governing law doesn't override EU/UK consumer protections.
4. Privacy Policy: GDPR-shaped rewrite (lawful basis, EU contact, data subject rights, transfer
   safeguards) alongside the existing US-shaped content, not a replacement of it.
5. Product data: add an EU Responsible Person field once that question (above) is answered, and INCI
   labeling once formulas are finalized (already a known, separate gap — see
   [[chiarel-launch-formulas-register]]).

### Explicitly out of scope for this spec
- Actually registering for VAT/GST/sales tax in any jurisdiction — that's the user's/accountant's
  action, this spec only makes sure the code is ready to calculate correctly once registered.
- Resolving the EU Responsible Person question — flagged for the user to confirm with Natural You Srl
  or counsel, not something engineering can decide.
- UAE-specific product labeling/import research and Canada Health Canada cosmetics labeling — both
  flagged as needing dedicated research passes before those regions' PDPs go fully live, not bundled
  into this spec's Plan phase blind.
- Translating site content into other languages.
- Customs/duties (DDP vs. DDU) and carrier selection for international shipping — a fulfillment
  decision for the user, referenced here only because it affects checkout copy (e.g. whether to state
  "customer responsible for import duties").

## What "solved" looks like
- A customer in Italy, the UAE, the US, or Canada can select their country at checkout, see an
  address form shaped correctly for that country, see pricing in an appropriate currency, and have the
  correct tax calculated and collected.
- The Terms and Privacy pages correctly disclose EU withdrawal rights and GDPR data rights without
  contradicting the existing US-shaped content that's already correct for US customers.
- The EU Responsible Person question has an explicit answer (not silence) before any EU-market
  cosmetics listing goes live.
- Every "needs dedicated research" item above (UAE labeling, Canada Health Canada rules, UAE Stripe
  Tax coverage) is either resolved or explicitly still open and tracked — never silently assumed fine.
