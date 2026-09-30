// Fixed v1 launch-country list — not a generic any-country system. Adding a
// country later means adding an entry here after its own regulatory check
// (tax treatment, address format, consumer-protection rules), per
// claudedocs/specs/international-launch/SPEC.md. Don't widen this to a full
// world list without repeating that check per country.
export type CountryCode = "US" | "CA" | "IT" | "AE";

export type Country = {
  code: CountryCode;
  name: string;
  /** Whether the address form should show a State/Province field. */
  requiresState: boolean;
  /** Label for the postal-code input — not every country calls it "ZIP". */
  postalLabel: string;
  /**
   * Whether this country is live in the checkout country selector. Italy is
   * built but left off until the EU Responsible Person question (see
   * SPEC.md) is answered — flip to true once that's resolved, no other code
   * change needed.
   */
  enabled: boolean;
  /**
   * Approximate USD-to-local-currency rate for DISPLAY ONLY (Option A from
   * PLAN.md §2 — every charge still happens in USD; this is never sent to
   * Stripe). Static and approximate on purpose: real-time FX is out of scope
   * for v1. Update periodically, not on every request.
   */
  currency: string;
  approxUsdRate: number;
};

export const COUNTRIES: Record<CountryCode, Country> = {
  US: {
    code: "US",
    name: "United States",
    requiresState: true,
    postalLabel: "ZIP",
    enabled: true,
    currency: "USD",
    approxUsdRate: 1,
  },
  CA: {
    code: "CA",
    name: "Canada",
    requiresState: true,
    postalLabel: "Postal Code",
    enabled: true,
    currency: "CAD",
    approxUsdRate: 1.36,
  },
  IT: {
    code: "IT",
    name: "Italy",
    requiresState: false,
    postalLabel: "Postal Code",
    enabled: true,
    currency: "EUR",
    approxUsdRate: 0.92,
  },
  AE: {
    code: "AE",
    name: "United Arab Emirates",
    requiresState: false,
    postalLabel: "PO Box / Postal Code",
    enabled: true,
    currency: "AED",
    approxUsdRate: 3.67,
  },
};

export const ENABLED_COUNTRIES: Country[] = Object.values(COUNTRIES).filter((c) => c.enabled);

export function getCountry(code: string): Country | undefined {
  return COUNTRIES[code as CountryCode];
}

/** Approximate converted price for display next to the real USD charge — never sent to Stripe. */
export function approxConverted(usdAmount: number, country: Country): string {
  if (country.currency === "USD") return "";
  const converted = usdAmount * country.approxUsdRate;
  return `≈ ${converted.toLocaleString(undefined, { style: "currency", currency: country.currency, maximumFractionDigits: 0 })}`;
}
