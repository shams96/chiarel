"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { QUESTIONS, scoreAxes, recommend } from "@/lib/skin-assessment";
import { getProduct } from "@/lib/products";
import { useCart } from "@/lib/cart-context";
import { productTint } from "@/lib/color";

export default function AssessmentPage() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const { add } = useCart();

  const done = step >= QUESTIONS.length;
  const q = QUESTIONS[step];

  const choose = (value: number) => {
    setAnswers((a) => ({ ...a, [q.id]: value }));
    setStep((s) => s + 1);
  };

  if (done) {
    const axisScores = scoreAxes(answers);
    const { recommendations, bundleEligible } = recommend(axisScores);

    return (
      <div className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="font-serif text-4xl">Your Results</h1>
        <p className="mt-3 max-w-xl text-sm text-ink/70">
          Based on a four-axis dermatological framework (barrier &amp; sebum,
          reactivity, pigment tendency, structural resilience), here is what
          your answers indicate.
        </p>

        <dl className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {axisScores.map((a) => (
            <div key={a.axis} className="card-elevated rounded-md bg-white p-3 text-center">
              <dt className="text-[10px] uppercase tracking-[0.14em] text-ink/50">
                {a.axis}
              </dt>
              <dd className="mt-1 font-serif text-lg">{a.pole}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-12 space-y-8">
          <h2 className="font-serif text-xl">Recommended for you</h2>
          {recommendations.map((r) => {
            const p = getProduct(r.slug);
            if (!p) return null;
            return (
              <div key={r.slug} className="flex flex-col gap-5 sm:flex-row sm:items-center">
                <div
                  className="relative h-32 w-32 shrink-0 overflow-hidden rounded-sm"
                  style={{ backgroundColor: productTint(p.color.hex) }}
                >
                  <Image src={p.image} alt={p.name} fill sizes="128px" className="object-cover" />
                </div>
                <div className="flex-1">
                  <p className="font-serif text-xl">{p.name}</p>
                  <p className="mt-1 max-w-md text-sm text-ink/70">{r.reason}</p>
                  <div className="mt-3 flex items-center gap-4">
                    <Link
                      href={`/shop/${p.slug}`}
                      className="tabular-nums border-b border-ochre pb-0.5 text-[12px] uppercase tracking-[0.16em] text-ochre"
                    >
                      View — ${p.price.subscription} with subscription
                    </Link>
                    <button
                      onClick={() => add(p.slug, "subscription")}
                      className="border border-ink px-5 py-2 text-[11px] uppercase tracking-[0.16em] transition hover:border-ochre hover:text-ochre"
                    >
                      Add to Bag
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {bundleEligible && (
            <div className="border border-champagne bg-champagne/10 p-5">
              <p className="text-[11px] uppercase tracking-[0.16em] text-ochre">
                Two needs identified
              </p>
              <p className="mt-1 text-sm text-ink/70">
                Your results point to more than one concern. The Founding Pair
                delivers both recommended treatments together, every 45 days.
              </p>
              <Link
                href="/shop/the-founding-pair"
                className="mt-3 inline-block border-b border-ochre pb-0.5 text-[12px] uppercase tracking-[0.16em] text-ochre"
              >
                View The Founding Pair — ${getProduct("the-founding-pair")!.price.subscription}
              </Link>
            </div>
          )}
        </div>

        <button
          onClick={() => {
            setAnswers({});
            setStep(0);
          }}
          className="mt-12 text-[11px] uppercase tracking-[0.16em] text-ink/40 hover:text-ink"
        >
          Retake the Assessment
        </button>

        <p className="mt-10 text-[11px] text-ink/45">
          This assessment is adapted from the Baumann Skin Type Indicator, a
          published dermatological framework, for educational and product-fit
          purposes. It does not diagnose skin conditions.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <p className="text-sm text-ink/50">CHIAREL Skin Assessment™</p>
      <div className="mt-2 flex items-center gap-3">
        <div className="h-px flex-1 bg-ink/10">
          <div
            className="h-px bg-ochre transition-all"
            style={{ width: `${(step / QUESTIONS.length) * 100}%` }}
          />
        </div>
        <span className="text-[11px] text-ink/40">
          {step + 1} / {QUESTIONS.length}
        </span>
      </div>

      <h1 className="mt-8 font-serif text-3xl leading-snug">{q.prompt}</h1>
      <p className="mt-2 text-[12px] italic text-ink/50">Why we ask: {q.why}</p>

      <div className="mt-8 space-y-3">
        {q.options.map((opt) => (
          <button
            key={opt.label}
            onClick={() => choose(opt.value)}
            className="block w-full border border-ink/15 px-5 py-4 text-left text-sm transition hover:border-ochre hover:bg-white"
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
