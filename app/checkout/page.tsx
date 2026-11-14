"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { track } from "@/lib/analytics";
import { shippingFor } from "@/lib/shipping";
import { CTA, PLAN_NAME } from "@/lib/plan-labels";
import { regionsFor } from "@/lib/regions";
import {
  firstErrorField,
  validateCheckout,
  type CheckoutErrors,
  type CheckoutField,
} from "@/lib/checkout-validation";
import RefundPolicyContent, { REFUND_POLICY_VERSION } from "@/components/RefundPolicyContent";
import { ENABLED_COUNTRIES, getCountry, approxConverted, type CountryCode } from "@/lib/countries";

const modeLabel = PLAN_NAME;

const INPUT = "mt-1.5 w-full border border-ink/20 bg-white px-4 py-3 text-sm outline-none focus:border-ochre";
const INPUT_ERROR = "border-ochre";

// Field id on the page for each validated field, so an error can move focus to it.
const FIELD_ID: Record<CheckoutField, string> = {
  email: "co-email",
  firstName: "co-first",
  lastName: "co-last",
  address: "co-address",
  city: "co-city",
  state: "co-state",
  zip: "co-zip",
  termsAccepted: "co-terms",
};

// A visible label bound to its control, so screen readers announce it and a tap
// on the label focuses the field. The message sits under the field and is tied
// to it with aria-describedby (set on the control by the caller).
function Field({
  label,
  id,
  error,
  children,
}: {
  label: string;
  id: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="text-eyebrow uppercase text-ink">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-[12px] text-ochre">
          {error}
        </p>
      )}
    </div>
  );
}

// Where the person is: the bag is behind them, payment comes next on Stripe.
function Steps() {
  const step = "text-eyebrow uppercase";
  return (
    <ol aria-label="Checkout progress" className="mb-8 flex flex-wrap items-center gap-x-3 gap-y-1">
      <li className={`${step} text-ink`}>
        <Link href="/cart" className="tap-area underline underline-offset-4 hover:text-ochre">
          Bag
        </Link>
      </li>
      <li aria-hidden="true" className="text-ink">/</li>
      <li className={`${step} text-ink`} aria-current="step">
        Details
      </li>
      <li aria-hidden="true" className="text-ink">/</li>
      <li className={`${step} text-ink`}>Payment</li>
    </ol>
  );
}

export default function CheckoutPage() {
  const { lines, subtotal, savings } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<CheckoutErrors>({});
  const [countryCode, setCountryCode] = useState<CountryCode>("US");
  const [summaryOpen, setSummaryOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const country = getCountry(countryCode) ?? ENABLED_COUNTRIES[0];
  const regions = regionsFor(countryCode);

  const hasSubscription = lines.some((l) => l.mode !== "oneTime");
  const shipping = shippingFor(subtotal, lines);
  const total = subtotal + shipping;

  // begin_checkout: once per visit to this page, as soon as the bag has items.
  const beganCheckout = useRef(false);
  useEffect(() => {
    if (beganCheckout.current || lines.length === 0) return;
    beganCheckout.current = true;
    track("begin_checkout", {
      currency: "USD",
      value: subtotal,
      items: lines.map((l) => ({
        item_id: l.slug,
        item_name: l.product.name,
        price: l.unitPrice,
        quantity: l.qty,
      })),
    });
  }, [lines, subtotal]);

  // Someone signed in does not retype what the account already holds. Only
  // empty fields are filled, so nothing the person typed is overwritten, and
  // every field stays editable. A guest (401) or a failed lookup changes nothing.
  const prefilled = useRef(false);
  useEffect(() => {
    if (prefilled.current || lines.length === 0) return;
    prefilled.current = true;
    fetch("/api/account/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((me) => {
        if (!me?.signedIn || !formRef.current) return;
        const set = (id: string, value: string | undefined) => {
          const el = formRef.current?.querySelector<HTMLInputElement>(`#${id}`);
          if (el && value && !el.value) el.value = value;
        };
        const name: string = (me.customer?.name ?? "").trim();
        const space = name.indexOf(" ");
        set("co-email", me.customer?.email);
        set("co-first", space === -1 ? name : name.slice(0, space));
        set("co-last", space === -1 ? "" : name.slice(space + 1).trim());
      })
      .catch(() => {});
  }, [lines.length]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const form = new FormData(e.currentTarget);
    const text = (k: string) => String(form.get(k) ?? "");
    const found = validateCheckout(
      {
        email: text("email"),
        firstName: text("firstName"),
        lastName: text("lastName"),
        address: text("address"),
        city: text("city"),
        state: text("state"),
        zip: text("zip"),
        termsAccepted: form.get("termsAccepted") === "on",
      },
      country,
    );
    setErrors(found);
    const first = firstErrorField(found);
    if (first) {
      // Move focus to the first field to fix, so a keyboard or screen-reader user
      // lands on it instead of searching a long form.
      document.getElementById(FIELD_ID[first])?.focus();
      return;
    }

    setSubmitting(true);
    const payload = {
      email: form.get("email"),
      firstName: form.get("firstName"),
      lastName: form.get("lastName"),
      address: form.get("address"),
      city: form.get("city"),
      country: form.get("country"),
      state: form.get("state") || null,
      zip: form.get("zip") || null,
      termsAccepted: form.get("termsAccepted") === "on",
      termsVersion: REFUND_POLICY_VERSION,
    };

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }
      // Details are accepted and the person is about to pay on Stripe's page.
      // (There is no add_payment_info event: the card is entered on Stripe's
      // domain, where this site cannot observe it.)
      track("add_shipping_info", {
        currency: "USD",
        value: total,
        items: lines.map((l) => ({
          item_id: l.slug,
          item_name: l.product.name,
          price: l.unitPrice,
          quantity: l.qty,
        })),
      });
      window.location.href = json.checkoutUrl;
    } catch {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  if (lines.length === 0) {
    return (
      <div className="mx-auto w-full max-w-container px-margin py-12 md:py-14">
        <h1 className="text-center font-serif text-3xl md:text-h1">Your Ritual Bag</h1>
        <div className="mx-auto mt-8 flex min-h-[50vh] max-w-md flex-col items-center justify-center gap-6 text-center">
          <p className="text-sm text-ink">Your bag is empty.</p>
          <Link
            href="/ritual"
            className="btn-press inline-block bg-ink px-8 py-3.5 text-eyebrow uppercase text-ivory transition hover:bg-ochre"
          >
            Begin the Ritual
          </Link>
          <Link
            href="/shop"
            className="tap-area text-eyebrow uppercase text-ochre underline underline-offset-4"
          >
            Continue shopping
          </Link>
        </div>
      </div>
    );
  }

  // Props that tie a control to its message and mark it invalid for assistive tech.
  const a11y = (f: CheckoutField) => ({
    "aria-invalid": errors[f] ? (true as const) : undefined,
    "aria-describedby": errors[f] ? `${FIELD_ID[f]}-error` : undefined,
  });
  const cls = (f: CheckoutField) => `${INPUT} ${errors[f] ? INPUT_ERROR : ""}`;

  return (
    <div className="mx-auto w-full max-w-container px-margin py-8 md:py-12">
      <Steps />
      <h1 className="font-serif text-3xl">{CTA.pay}</h1>

      <div className="mt-8 grid gap-8 lg:mt-10 lg:grid-cols-[1fr_400px] lg:gap-14">
        {/* Left: form. Payment is taken on Stripe's hosted Checkout page. */}
        <div className="order-2 lg:order-1">
          <form ref={formRef} className="space-y-5" onSubmit={handleSubmit} noValidate>
            <Field label="Email" id="co-email" error={errors.email}>
              <input
                id="co-email"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                autoCapitalize="none"
                spellCheck={false}
                required
                {...a11y("email")}
                className={cls("email")}
                placeholder="you@example.com"
              />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="First Name" id="co-first" error={errors.firstName}>
                <input id="co-first" name="firstName" autoComplete="shipping given-name" required {...a11y("firstName")} className={cls("firstName")} />
              </Field>
              <Field label="Last Name" id="co-last" error={errors.lastName}>
                <input id="co-last" name="lastName" autoComplete="shipping family-name" required {...a11y("lastName")} className={cls("lastName")} />
              </Field>
            </div>

            <Field label="Country" id="co-country">
              <select
                id="co-country"
                name="country"
                autoComplete="shipping country"
                required
                value={countryCode}
                onChange={(e) => {
                  setCountryCode(e.target.value as CountryCode);
                  // A state chosen for one country means nothing in another.
                  setErrors((prev) => ({ ...prev, state: undefined, zip: undefined }));
                }}
                className={INPUT}
              >
                {ENABLED_COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Shipping Address" id="co-address" error={errors.address}>
              <input
                id="co-address"
                name="address"
                autoComplete="shipping street-address"
                required
                {...a11y("address")}
                className={cls("address")}
                placeholder="Street and number"
              />
            </Field>

            <div className={`grid gap-4 ${country.requiresState ? "grid-cols-3" : "grid-cols-2"}`}>
              <Field label="City" id="co-city" error={errors.city}>
                <input id="co-city" name="city" autoComplete="shipping address-level2" required {...a11y("city")} className={cls("city")} />
              </Field>
              {country.requiresState && (
                <Field label="State" id="co-state" error={errors.state}>
                  {regions ? (
                    <select
                      key={countryCode}
                      id="co-state"
                      name="state"
                      autoComplete="shipping address-level1"
                      required
                      defaultValue=""
                      {...a11y("state")}
                      className={cls("state")}
                    >
                      <option value="" disabled>
                        Select
                      </option>
                      {regions.map((r) => (
                        <option key={r.code} value={r.code}>
                          {r.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input id="co-state" name="state" autoComplete="shipping address-level1" required {...a11y("state")} className={cls("state")} />
                  )}
                </Field>
              )}
              <Field label={country.postalLabel} id="co-zip" error={errors.zip}>
                <input
                  id="co-zip"
                  name="zip"
                  autoComplete="shipping postal-code"
                  inputMode={countryCode === "US" || countryCode === "IT" ? "numeric" : "text"}
                  required={country.postalRequired}
                  {...a11y("zip")}
                  className={cls("zip")}
                />
              </Field>
            </div>

            {hasSubscription && (
              <div className="border border-champagne/60 bg-champagne/10 p-4 text-[12px] leading-relaxed text-ink">
                Subscription items renew and ship every 45 days at the price
                shown, until paused or cancelled. No commitment — write to
                orders@chiarel.com to adjust anytime.
              </div>
            )}

            {/* Full policy text inline, not just a link — per Stripe's own
                dispute-prevention guidance, a link-only checkbox risks being
                rejected as evidence that the customer actually saw the policy.
                A <details> keeps it on this page (no navigation away from a
                half-filled form) and needs no JS. See
                claudedocs/specs/dispute-risk-mitigation/. */}
            <details className="group border border-ink/15 bg-cloud/20 px-4 py-3 text-[13px] leading-relaxed text-ink">
              <summary className="flex min-h-[44px] cursor-pointer list-none items-center justify-between font-medium text-ink">
                Refund Policy &amp; Terms
                <span className="ml-4 text-lg text-ink group-open:hidden" aria-hidden="true">+</span>
                <span className="ml-4 hidden text-lg text-ink group-open:inline" aria-hidden="true">−</span>
              </summary>
              <div className="mt-3 space-y-3">
                <RefundPolicyContent />
              </div>
            </details>

            <div>
              <label className="flex min-h-[44px] items-center gap-3 text-[12px] leading-relaxed text-ink">
                <input type="checkbox" name="termsAccepted" id="co-terms" className="h-5 w-5 shrink-0" {...a11y("termsAccepted")} />
                <span>
                  I have read and agree to the{" "}
                  <Link href="/terms" target="_blank" className="border-b border-ochre text-ochre">
                    Refund Policy and Terms of Service
                  </Link>
                  .
                </span>
              </label>
              {errors.termsAccepted && (
                <p id="co-terms-error" className="mt-1.5 text-[12px] text-ochre">
                  {errors.termsAccepted}
                </p>
              )}
            </div>

            {error && (
              <p id="co-error" className="text-[12px] text-ochre" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="btn-press mt-2 min-h-[44px] w-full bg-ink py-4 text-eyebrow uppercase text-ivory transition hover:bg-ochre disabled:cursor-wait disabled:opacity-60"
            >
              {submitting ? "Continuing to payment…" : `${CTA.pay} — $${total}`}
            </button>
            <p className="text-center text-[12px] text-ink">
              You&rsquo;ll enter your card details securely on the next
              screen, processed by Stripe.
            </p>
          </form>
        </div>

        {/* Right: order summary. On a phone it comes first and is collapsed to
            one line (the total), so the form is not pushed down the page. */}
        <aside className="card-elevated order-1 h-fit rounded-md bg-white p-6 lg:order-2" aria-label="Order summary">
          <button
            type="button"
            onClick={() => setSummaryOpen((o) => !o)}
            aria-expanded={summaryOpen}
            aria-controls="co-summary"
            className="flex min-h-[44px] w-full items-center justify-between text-left lg:hidden"
          >
            <span className="text-eyebrow uppercase text-ink">
              Order Summary {summaryOpen ? "−" : "+"}
            </span>
            <span className="tabular-nums font-serif text-xl">${total}</span>
          </button>
          <p className="hidden text-eyebrow uppercase text-ink lg:block">Order Summary</p>

          <div id="co-summary" className={`${summaryOpen ? "block" : "hidden"} lg:block`}>
            <ul className="mt-4 space-y-4">
              {lines.map((line) => (
                <li key={line.slug} className="flex gap-3">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden bg-cloud/50">
                    <Image
                      src={line.product.image}
                      alt={line.product.name}
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 text-sm">
                    <p className="leading-tight">{line.product.name}</p>
                    <p className="text-[12px] text-ink">
                      {modeLabel[line.mode]} · Qty {line.qty}
                    </p>
                  </div>
                  <p className="tabular-nums text-sm">
                    ${line.unitPrice * line.qty}
                  </p>
                </li>
              ))}
            </ul>

            <div className="mt-6 space-y-2 border-t border-ink/10 pt-4 text-sm tabular-nums">
              <div className="flex justify-between text-ink">
                <span>Subtotal</span>
                <span>${subtotal}</span>
              </div>
              {savings > 0 && (
                <div className="flex justify-between text-ochre">
                  <span>Ritual savings (already applied)</span>
                  <span>−${savings}</span>
                </div>
              )}
              <div className="flex justify-between text-ink">
                <span>Shipping</span>
                <span>{shipping === 0 ? "Complimentary" : `$${shipping}`}</span>
              </div>
              <div className="flex justify-between border-t border-ink/10 pt-3 text-base">
                <span>Estimated total</span>
                <span className="font-serif text-xl">${total}</span>
              </div>
              <p className="text-right text-[12px] text-ink">Taxes are calculated at payment.</p>
              {country.currency !== "USD" && (
                <p className="text-right text-[12px] text-ink">
                  {approxConverted(total, country)} — charged in USD, see Terms
                </p>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
