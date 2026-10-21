"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { track } from "@/lib/analytics";
import { shippingFor } from "@/lib/shipping";
import RefundPolicyContent, { REFUND_POLICY_VERSION } from "@/components/RefundPolicyContent";
import { ENABLED_COUNTRIES, getCountry, approxConverted, type CountryCode } from "@/lib/countries";

const modeLabel: Record<string, string> = {
  ninetyDay: "The Ritual Plan",
  subscription: "Subscription",
  oneTime: "One-time",
};

const INPUT = "mt-1.5 w-full border border-ink/20 bg-white px-4 py-3 text-sm outline-none focus:border-ochre";

// A visible label bound to its control, so screen readers announce it and a tap
// on the label focuses the field.
function Field({ label, id, children }: { label: string; id: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="text-[11px] uppercase tracking-[0.16em] text-ink/65">
        {label}
      </label>
      {children}
    </div>
  );
}

export default function CheckoutPage() {
  const { lines, subtotal, savings } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countryCode, setCountryCode] = useState<CountryCode>("US");
  const country = getCountry(countryCode) ?? ENABLED_COUNTRIES[0];

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

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const form = new FormData(e.currentTarget);
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
      window.location.href = json.checkoutUrl;
    } catch {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-6 py-24 text-center">
        <h1 className="font-serif text-3xl">Your bag is empty</h1>
        <Link
          href="/ritual"
          className="mt-6 inline-block border border-ink px-8 py-3 text-[12px] uppercase tracking-[0.25em] transition hover:border-ochre hover:text-ochre"
        >
          Begin the Ritual
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="font-serif text-3xl">Complete your order</h1>

      <div className="mt-10 grid gap-14 lg:grid-cols-[1fr_400px]">
        {/* Left: form. Payment is taken on Stripe's hosted Checkout page. */}
        <div>
          <form className="space-y-5" onSubmit={handleSubmit}>
            <Field label="Email" id="co-email">
              <input
                id="co-email"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                autoCapitalize="none"
                spellCheck={false}
                required
                className={INPUT}
                placeholder="you@example.com"
              />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="First Name" id="co-first">
                <input id="co-first" name="firstName" autoComplete="shipping given-name" required className={INPUT} />
              </Field>
              <Field label="Last Name" id="co-last">
                <input id="co-last" name="lastName" autoComplete="shipping family-name" required className={INPUT} />
              </Field>
            </div>

            <Field label="Country" id="co-country">
              <select
                id="co-country"
                name="country"
                autoComplete="shipping country"
                required
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value as CountryCode)}
                className={INPUT}
              >
                {ENABLED_COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Shipping Address" id="co-address">
              <input
                id="co-address"
                name="address"
                autoComplete="shipping street-address"
                required
                className={INPUT}
                placeholder="Street and number"
              />
            </Field>

            <div className={`grid gap-4 ${country.requiresState ? "grid-cols-3" : "grid-cols-2"}`}>
              <Field label="City" id="co-city">
                <input id="co-city" name="city" autoComplete="shipping address-level2" required className={INPUT} />
              </Field>
              {country.requiresState && (
                <Field label="State" id="co-state">
                  <input id="co-state" name="state" autoComplete="shipping address-level1" required className={INPUT} />
                </Field>
              )}
              <Field label={country.postalLabel} id="co-zip">
                <input
                  id="co-zip"
                  name="zip"
                  autoComplete="shipping postal-code"
                  inputMode={countryCode === "US" || countryCode === "IT" ? "numeric" : "text"}
                  required={country.postalRequired}
                  className={INPUT}
                />
              </Field>
            </div>

            {hasSubscription && (
              <div className="border border-champagne/60 bg-champagne/10 p-4 text-[12px] leading-relaxed text-ink/70">
                Subscription items renew and ship every 45 days at the price
                shown, until paused or cancelled. No commitment — write to
                orders@chiarel.com to adjust anytime.
              </div>
            )}

            {/* Full policy text inline, not just a link — per Stripe's own
                dispute-prevention guidance, a link-only checkbox risks being
                rejected as evidence that the customer actually saw the policy.
                Same zero-JS <details>/<summary> pattern already used in
                UsageGuidance and the homepage FAQ. See
                claudedocs/specs/dispute-risk-mitigation/. */}
            <details className="group border border-ink/15 bg-cloud/20 px-4 py-3 text-[13px] leading-relaxed text-ink/75">
              <summary className="flex cursor-pointer list-none items-center justify-between font-medium text-ink">
                Refund Policy &amp; Terms
                <span className="ml-4 text-lg text-ink/50 group-open:hidden" aria-hidden="true">+</span>
                <span className="ml-4 hidden text-lg text-ink/50 group-open:inline" aria-hidden="true">−</span>
              </summary>
              <div className="mt-3 space-y-3">
                <RefundPolicyContent />
              </div>
            </details>

            <label className="flex min-h-[44px] items-center gap-3 text-[12px] leading-relaxed text-ink/75">
              <input type="checkbox" name="termsAccepted" required className="h-5 w-5 shrink-0" />
              <span>
                I have read and agree to the{" "}
                <Link href="/terms" className="border-b border-ochre text-ochre">
                  Refund Policy and Terms of Service
                </Link>
                .
              </span>
            </label>

            {error && (
              <p id="co-error" className="text-[12px] text-ochre" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="btn-press mt-2 w-full bg-ink py-4 text-[12px] uppercase tracking-[0.25em] text-ivory transition hover:bg-ochre disabled:cursor-wait disabled:opacity-60"
            >
              {submitting ? "Continuing to payment…" : `Continue to Payment — $${total}`}
            </button>
            <p className="text-center text-[11px] text-ink/65">
              You&rsquo;ll enter your card details securely on the next
              screen, processed by Stripe.
            </p>
          </form>
        </div>

        {/* Right: order summary */}
        <aside className="card-elevated h-fit rounded-md bg-white p-6">
          <p className="text-[11px] uppercase tracking-[0.18em] text-ink/65">
            Order Summary
          </p>
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
                  <p className="text-[11px] text-ink/65">
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
            <div className="flex justify-between text-ink/70">
              <span>Subtotal</span>
              <span>${subtotal}</span>
            </div>
            {savings > 0 && (
              <div className="flex justify-between text-ochre">
                <span>Ritual savings (already applied)</span>
                <span>−${savings}</span>
              </div>
            )}
            <div className="flex justify-between text-ink/70">
              <span>Shipping</span>
              <span>{shipping === 0 ? "Complimentary" : `$${shipping}`}</span>
            </div>
            <div className="flex justify-between border-t border-ink/10 pt-3 text-base">
              <span>Total</span>
              <span className="font-serif text-xl">${total}</span>
            </div>
            {country.currency !== "USD" && (
              <p className="text-right text-[11px] text-ink/50">
                {approxConverted(total, country)} — charged in USD, see Terms
              </p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
