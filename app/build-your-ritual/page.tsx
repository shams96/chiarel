"use client";

import { useState } from "react";
import Image from "next/image";
import { ritualProducts } from "@/lib/products";
import { productTint } from "@/lib/color";
import { useCart, unitPrice } from "@/lib/cart-context";

export default function BuildYourRitualPage() {
  const { add } = useCart();
  const [selected, setSelected] = useState<Set<string>>(
    new Set(ritualProducts.map((p) => p.slug))
  );
  const [adding, setAdding] = useState(false);

  const toggle = (slug: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  };

  const chosen = ritualProducts.filter((p) => selected.has(p.slug));
  const subtotal = chosen.reduce(
    (sum, p) => sum + unitPrice(p, "subscription"),
    0
  );

  const handleAdd = async () => {
    if (chosen.length === 0 || adding) return;
    setAdding(true);
    for (const p of chosen) {
      await add(p.slug, "subscription");
    }
    setAdding(false);
  };

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="max-w-2xl font-serif text-4xl leading-tight">
        Build Your Ritual
      </h1>
      <p className="mt-4 max-w-xl text-sm text-ink/70">
        Choose exactly the steps your skin needs. Each is priced and
        delivered on its own — nothing is bundled into a set price, so what
        you leave out costs you nothing.
      </p>

      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ritualProducts.map((p) => {
          const isSelected = selected.has(p.slug);
          return (
            <button
              key={p.slug}
              onClick={() => toggle(p.slug)}
              aria-pressed={isSelected}
              className={`flex flex-col items-start gap-3 rounded-sm border p-4 text-left transition ${
                isSelected
                  ? "border-ochre bg-ochre/5"
                  : "border-ink/15 hover:border-ink/30"
              }`}
            >
              <div
                className="relative aspect-square w-full overflow-hidden"
                style={{ backgroundColor: productTint(p.color.hex) }}
              >
                <Image
                  src={p.image}
                  alt={p.name}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover"
                />
                <div
                  className={`absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full border text-[11px] ${
                    isSelected
                      ? "border-ochre bg-ochre text-ivory"
                      : "border-ink/30 bg-ivory/80 text-transparent"
                  }`}
                  aria-hidden="true"
                >
                  ✓
                </div>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.14em] text-ink/40">
                  Step {p.ritualOrder} · {p.step}
                </p>
                <p className="mt-1 text-sm font-medium leading-tight">
                  {p.name}
                </p>
                <p className="mt-1 text-sm text-ink/50">
                  ${p.price.subscription} with subscription
                </p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="sticky bottom-6 mt-12 flex flex-col items-center gap-3 rounded-sm border border-ink/15 bg-ivory/95 p-6 shadow-lg backdrop-blur sm:flex-row sm:justify-between">
        <p className="text-sm">
          <span className="font-medium">
            {chosen.length} {chosen.length === 1 ? "step" : "steps"} selected
          </span>
          <span className="ml-2 text-ink/50">
            · ${subtotal} every 45 days
          </span>
        </p>
        <button
          onClick={handleAdd}
          disabled={chosen.length === 0 || adding}
          className="btn-press w-full bg-ink px-8 py-3 text-center text-[12px] uppercase tracking-[0.25em] text-ivory transition hover:bg-ochre disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
        >
          {adding ? "Adding…" : "Add to Bag"}
        </button>
      </div>
    </div>
  );
}
