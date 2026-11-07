"use client";

import { MAX_LINE_QTY } from "@/lib/cart-limits";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart, type CartLine } from "@/lib/cart-context";
import { productHref } from "@/lib/products";
import { shippingFor } from "@/lib/shipping";
import { track } from "@/lib/analytics";
import PlanSelect from "@/components/PlanSelect";
import { CTA } from "@/lib/plan-labels";

// The bag as its own page: one row per product with a plan selector, and a
// summary panel beside it. Same numbers as the drawer and /checkout (shared
// pricing and shipping code); payment itself is still hosted by Stripe.

function QuantityStepper({ line }: { line: CartLine }) {
  const { setQty } = useCart();
  return (
    <div className="inline-flex items-center border border-ink/15">
      <button
        type="button"
        onClick={() => setQty(line.id, line.qty - 1)}
        disabled={line.qty <= 1}
        aria-label={`Decrease quantity of ${line.product.name}`}
        className="btn-press flex h-11 w-11 items-center justify-center text-base text-ink transition hover:text-ochre disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:text-ink/70"
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
        className="btn-press flex h-11 w-11 items-center justify-center text-base text-ink transition hover:text-ochre disabled:cursor-not-allowed disabled:opacity-30"
      >
        +
      </button>
    </div>
  );
}

function InfoItem({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <details className="group border-t border-ink/10 py-1">
      <summary className="flex min-h-[44px] cursor-pointer list-none items-center justify-between text-eyebrow uppercase text-ink">
        {title}
        <span className="ml-4 text-lg text-ink group-open:hidden" aria-hidden="true">+</span>
        <span className="ml-4 hidden text-lg text-ink group-open:inline" aria-hidden="true">−</span>
      </summary>
      <div className="pb-3 text-[13px] leading-relaxed text-ink">{children}</div>
    </details>
  );
}

export default function CartPageContent() {
  const { lines, remove, subtotal, savings, count, loading } = useCart();
  const shipping = shippingFor(subtotal, lines);
  const total = subtotal + shipping;

  // On a phone the summary sits below every item, which can be a long scroll.
  // While it is off screen a docked total and Checkout button stay reachable;
  // once the real summary scrolls into view the dock steps aside.
  const summaryRef = useRef<HTMLElement>(null);
  const [summaryInView, setSummaryInView] = useState(true);
  const hasLines = lines.length > 0;

  // view_cart: once per visit to the bag page, when the bag first has items.
  const viewedCart = useRef(false);
  useEffect(() => {
    if (viewedCart.current || !hasLines) return;
    viewedCart.current = true;
    track("view_cart", {
      currency: "USD",
      value: subtotal,
      items: lines.map((l) => ({
        item_id: l.slug,
        item_name: l.product.name,
        price: l.unitPrice,
        quantity: l.qty,
      })),
    });
  }, [hasLines, lines, subtotal]);
  useEffect(() => {
    const el = summaryRef.current;
    if (!hasLines || !el || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => setSummaryInView(entry.isIntersecting));
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasLines]);

  return (
    <div className="mx-auto w-full max-w-container px-margin py-10 md:py-14">
      <h1 className="text-center font-serif text-3xl md:text-h1">
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
      ) : (
        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_360px] lg:gap-12">
          {/* Below lg the summary and the Checkout button come first (order-1), so
              they are on the first screen instead of after every item; the
              guidance blocks follow the items (order-3). DOM order is items,
              summary, guidance, which is the right keyboard order on desktop
              where the two columns sit side by side. */}
          <section aria-label="Items in your bag" className="order-2 lg:order-none">
            {/* Column heads on desktop only; on phones each row labels itself. */}
            <div className="hidden grid-cols-[1fr_230px_120px_72px] gap-6 border-b border-ink/15 pb-3 text-eyebrow uppercase text-ink lg:grid">
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
                        href={productHref(line.slug)}
                        className="tap-area font-serif text-lg leading-tight hover:text-ochre"
                      >
                        {line.product.name}
                      </Link>
                      <p className="mt-1 text-[13px] text-ink">{line.product.descriptor}</p>
                      <button
                        type="button"
                        onClick={() => remove(line.slug)}
                        aria-label={`Remove ${line.product.name}`}
                        className="tap-area mt-2 text-eyebrow uppercase text-ink underline underline-offset-4 hover:text-ochre"
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
              className="tap-area mt-6 inline-block text-eyebrow uppercase text-ink underline underline-offset-4 hover:text-ochre"
            >
              Continue shopping
            </Link>
          </section>

          <aside
            ref={summaryRef}
            className="order-1 h-fit bg-cloud/40 p-6 lg:order-none lg:sticky lg:top-28"
            aria-label="Order summary"
          >
            <Link
              href="/checkout"
              className="btn-press block w-full bg-ink py-4 text-center text-eyebrow uppercase text-ivory transition hover:bg-ochre"
            >
              {CTA.bag} — ${total}
            </Link>
            <p className="mt-3 text-center text-[12px] text-ink">
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
            <p className="mt-3 text-[12px] leading-relaxed text-ink">
              Taxes are calculated at payment.
            </p>

            {/* On desktop the guidance sits under the summary; on phones it is
                rendered after the items instead (below), so only one is shown. */}
            <div className="mt-6 hidden lg:block">
              <BagGuidance />
            </div>
          </aside>
          <div className="order-3 lg:hidden">
            <BagGuidance />
          </div>
        </div>
      )}

      {hasLines && !summaryInView && (
        <div
          data-testid="bag-dock"
          className="fixed inset-x-0 bottom-0 z-40 border-t border-ink/10 bg-ivory/95 px-margin py-3 backdrop-blur lg:hidden"
        >
          <div className="mx-auto flex max-w-container items-center gap-4">
            <p className="tabular-nums min-w-0 flex-1 text-[13px]">
              <span className="block text-[12px] text-ink">Estimated total</span>
              <span className="font-serif text-xl">${total}</span>
            </p>
            <Link
              href="/checkout"
              className="btn-press flex min-h-[44px] items-center whitespace-nowrap bg-ink px-8 text-eyebrow uppercase text-ivory transition hover:bg-ochre"
            >
              {CTA.bag}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

// Shipping, payment and returns guidance. Rendered once on desktop (inside the
// summary) and once on phones (after the items); `hidden` removes the other copy
// from the accessibility tree, so a screen reader meets it once.
function BagGuidance() {
  return (
    <div>
      <h2 className="sr-only">Additional information</h2>
      <InfoItem title="Shipping & handling">
        Made to order in Isola del Liri, Italy. Allow standard processing time before dispatch;
        shipping options and timing are shown at checkout. Shipping is complimentary on every
        order.
      </InfoItem>
      <InfoItem title="Payment & sales tax">
        You enter your card details on the next screen, securely processed by Stripe. Sales tax,
        where it applies, is calculated at payment.
      </InfoItem>
      <InfoItem title="Returns">
        90-Day Guarantee on your first order: if you are not satisfied, we refund the product price
        in full. No need to return the product; shipping is non-refundable.{" "}
        <Link href="/terms#guarantee" className="tap-area underline decoration-ink/30 hover:text-ochre">
          Read the terms
        </Link>
        .
      </InfoItem>
    </div>
  );
}
