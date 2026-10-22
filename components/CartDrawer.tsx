"use client";

import { MAX_LINE_QTY } from "@/lib/cart-limits";
import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { useDialog } from "@/lib/use-dialog";
import { ritualProducts } from "@/lib/products";
import { shippingFor, shippingNote } from "@/lib/shipping";
import { pickUpsell } from "@/lib/cart-math";

const modeLabel: Record<string, string> = {
  ninetyDay: "90-day plan · one delivery",
  subscription: "Subscription · every 45 days",
  oneTime: "One-time purchase",
};

export default function CartDrawer() {
  const { lines, add, remove, setQty, isOpen, close, subtotal, savings } = useCart();
  const panelRef = useRef<HTMLElement>(null);
  useDialog(isOpen, panelRef, close);
  const shipping = shippingFor(subtotal, lines);
  const estimatedTotal = subtotal + shipping;
  const savingsPercent =
    savings > 0 ? Math.round((savings / (subtotal + savings)) * 100) : 0;
  const nextStep = pickUpsell(ritualProducts, lines);

  return (
    <>
      <div
        className={`fixed inset-0 z-[60] bg-ink/40 transition-opacity ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={close}
        aria-hidden="true"
      />
      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Your Ritual Bag"
        className={`cart-panel fixed right-0 top-0 z-[70] flex h-full w-full max-w-md flex-col bg-ivory transition-transform ${
          isOpen ? "translate-x-0 shadow-2xl" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-ink/10 px-6 py-5">
          <p className="font-serif text-xl">Your Ritual Bag</p>
          <button
            onClick={close}
            aria-label="Close bag"
            className="btn-press -mr-3 flex h-11 w-11 items-center justify-center text-xl text-ink/65 hover:text-ink"
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
              className="tap-area border-b border-ochre pb-0.5 text-[12px] uppercase tracking-[0.18em] text-ochre"
            >
              Begin the Ritual
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <p className={`mb-4 text-[12px] ${shipping === 0 ? "text-ochre" : "text-ink/60"}`}>
                {shippingNote(subtotal, lines)}
              </p>
              <ul className="space-y-5">
                {lines.map((line) => (
                  <li key={line.slug} className="flex gap-4">
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden bg-cloud/50">
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
                      <p className="mt-0.5 text-[11px] uppercase tracking-[0.14em] text-ink/65">
                        {modeLabel[line.mode]}
                      </p>
                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center rounded-sm border border-ink/15">
                            <button
                              onClick={() => setQty(line.id, line.qty - 1)}
                              disabled={line.qty <= 1}
                              aria-label={`Decrease quantity of ${line.product.name}`}
                              className="btn-press tap-area flex h-7 w-7 items-center justify-center text-sm text-ink/60 transition hover:text-ochre disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:text-ink/60"
                            >
                              −
                            </button>
                            <span className="tabular-nums w-6 text-center text-[13px]">
                              {line.qty}
                            </span>
                            <button
                              onClick={() => setQty(line.id, line.qty + 1)}
                              disabled={line.qty >= MAX_LINE_QTY}
                              aria-label={`Increase quantity of ${line.product.name}`}
                              className="btn-press tap-area flex h-7 w-7 items-center justify-center text-sm text-ink/60 transition hover:text-ochre"
                            >
                              +
                            </button>
                          </div>
                          <span className="tabular-nums text-sm text-ink/65">
                            × ${line.unitPrice}
                          </span>
                        </div>
                        <button
                          onClick={() => remove(line.slug)}
                          aria-label={`Remove ${line.product.name}`}
                          className="tap-area text-[11px] uppercase tracking-[0.14em] text-ink/65 hover:text-ochre"
                        >
                          <span aria-hidden="true">Remove</span>
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              {nextStep && (
                <div className="mt-6 border-t border-ink/10 pt-5">
                  <p className="mb-3 text-[11px] uppercase tracking-[0.16em] text-ink/65">
                    Complete the Ritual
                  </p>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden bg-cloud/50">
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
                      <p className="mt-0.5 truncate text-[11px] uppercase tracking-[0.14em] text-ink/65">
                        {nextStep.step}
                      </p>
                      <p className="mt-0.5 text-[11px] text-ink/50">
                        Subscription · renews every 45 days
                      </p>
                    </div>
                    <button
                      onClick={() => add(nextStep.slug, "subscription")}
                      className="btn-press min-h-[44px] w-full shrink-0 border border-ink/20 px-3 py-2 text-[11px] uppercase tracking-[0.14em] text-ink/70 transition hover:border-ochre hover:text-ochre sm:w-auto"
                    >
                      Subscribe · ${nextStep.price!.subscription}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-ink/10 px-6 py-5">
              {savings > 0 && (
                <p className="tabular-nums mb-2 flex justify-between text-[12px] text-ochre">
                  <span>Ritual savings (already applied)</span>
                  <span>
                    −${savings} ({savingsPercent}%)
                  </span>
                </p>
              )}
              <p className="tabular-nums mb-2 flex justify-between text-[13px]">
                <span>Subtotal</span>
                <span>${subtotal}</span>
              </p>
              <p className="tabular-nums mb-2 flex justify-between text-[13px]">
                <span>Shipping</span>
                <span>{shipping === 0 ? "Complimentary" : `$${shipping}`}</span>
              </p>
              <p className="tabular-nums mb-4 flex justify-between border-t border-ink/10 pt-3 text-base">
                <span>Estimated total</span>
                <span className="font-serif text-xl">${estimatedTotal}</span>
              </p>
              {/* N1 has no testing or ingredient record yet (see its product page), so the line is not shown for a bag that contains it. */}
              {!lines.some((l) => l.slug === "n1-neck-decollete") && (
                <p className="mb-3 text-center text-[11px] uppercase tracking-[0.14em] text-ink/65">
                  Customer-tested · key ingredients named
                </p>
              )}
              <Link
                href="/cart"
                onClick={close}
                className="flex min-h-[44px] items-center justify-center text-center text-[11px] uppercase tracking-[0.14em] text-ink/80 underline decoration-ink/30 underline-offset-2 hover:text-ochre"
              >
                View bag
              </Link>
              <Link
                href="/terms#guarantee"
                onClick={close}
                className="flex min-h-[44px] items-center justify-center text-center text-[11px] uppercase tracking-[0.14em] text-ink/65 underline decoration-ink/20 underline-offset-2 hover:text-ochre"
              >
                90-Day Guarantee on your first order
              </Link>
              <Link
                href="/checkout"
                onClick={close}
                className="btn-press block w-full bg-ink py-4 text-center text-[12px] uppercase tracking-[0.25em] text-ivory transition hover:bg-ochre"
              >
                Checkout — ${estimatedTotal}
              </Link>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
