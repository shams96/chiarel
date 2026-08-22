"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";

const modeLabel: Record<string, string> = {
  ninetyDay: "The Ritual Plan · two deliveries",
  subscription: "Subscription · every 45 days",
  oneTime: "One-time purchase",
};

const FREE_SHIP_THRESHOLD = 150;

export default function CartDrawer() {
  const { lines, remove, isOpen, close, subtotal, savings } = useCart();
  const remaining = Math.max(0, FREE_SHIP_THRESHOLD - subtotal);

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
              {remaining > 0 ? (
                <p className="mb-4 text-[12px] text-ink/60">
                  Add ${remaining} more for complimentary shipping.
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
                        <span className="text-sm">
                          {line.qty} × ${line.unitPrice}
                        </span>
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
            </div>

            <div className="border-t border-ink/10 px-6 py-5">
              {savings > 0 && (
                <p className="mb-2 flex justify-between text-[12px] text-ochre">
                  <span>Ritual savings</span>
                  <span>−${savings}</span>
                </p>
              )}
              <p className="mb-4 flex justify-between text-base">
                <span>Subtotal</span>
                <span className="font-serif text-xl">${subtotal}</span>
              </p>
              <Link
                href="/checkout"
                onClick={close}
                className="btn-press block w-full bg-ink py-4 text-center text-[12px] uppercase tracking-[0.25em] text-ivory transition hover:bg-ochre"
              >
                Checkout
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
