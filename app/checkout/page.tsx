"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";

const FREE_SHIP_THRESHOLD = 150;
const modeLabel: Record<string, string> = {
  ninetyDay: "The Ritual Plan",
  subscription: "Subscription",
  oneTime: "One-time",
};

export default function CheckoutPage() {
  const { lines, subtotal, savings, refresh } = useCart();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasSubscription = lines.some((l) => l.mode !== "oneTime");
  const shipping = subtotal >= FREE_SHIP_THRESHOLD || subtotal === 0 ? 0 : 12;
  const total = subtotal + shipping;

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
      state: form.get("state"),
      zip: form.get("zip"),
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
      await refresh();
      router.push(`/order/${json.orderId}`);
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
        {/* Left: express + form */}
        <div>
          <div className="grid grid-cols-3 gap-3">
            {["Shop Pay", "PayPal", "Apple Pay"].map((m) => (
              <button
                key={m}
                type="button"
                disabled
                title="Payment processing arrives with the CHIAREL Shopify boutique"
                className="cursor-not-allowed border border-ink/20 py-3 text-[12px] uppercase tracking-[0.14em] text-ink/40"
              >
                {m}
              </button>
            ))}
          </div>
          <div className="my-8 flex items-center gap-4 text-[11px] uppercase tracking-[0.18em] text-ink/40">
            <span className="h-px flex-1 bg-ink/10" />
            Or continue with email
            <span className="h-px flex-1 bg-ink/10" />
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="text-[11px] uppercase tracking-[0.16em] text-ink/50">
                Email
              </label>
              <input
                name="email"
                type="email"
                required
                className="mt-1.5 w-full border border-ink/20 bg-white px-4 py-3 text-sm outline-none focus:border-ochre"
                placeholder="you@example.com"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] uppercase tracking-[0.16em] text-ink/50">
                  First Name
                </label>
                <input
                  name="firstName"
                  required
                  className="mt-1.5 w-full border border-ink/20 bg-white px-4 py-3 text-sm outline-none focus:border-ochre"
                />
              </div>
              <div>
                <label className="text-[11px] uppercase tracking-[0.16em] text-ink/50">
                  Last Name
                </label>
                <input
                  name="lastName"
                  required
                  className="mt-1.5 w-full border border-ink/20 bg-white px-4 py-3 text-sm outline-none focus:border-ochre"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] uppercase tracking-[0.16em] text-ink/50">
                Shipping Address
              </label>
              <input
                name="address"
                required
                className="mt-1.5 w-full border border-ink/20 bg-white px-4 py-3 text-sm outline-none focus:border-ochre"
                placeholder="Address"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <input
                name="city"
                required
                className="border border-ink/20 bg-white px-4 py-3 text-sm outline-none focus:border-ochre"
                placeholder="City"
              />
              <input
                name="state"
                required
                className="border border-ink/20 bg-white px-4 py-3 text-sm outline-none focus:border-ochre"
                placeholder="State"
              />
              <input
                name="zip"
                required
                className="border border-ink/20 bg-white px-4 py-3 text-sm outline-none focus:border-ochre"
                placeholder="ZIP"
              />
            </div>

            {hasSubscription && (
              <div className="border border-champagne/60 bg-champagne/10 p-4 text-[12px] leading-relaxed text-ink/70">
                Subscription items renew and ship every 45 days at the price
                shown, until paused or cancelled from your account. No
                commitment — adjust anytime.
              </div>
            )}

            {error && (
              <p className="text-[12px] text-ochre" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="btn-press mt-2 w-full bg-ink py-4 text-[12px] uppercase tracking-[0.25em] text-ivory transition hover:bg-ochre disabled:cursor-wait disabled:opacity-60"
            >
              {submitting ? "Placing Order…" : `Place Order — $${total}`}
            </button>
            <p className="text-center text-[11px] text-ink/45">
              This records your order for the House. Card payment processing
              arrives with our Shopify boutique — no charge is made today.
            </p>
          </form>
        </div>

        {/* Right: order summary */}
        <aside className="card-elevated h-fit rounded-md bg-white p-6">
          <p className="text-[11px] uppercase tracking-[0.18em] text-ink/50">
            Order Summary
          </p>
          <ul className="mt-4 space-y-4">
            {lines.map((line) => (
              <li key={line.slug} className="flex gap-3">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-sm bg-cloud/50">
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
                  <p className="text-[11px] text-ink/50">
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
                <span>Ritual savings</span>
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
          </div>
          <p className="mt-4 text-[11px] text-ink/50">
            Two complimentary samples included, chosen by the House.
          </p>
        </aside>
      </div>
    </div>
  );
}
