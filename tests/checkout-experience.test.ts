import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { FIELD_ORDER, firstErrorField, validateCheckout, type CheckoutValues } from "@/lib/checkout-validation";
import { CA_PROVINCES, US_STATES, regionsFor } from "@/lib/regions";
import { COUNTRIES } from "@/lib/countries";

const read = (p: string) => readFileSync(p, "utf8");

const good: CheckoutValues = {
  email: "ada@example.com",
  firstName: "Ada",
  lastName: "Lovelace",
  address: "1 Main St",
  city: "Austin",
  state: "TX",
  zip: "78701",
  termsAccepted: true,
};

describe("validateCheckout", () => {
  it("accepts a complete US form", () => {
    expect(validateCheckout(good, COUNTRIES.US)).toEqual({});
  });

  it("names every missing field in plain words", () => {
    const errors = validateCheckout(
      { email: "", firstName: " ", lastName: "", address: "", city: "", state: "", zip: "", termsAccepted: false },
      COUNTRIES.US,
    );
    expect(Object.keys(errors).sort()).toEqual(
      ["address", "city", "email", "firstName", "lastName", "state", "termsAccepted", "zip"].sort(),
    );
    expect(errors.email).toBe("Enter your email address.");
    expect(errors.state).toBe("Choose your state or province.");
    expect(errors.zip).toMatch(/^Enter your /);
  });

  it("tells a malformed email apart from a missing one", () => {
    expect(validateCheckout({ ...good, email: "nope" }, COUNTRIES.US).email).toMatch(/like name@example\.com/);
    expect(validateCheckout({ ...good, email: "a@b" }, COUNTRIES.US).email).toBeDefined();
    expect(validateCheckout({ ...good, email: " ada@example.com " }, COUNTRIES.US).email).toBeUndefined();
  });

  it("does not ask for a state where the country has none, nor a postal code where it is optional", () => {
    expect(validateCheckout({ ...good, state: "" }, COUNTRIES.IT).state).toBeUndefined();
    expect(validateCheckout({ ...good, zip: "" }, COUNTRIES.AE).zip).toBeUndefined();
    expect(validateCheckout({ ...good, zip: "" }, COUNTRIES.CA).zip).toBeDefined();
  });

  it("uses the same wording as the server for the terms", () => {
    const msg = validateCheckout({ ...good, termsAccepted: false }, COUNTRIES.US).termsAccepted!;
    expect(msg).toContain("Refund Policy and Terms of Service");
    expect(read("app/api/checkout/route.ts")).toContain("agree to the Refund Policy and Terms of Service");
  });

  it("points focus at the first problem in page order", () => {
    expect(firstErrorField({})).toBeNull();
    expect(firstErrorField({ termsAccepted: "x", city: "y" })).toBe("city");
    expect(firstErrorField({ zip: "x", email: "y" })).toBe("email");
    expect(FIELD_ORDER[0]).toBe("email");
    expect(FIELD_ORDER[FIELD_ORDER.length - 1]).toBe("termsAccepted");
  });
});

describe("regions", () => {
  it("offers a list for the two countries that need a state, free text elsewhere", () => {
    expect(regionsFor("US")).toBe(US_STATES);
    expect(regionsFor("CA")).toBe(CA_PROVINCES);
    expect(regionsFor("IT")).toBeNull();
    expect(regionsFor("AE")).toBeNull();
  });

  it("covers every state, DC and every province with unique two-letter codes", () => {
    expect(US_STATES).toHaveLength(51);
    expect(CA_PROVINCES).toHaveLength(13);
    for (const list of [US_STATES, CA_PROVINCES]) {
      const codes = list.map((r) => r.code);
      expect(new Set(codes).size).toBe(codes.length);
      for (const c of codes) expect(c).toMatch(/^[A-Z]{2}$/);
    }
  });

  it("every country that requires a state is covered by a list or free text", () => {
    for (const c of Object.values(COUNTRIES).filter((x) => x.enabled && x.requiresState)) {
      expect(regionsFor(c.code), c.code).not.toBeUndefined();
    }
  });
});

describe("checkout page wiring", () => {
  const page = read("app/checkout/page.tsx");

  it("validates before sending, with the browser's own popups turned off", () => {
    expect(page).toMatch(/<form[^>]*noValidate/);
    expect(page).toMatch(/validateCheckout\(/);
    expect(page.indexOf("validateCheckout(")).toBeLessThan(page.indexOf('fetch("/api/checkout"'));
  });

  it("focuses the first field with an error and ties each message to its control", () => {
    expect(page).toMatch(/document\.getElementById\(FIELD_ID\[first\]\)\?\.focus\(\)/);
    expect(page).toMatch(/aria-invalid/);
    expect(page).toMatch(/aria-describedby/);
    expect(page).toMatch(/id=\{`\$\{id\}-error`\}/);
  });

  it("uses a state list for the US and Canada", () => {
    expect(page).toMatch(/regionsFor\(countryCode\)/);
  });

  it("shows where the person is, in order", () => {
    expect(page).toMatch(/aria-label="Checkout progress"/);
    expect(page).toMatch(/aria-current="step"/);
    expect(page).toMatch(/<Link href="\/cart"[^>]*>\s*Bag\s*<\/Link>/);
  });

  it("collapses the order summary on a phone and says taxes come at payment", () => {
    expect(page).toMatch(/aria-expanded=\{summaryOpen\}/);
    expect(page).toMatch(/order-1[^"]*lg:order-2/);
    expect(page).toMatch(/Taxes are calculated at payment\./);
    expect(page).toMatch(/Estimated total/);
  });

  it("fills the form from the signed-in account without overwriting what was typed", () => {
    expect(page).toMatch(/\/api\/account\/me/);
    expect(page).toMatch(/!el\.value/);
  });

  it("sends add_shipping_info only after the order is created, and never claims add_payment_info", () => {
    expect(page.indexOf('track("add_shipping_info"')).toBeGreaterThan(page.indexOf("if (!res.ok)"));
    expect(page).not.toMatch(/track\("add_payment_info"/);
  });
});

describe("checkout chrome and analytics", () => {
  it("the site header is swapped for a quiet one on /checkout; the footer is untouched", () => {
    const layout = read("app/layout.tsx");
    expect(layout).toMatch(/<HideOnCheckout>\s*<Header \/>\s*<\/HideOnCheckout>/);
    expect(layout).toMatch(/<CheckoutHeader \/>/);
    expect(layout).toMatch(/<HideOnAdmin>\s*<Footer \/>\s*<\/HideOnAdmin>/);
  });

  it("the quiet header leads back to the bag from checkout (and to the shop from the bag)", () => {
    const chrome = read("components/CheckoutChrome.tsx");
    expect(chrome).toMatch(/href: "\/cart", label: "Back to bag"/);
    expect(chrome).toMatch(/href: "\/shop", label: "Continue shopping"/);
  });

  it("the new commerce events exist and are fired from the bag, the remove button and checkout", () => {
    const analytics = read("lib/analytics.ts");
    for (const e of ["view_cart", "remove_from_cart", "add_shipping_info"]) expect(analytics).toContain(e);
    expect(read("components/CartPageContent.tsx")).toMatch(/track\("view_cart"/);
    expect(read("lib/cart-context.tsx")).toMatch(/track\("remove_from_cart"/);
  });
});
