import type { Country } from "@/lib/countries";

// Field checks for the checkout form, run before anything is sent. The server
// repeats the real checks (app/api/checkout/route.ts); this exists so a person
// is told which field to fix, in plain words, next to that field.

export type CheckoutValues = {
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  termsAccepted: boolean;
};

export type CheckoutField = keyof CheckoutValues;
export type CheckoutErrors = Partial<Record<CheckoutField, string>>;

/** Top-to-bottom order on the page: the first error in this order gets focus. */
export const FIELD_ORDER: CheckoutField[] = [
  "email",
  "firstName",
  "lastName",
  "address",
  "city",
  "state",
  "zip",
  "termsAccepted",
];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateCheckout(
  v: CheckoutValues,
  country: Pick<Country, "requiresState" | "postalRequired" | "postalLabel">,
): CheckoutErrors {
  const errors: CheckoutErrors = {};
  const blank = (s: string) => s.trim().length === 0;

  if (blank(v.email)) errors.email = "Enter your email address.";
  else if (!EMAIL_PATTERN.test(v.email.trim())) errors.email = "Enter an email address like name@example.com.";

  if (blank(v.firstName)) errors.firstName = "Enter your first name.";
  if (blank(v.lastName)) errors.lastName = "Enter your last name.";
  if (blank(v.address)) errors.address = "Enter your street address.";
  if (blank(v.city)) errors.city = "Enter your city.";
  if (country.requiresState && blank(v.state)) errors.state = "Choose your state or province.";
  if (country.postalRequired && blank(v.zip)) {
    errors.zip = `Enter your ${country.postalLabel.toLowerCase()}.`;
  }
  if (!v.termsAccepted) {
    errors.termsAccepted = "Please agree to the Refund Policy and Terms of Service to continue.";
  }
  return errors;
}

/** The first field with an error, in page order, or null. */
export function firstErrorField(errors: CheckoutErrors): CheckoutField | null {
  return FIELD_ORDER.find((f) => errors[f]) ?? null;
}
