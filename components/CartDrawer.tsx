"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { ritualProducts } from "@/lib/products";

const modeLabel: Record<string, string> = {
  ninetyDay: "The Ritual Plan · 90-day supply, one delivery",
  subscription: "Subscription · every 45 days",
  oneTime: "One-time purchase",
};

// Keep in sync with FREE_SHIP_THRESHOLD / the $12 shipping charge in
// app/api/checkout/route.ts — this only estimates the checkout-button total,
// the API route is the actual source of truth for what gets charged.
const FREE_SHIP_THRESHOLD = 150;
const SHIPPING_COST = 12;

export default function CartDrawer() {
  const { lines, add, remove, setQty, isOpen, close, subtotal, savings } = useCart();
  const remainingForShipping = Math.max(0, FREE_SHIP_THRESHOLD - subtotal);
  const estimatedTotal =
    subtotal + (subtotal >= FREE_SHIP_THRESHOLD ? 0 : SHIPPING_COST);
  const savingsPercent =
    savings > 0 ? Math.round((savings / (subtotal + savings)) * 100) : 0;
  const nextStep = ritualProducts.find(
    (p) => !lines.some((line) => line.slug === p.slug)
  );

  return (
    <>
      <div
        className={`fixed inset-0 z-[60] bg-ink/40 transition-opacity ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={close}
      />
      <aside
        className={`cart-panel fixed right-0 top-0 z-[70] flex h-full w-full max-w-md flex-col bg-ivory shadow-2xl transition-transform ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-ink/10 px-6 py-5">
          <p className="font-serif text-xl">Your Ritual Bag</p>
          <button
            onClick={close}
            aria-label="Close cart"
            className="text-xl text-ink/50 hover:text-ink"
          >
            ×
          </button>
        </div>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            <p className="text-sm text-ink/60">Your bag is empty.</p>
            <Link
              href="/ritual"
              onClick={close}
              className="border-b border-ochre pb-0.5 text-[12px] uppercase tracking-[0.18em] text-ochre"
            >
              Begin the Ritual
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {remainingForShipping > 0 ? (
                <p className="mb-4 text-[12px] text-ink/60">
                  Add ${remainingForShipping} more for complimentary shipping.
                </p>
              ) : (
                <p className="mb-4 text-[12px] text-ochre">
                  Complimentary shipping unlocked.
                </p>
              )}
              <ul className="space-y-5">
                {lines.map((line) => (
                  <li key={line.slug} className="flex gap-4">
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-sm bg-cloud/50">
                      <Image
                        src={line.product.image}
                        alt={line.product.name}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium leading-tight">
                        {line.product.name}
                      </p>
                      <p className="mt-0.5 text-[11px] uppercase tracking-[0.14em] text-ink/50">
                        {modeLabel[line.mode]}
                      </p>
                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center rounded-sm border border-ink/15">
                            <button
                              onClick={() => setQty(line.id, line.qty - 1)}
                              disabled={line.qty <= 1}
                              aria-label={`Decrease quantity of ${line.product.name}`}
                              className="btn-press flex h-7 w-7 items-center justify-center text-sm text-ink/60 transition hover:text-ochre disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:text-ink/60"
                            >
                              −
                            </button>
                            <span className="tabular-nums w-6 text-center text-[13px]">
                              {line.qty}
                            </span>
                            <button
                              onClick={() => setQty(line.id, line.qty + 1)}
                              aria-label={`Increase quantity of ${line.product.name}`}
                              className="btn-press flex h-7 w-7 items-center justify-center text-sm text-ink/60 transition hover:text-ochre"
                            >
                              +
                            </button>
                          </div>
                          <span className="tabular-nums text-sm text-ink/50">
                            × ${line.unitPrice}
                          </span>
                        </div>
                        <button
                          onClick={() => remove(line.slug)}
                          className="text-[11px] uppercase tracking-[0.14em] text-ink/40 hover:text-ochre"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              {nextStep && (
                <div className="mt-6 border-t border-ink/10 pt-5">
                  <p className="mb-3 text-[11px] uppercase tracking-[0.16em] text-ink/50">
                    Complete the Ritual
                  </p>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-sm bg-cloud/50">
                      <Image
                        src={nextStep.image}
                        alt={nextStep.name}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium leading-tight">
                        {nextStep.name}
                      </p>
                      <p className="mt-0.5 truncate text-[11px] uppercase tracking-[0.14em] text-ink/50">
                        {nextStep.step}
                      </p>
                    </div>
                    <button
                      onClick={() => add(nextStep.slug, "subscription")}
                      className="btn-press w-full shrink-0 border border-ink/20 px-3 py-2 text-[11px] uppercase tracking-[0.14em] text-ink/70 transition hover:border-ochre hover:text-ochre sm:w-auto"
                    >
                      Add · ${nextStep.price.subscription}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-ink/10 px-6 py-5">
              {savings > 0 && (
                <p className="tabular-nums mb-2 flex justify-between text-[12px] text-ochre">
                  <span>Ritual savings</span>
                  <span>
                    −${savings} ({savingsPercent}%)
                  </span>
                </p>
              )}
              <p className="tabular-nums mb-4 flex justify-between text-base">
                <span>Subtotal</span>
                <span className="font-serif text-xl">${subtotal}</span>
              </p>
              <p className="mb-3 text-center text-[11px] uppercase tracking-[0.14em] text-ink/45">
                Clinically dosed · every active disclosed
              </p>
              <Link
                href="/checkout"
                onClick={close}
                className="btn-press block w-full bg-ink py-4 text-center text-[12px] uppercase tracking-[0.25em] text-ivory transition hover:bg-ochre"
              >
                Checkout — ${estimatedTotal}
              </Link>
              <p className="mt-3 text-center text-[11px] text-ink/50">
                Two complimentary samples included with every order.
              </p>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
