"use client";

import { MAX_LINE_QTY } from "@/lib/cart-limits";
import Image from "next/image";
import Link from "next/link";
import { useCart, type CartLine } from "@/lib/cart-context";
import { getProduct, isPurchasable } from "@/lib/products";
import { planOptions } from "@/lib/pricing";
import { shippingFor } from "@/lib/shipping";

// The bag as its own page: one row per product with a plan selector, and a
// summary panel beside it. Same numbers as the drawer and /checkout (shared
// pricing and shipping code); payment itself is still hosted by Stripe.

const MODE_LABEL: Record<CartLine["mode"], string> = {
  ninetyDay: "The Ritual Plan",
  subscription: "Subscription",
  oneTime: "One-time",
};

function PlanSelect({ line }: { line: CartLine }) {
  const { changePlan } = useCart();
  const product = getProduct(line.slug);
  if (!product || !isPurchasable(product)) {
    return <p className="text-[13px] text-ink/70">{MODE_LABEL[line.mode]}</p>;
  }
  const options = planOptions(line.slug, product.price.subscription, product.price.oneTime);
  return (
    <div>
      <label htmlFor={`plan-${line.id}`} className="sr-only">
        Plan for {line.product.name}
      </label>
      <select
        id={`plan-${line.id}`}
        value={line.mode}
        onChange={(e) => changePlan(line.slug, e.target.value as CartLine["mode"])}
        className="min-h-[44px] w-full cursor-pointer border border-ink/20 bg-white px-3 py-2 text-[13px] text-ink focus:border-ochre focus:outline-none"
      >
        {options.map((o) => (
          <option key={o.mode} value={o.mode}>
            {o.label} · ${o.price}
          </option>
        ))}
      </select>
      <p className="mt-1.5 text-[12px] text-ink/65">
        {options.find((o) => o.mode === line.mode)?.detail}
      </p>
    </div>
  );
}

function QuantityStepper({ line }: { line: CartLine }) {
  const { setQty } = useCart();
  return (
    <div className="inline-flex items-center border border-ink/15">
      <button
        type="button"
        onClick={() => setQty(line.id, line.qty - 1)}
        disabled={line.qty <= 1}
        aria-label={`Decrease quantity of ${line.product.name}`}
        className="btn-press flex h-11 w-11 items-center justify-center text-base text-ink/70 transition hover:text-ochre disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:text-ink/70"
      >
        −
      </button>
      <span className="tabular-nums w-8 text-center text-[14px]" aria-live="polite">
        {line.qty}
      </span>
      <button
        type="button"
        onClick={() => setQty(line.id, line.qty + 1)}
                              disabled={line.qty >= MAX_LINE_QTY}
        aria-label={`Increase quantity of ${line.product.name}`}
        className="btn-press flex h-11 w-11 items-center justify-center text-base text-ink/70 transition hover:text-ochre disabled:cursor-not-allowed disabled:opacity-30"
      >
        +
      </button>
    </div>
  );
}

function InfoItem({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <details className="group border-t border-ink/10 py-1">
      <summary className="flex min-h-[44px] cursor-pointer list-none items-center justify-between text-[12px] uppercase tracking-[0.14em] text-ink/80">
        {title}
        <span className="ml-4 text-lg text-ink/50 group-open:hidden" aria-hidden="true">+</span>
        <span className="ml-4 hidden text-lg text-ink/50 group-open:inline" aria-hidden="true">−</span>
      </summary>
      <div className="pb-3 text-[13px] leading-relaxed text-ink/70">{children}</div>
    </details>
  );
}

export default function CartPageContent() {
  const { lines, remove, subtotal, savings, count, loading } = useCart();
  const shipping = shippingFor(subtotal, lines);
  const total = subtotal + shipping;

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 md:py-14">
      <h1 className="text-center font-serif text-3xl md:text-4xl">
        Your Ritual Bag{count > 0 ? ` (${count})` : ""}
      </h1>

      {loading && lines.length === 0 ? (
        // Nothing in context yet (first paint of a fresh load): show the page's
        // own layout as a skeleton instead of a bare message with an empty summary.
        // If the provider already holds lines (opened from the drawer), the bag renders below.
        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_360px] lg:gap-12" aria-busy="true">
          <p className="sr-only" role="status">
            Loading your bag…
          </p>
          <div aria-hidden="true">
            {[0, 1].map((i) => (
              <div key={i} className="flex gap-4 border-b border-ink/10 py-6">
                <div className="h-24 w-24 shrink-0 animate-pulse bg-cloud/60" />
                <div className="flex-1 space-y-3">
                  <div className="h-5 w-2/3 animate-pulse bg-cloud/60" />
                  <div className="h-4 w-1/2 animate-pulse bg-cloud/60" />
                </div>
              </div>
            ))}
          </div>
          <div aria-hidden="true" className="h-fit space-y-4 bg-cloud/40 p-6">
            <div className="h-12 w-full animate-pulse bg-cloud/70" />
            <div className="h-4 w-1/2 animate-pulse bg-cloud/70" />
            <div className="h-4 w-full animate-pulse bg-cloud/70" />
            <div className="h-4 w-full animate-pulse bg-cloud/70" />
            <div className="h-6 w-full animate-pulse bg-cloud/70" />
          </div>
        </div>
      ) : lines.length === 0 ? (
        <div className="mt-16 flex flex-col items-center gap-4 text-center">
          <p className="text-sm text-ink/70">Your bag is empty.</p>
          <Link
            href="/ritual"
            className="btn-press inline-block bg-ink px-8 py-3.5 text-[12px] uppercase tracking-[0.3em] text-ivory transition hover:bg-ochre"
          >
            Begin the Ritual
          </Link>
          <Link
            href="/shop"
            className="tap-area text-[12px] uppercase tracking-[0.18em] text-ochre underline underline-offset-4"
          >
            Continue shopping
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_360px] lg:gap-12">
          <section aria-label="Items in your bag">
            {/* Column heads on desktop only; on phones each row labels itself. */}
            <div className="hidden grid-cols-[1fr_230px_120px_72px] gap-6 border-b border-ink/15 pb-3 text-[11px] uppercase tracking-[0.16em] text-ink/65 lg:grid">
              <span>Product</span>
              <span>Plan</span>
              <span>Quantity</span>
              <span className="text-right">Total</span>
            </div>
            <div className="pt-4">
            </div>
            <ul>
              {lines.map((line) => (
                <li
                  key={line.id}
                  className="grid gap-4 border-b border-ink/10 py-6 lg:grid-cols-[1fr_230px_120px_72px] lg:items-center lg:gap-6"
                >
                  <div className="flex gap-4">
                    <div className="relative h-24 w-24 shrink-0 overflow-hidden bg-cloud/50">
                      <Image
                        src={line.product.image}
                        alt={line.product.name}
                        fill
                        sizes="96px"
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <Link
                        href={`/shop/${line.slug}`}
                        className="tap-area font-serif text-lg leading-tight hover:text-ochre"
                      >
                        {line.product.name}
                      </Link>
                      <p className="mt-1 text-[13px] text-ink/65">{line.product.descriptor}</p>
                      <button
                        type="button"
                        onClick={() => remove(line.slug)}
                        aria-label={`Remove ${line.product.name}`}
                        className="tap-area mt-2 text-[11px] uppercase tracking-[0.14em] text-ink/70 underline underline-offset-4 hover:text-ochre"
                      >
                        <span aria-hidden="true">Remove</span>
                      </button>
                    </div>
                  </div>
                  <PlanSelect line={line} />
                  <div className="flex items-center justify-between lg:contents">
                    <QuantityStepper line={line} />
                    <p className="tabular-nums font-serif text-xl lg:text-right">
                      ${line.unitPrice * line.qty}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
            <Link
              href="/shop"
              className="tap-area mt-6 inline-block text-[12px] uppercase tracking-[0.18em] text-ink/70 underline underline-offset-4 hover:text-ochre"
            >
              Continue shopping
            </Link>
          </section>

          <aside className="h-fit bg-cloud/40 p-6 lg:sticky lg:top-28" aria-label="Order summary">
            <Link
              href="/checkout"
              className="btn-press block w-full bg-ink py-4 text-center text-[12px] uppercase tracking-[0.25em] text-ivory transition hover:bg-ochre"
            >
              Checkout — ${total}
            </Link>
            <p className="mt-3 text-center text-[11px] text-ink/65">
              Secure payment, processed by Stripe.
            </p>

            <h2 className="mt-8 font-serif text-lg">Your order summary</h2>
            <dl className="tabular-nums mt-3 space-y-2 text-[14px]">
              <div className="flex justify-between">
                <dt>Subtotal</dt>
                <dd>${subtotal}</dd>
              </div>
              {savings > 0 && (
                <div className="flex justify-between text-ochre">
                  <dt>Ritual savings (applied)</dt>
                  <dd>−${savings}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt>Shipping</dt>
                <dd>{shipping === 0 ? "Complimentary" : `$${shipping}`}</dd>
              </div>
              <div className="flex justify-between border-t border-ink/15 pt-3 font-medium">
                <dt>Estimated total</dt>
                <dd className="font-serif text-xl">${total}</dd>
              </div>
            </dl>
            <p className="mt-3 text-[12px] leading-relaxed text-ink/65">
              Taxes are calculated at payment.
            </p>

            <div className="mt-6">
              <h2 className="sr-only">Additional information</h2>
              <InfoItem title="Shipping & handling">
                Made to order in Isola del Liri, Italy. Allow standard processing time before
                dispatch; shipping options and timing are shown at checkout. Shipping is
                complimentary on every order.
              </InfoItem>
              <InfoItem title="Payment & sales tax">
                You enter your card details on the next screen, securely processed by Stripe. Sales
                tax, where it applies, is calculated at payment.
              </InfoItem>
              <InfoItem title="Returns">
                90-Day Guarantee on your first order: if you are not satisfied, we refund the product
                price in full. No need to return the product; shipping is non-refundable.{" "}
                <Link
                  href="/terms#guarantee"
                  className="tap-area underline decoration-ink/30 hover:text-ochre"
                >
                  Read the terms
                </Link>
                .
              </InfoItem>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
