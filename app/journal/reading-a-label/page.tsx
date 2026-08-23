import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Reading a Label Like the House Does",
  description:
    "Why CHIAREL uses outcome language instead of promise language, and how to tell the difference when reading any skincare label.",
  alternates: { canonical: "/journal/reading-a-label" },
};

const retired = [
  "Anti-Aging",
  "Age Defying",
  "Miracle",
  "Lift",
  "Wrinkle Repair",
  "Plump",
  "Glow",
];

export default function ReadingLabelPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <Link href="/journal" className="text-[12px] text-ink/50 hover:text-ochre">
        ← Journal
      </Link>
      <h1 className="mt-2 font-serif text-4xl leading-tight">
        Reading a Label Like the House Does
      </h1>

      <div className="mt-8 space-y-6 text-sm leading-relaxed text-ink/80">
        <p>
          Most skincare copy is written to be believed quickly. CHIAREL™
          copy is written to be checked. The distinction is a single
          question we ask of every sentence before it ships: does this
          describe what the formulation supports, or does it promise what
          the formulation cannot guarantee?
        </p>
        <p>
          <strong className="text-ink">Outcome language</strong> says a
          formulation <em>supports</em> or <em>optimizes</em> — it describes
          a mechanism doing its job.{" "}
          <strong className="text-ink">Promise language</strong> says a
          product <em>fixes</em>, <em>repairs</em>, or performs a{" "}
          <em>miracle</em> — it claims a guaranteed result no formulation,
          however well made, can ethically promise. We only use the first
          kind.
        </p>
        <p>
          This is also why age never appears in our customer-facing copy.
          Skin does not have a birthdate written into its biology — it has a
          barrier, a texture, a reactivity threshold. We write to that, not
          to a number.
        </p>

        <div className="border border-ink/10 bg-white/60 p-5">
          <p className="text-[11px] uppercase tracking-[0.16em] text-ink/50">
            Words you will not find on a CHIAREL label
          </p>
          <p className="mt-2 text-sm text-ink/70">{retired.join(" · ")}</p>
        </div>

        <p>
          One more habit worth knowing: CHIAREL never names an ingredient in
          a product title. A serum is named for what it does — CHIAREL
          Essence™, not &ldquo;Peptide Serum.&rdquo; The formulation science
          lives in the ingredient list and in pages like this one, where it
          can be examined properly, not compressed into a headline.
        </p>
      </div>

      <div className="mt-14 border-t border-ink/10 pt-8">
        <Link
          href="/science"
          className="border-b border-ochre pb-0.5 text-[12px] uppercase tracking-[0.16em] text-ochre"
        >
          Explore The Science
        </Link>
      </div>
    </div>
  );
}
