import EvidenceGrid from "@/components/EvidenceGrid";
import { products } from "@/lib/products";

import { FREE_FROM_SENTENCE, formulationLine } from "@/lib/formulation-line";

// N1 has no key ingredients on record yet, so it does not appear in the
// table. No percentages are shown: the site names key ingredients only.
const ingredientTable = products.flatMap((p) =>
  (p.actives ?? []).map((a) => ({
    product: p.name,
    ingredient: a.name,
  }))
);

const evidenceProducts = products.filter((p) =>
  ["chiarel-essence", "terra-radiance-creme", "recovery-masque"].includes(p.slug)
);

// The full formulation record, collapsed by default. It is a native <details>
// so every row stays in the server-rendered HTML (crawlers and answer
// engines read it) while keeping the page short for people.
export default function HomeFormulationRecord() {
  return (
    <section className="section-y bg-white" id="formulation-record">
      <div className="section-x">
        <p className="mb-8 max-w-2xl text-sm leading-relaxed text-ink/70" data-formulation-statement>
          {formulationLine()} {FREE_FROM_SENTENCE}
        </p>
        <details className="group border-y border-ink/10">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-6 font-serif text-2xl leading-snug text-ink md:text-3xl">
            <span>
              See the key ingredients
              <span className="mt-1 block font-sans text-[13px] leading-relaxed text-ink/65">
                Key ingredients by product.
              </span>
            </span>
            <span className="ml-4 shrink-0 text-xl text-ink/50 group-open:hidden" aria-hidden="true">+</span>
            <span className="ml-4 hidden shrink-0 text-xl text-ink/50 group-open:inline" aria-hidden="true">−</span>
          </summary>

          <div className="pb-12 pt-4">
            <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-start lg:gap-16">
              <div>
                <h2 className="font-serif text-3xl leading-snug">
                  What&rsquo;s Actually in CHIAREL™ Formulas?
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-ink/70">
                  The key ingredients behind each formula, named. Each product
                  page carries the detail.
                </p>
              </div>
              <EvidenceGrid products={evidenceProducts} />
            </div>

            <div className="mt-16">
              <h2 className="font-serif text-3xl leading-snug">
                Key Ingredients, by Product
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink/70">
                The key ingredients behind each formula across the House.
              </p>
              <div className="mt-8 overflow-x-auto">
                <table className="w-full min-w-[560px] border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-ink/20 text-[11px] uppercase tracking-[0.16em] text-ink/65">
                      <th className="py-3 pr-4 font-normal">Product</th>
                      <th className="py-3 font-normal">Key Ingredient</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ingredientTable.map((row, i) => (
                      <tr
                        key={`${row.product}-${row.ingredient}-${i}`}
                        className="border-b border-ink/10 transition-colors hover:bg-ochre/5"
                      >
                        <td className="py-3 pr-4 text-ink/80">{row.product}</td>
                        <td className="py-3 text-ink/70">{row.ingredient}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <ul className="mt-8 grid gap-3 sm:grid-cols-2">
                {products
                  .flatMap((p) => (p.benefits ?? []).map((b) => ({ product: p.name, benefit: b })))
                  .slice(0, 6)
                  .map((row, i) => (
                    <li key={i} className="flex items-start gap-3 text-[13px] leading-relaxed text-ink/70">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-ochre" aria-hidden="true" />
                      <span>
                        <span className="text-ink/65">{row.product}: </span>
                        {row.benefit}
                      </span>
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        </details>
      </div>
    </section>
  );
}
