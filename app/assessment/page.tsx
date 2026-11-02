"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { QUESTIONS, scoreAxes, recommend } from "@/lib/skin-assessment";
import { getProduct, productHref } from "@/lib/products";
import { useCart } from "@/lib/cart-context";
import { NEUTRAL_FRAME_BG } from "@/lib/color";
import { track } from "@/lib/analytics";

export default function AssessmentPage() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const { add } = useCart();

  const done = step >= QUESTIONS.length;
  const q = QUESTIONS[step];

  useEffect(() => {
    if (!done) return;
    track("assessment_complete", {
      recommended: recommend(scoreAxes(answers)).recommendations.map((r) => r.slug),
    });
    // Fire once when the quiz completes, not on later answer-state changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  const choose = (value: number) => {
    setAnswers((a) => ({ ...a, [q.id]: value }));
    setStep((s) => s + 1);
  };

  if (done) {
    const axisScores = scoreAxes(answers);
    const { recommendations } = recommend(axisScores);

    return (
      <div className="mx-auto w-full max-w-3xl px-margin py-16">
        <h1 className="font-serif text-h1">Your Results</h1>
        <p className="mt-3 max-w-xl text-sm text-ink/70">
          Based on a four-axis dermatological framework (barrier &amp; sebum,
          reactivity, pigment tendency, structural resilience), here is what
          your answers indicate.
        </p>

        <dl className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {axisScores.map((a) => (
            <div key={a.axis} className="card-elevated rounded-md bg-white p-3 text-center">
              <dt className="text-eyebrow uppercase text-ink/65">
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
                  className="relative h-32 w-32 shrink-0 overflow-hidden"
                  style={{ backgroundColor: NEUTRAL_FRAME_BG }}
                >
                  <Image src={p.image} alt={p.name} fill sizes="128px" className="object-cover" />
                </div>
                <div className="flex-1">
                  <p className="font-serif text-xl">{p.name}</p>
                  <p className="mt-1 max-w-md text-sm text-ink/70">{r.reason}</p>
                  <div className="mt-3 flex items-center gap-4">
                    <Link
                      href={productHref(p.slug)}
                      className="tabular-nums border-b border-ochre pb-0.5 text-eyebrow uppercase text-ochre"
                    >
                      View — ${p.price!.subscription} with subscription
                    </Link>
                    <button
                      onClick={() => add(p.slug, "subscription")}
                      className="border border-ink px-5 py-2 text-eyebrow uppercase transition hover:border-ochre hover:text-ochre"
                    >
                      Add to Bag
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={() => {
            setAnswers({});
            setStep(0);
          }}
          className="mt-12 text-eyebrow uppercase text-ink/65 hover:text-ink"
        >
          Retake the Assessment
        </button>

        <p className="mt-10 text-[12px] text-ink/65">
          This assessment is adapted from the Baumann Skin Type Indicator, a
          published dermatological framework, for educational and product-fit
          purposes. It does not diagnose skin conditions.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <p className="text-sm text-ink/65">CHIAREL Skin Assessment™</p>
      <div className="mt-2 flex items-center gap-3">
        <div className="h-px flex-1 bg-ink/10">
          <div
            className="h-px bg-ochre transition-[width] duration-300 ease-out"
            style={{ width: `${(step / QUESTIONS.length) * 100}%` }}
          />
        </div>
        <span className="text-[12px] text-ink/65">
          {step + 1} / {QUESTIONS.length}
        </span>
      </div>

      <h1 className="mt-8 font-serif text-3xl leading-snug">{q.prompt}</h1>
      <p className="mt-2 text-[12px] italic text-ink/65">Why we ask: {q.why}</p>

      <div className="mt-8 space-y-3">
        {q.options.map((opt) => (
          <button
            key={opt.label}
            onClick={() => choose(opt.value)}
            className="btn-press block w-full border border-ink/15 px-5 py-4 text-left text-sm transition hover:border-ochre hover:bg-white"
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
