# International Launch — Tasks

Decisions confirmed: **Option A** (USD charging, display-only conversion) and **Italy built now,
feature-flagged off** until the EU Responsible Person question is answered.

- [x] 1. `lib/countries.ts` — new file: the 4-country config (US, CA, IT, AE) with `requiresState`,
      `postalLabel`, `enabled`, and an approximate static FX rate for display conversion (USD→EUR,
      USD→CAD, USD→AED).
- [x] 2. `data/products.json` / `lib/products.ts` — add `euResponsiblePerson: null` field to the
      `Product` type (present, empty, per constitution's "honest gaps stay visible" gate).
- [x] 3. `app/terms/page.tsx` — add the EU 14-day withdrawal right section (with the sealed-goods
      exception stated accurately) and the governing-law clarifying sentence.
- [x] 4. `app/privacy/page.tsx` — add the GDPR data-subject-rights section.
- [x] 5. `prisma/schema.prisma` — `country String @default("US")`, `state`/`zip` now optional on
      `Order`. Migration file written by hand at
      `prisma/migrations/20260930000000_order_country_optional_state_zip/migration.sql` (this
      environment has no `DATABASE_URL` to run `prisma migrate dev` against the real Supabase DB —
      confirmed no local credentials exist). **NOT YET APPLIED to the live database.**
      `npx prisma generate` was run (schema-only, no DB connection needed) so the TypeScript types
      below compile correctly against the new schema.
- [x] 6. `app/checkout/page.tsx` — country selector (US/CA/AE; IT hidden per the flag), conditional
      State field, postal label swap, approximate-currency display. Verified live in dev server:
      selecting AE hides State, relabels to "PO Box / Postal Code", shows "≈ AED 5,197 — charged in
      USD, see Terms"; switching back to US restores State + "ZIP".
- [x] 7. `app/api/checkout/route.ts` — accepts `country`, country-aware required-field validation,
      creates a Stripe Customer with the shipping address, `automatic_tax: { enabled: true }` +
      `tax_behavior: "exclusive"` on the session.

## QA follow-ups — both done (2026-09-30)

- [x] Stripe Customer de-dup by email: `app/api/checkout/route.ts` now looks up an existing customer
  by email (`stripe.customers.list`) and updates it instead of always creating a new one.
- [x] `lib/countries.test.ts` added — pins the exact contract the QA-caught bug lived in
  (`getCountry()` is a lookup, not an authorization check; `ENABLED_COUNTRIES` excludes Italy;
  `requiresState`/`postalLabel` per country). Did not extend this to a full API-route test (would
  need mocking Next.js request/Prisma/Stripe for marginal extra coverage beyond what's already
  pinned here) — scoped down deliberately, not an oversight.

## Deployment-order warning — read before pushing

**#5's migration is NOT applied to the live Supabase database.** `app/api/checkout/route.ts` (#7) now
writes a `country` value on every order. If this code ships to production before the migration runs
against the real database, **every checkout will fail** (the `country` column won't exist yet). The
migration must be applied first — either by running `npx prisma migrate deploy` with the real
`DATABASE_URL` (locally with production credentials, or via whatever deploy step Hostinger runs), or
by executing `prisma/migrations/20260930000000_order_country_optional_state_zip/migration.sql`
directly against the Supabase database. This is the one step I cannot do from this environment — no
DB credentials are configured here, and even if they were, applying a schema change to the live
database is a call for you to make explicitly, not something to run silently.
