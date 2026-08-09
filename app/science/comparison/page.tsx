import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "How CHIAREL Compares — CHIAREL™",
  description:
    "A factual comparison of CHIAREL™ against La Mer, Augustinus Bader, Dr. Barbara Sturm, SkinCeuticals, and La Prairie on price, dosage transparency, provenance, and subscription policy.",
  alternates: { canonical: "/science/comparison" },
};

type Row = {
  label: string;
  chiarel: string;
  competitors: string[];
};

const serumTable = {
  title: "The Signature Serum",
  columns: [
    "CHIAREL Essence™",
    "SkinCeuticals C E Ferulic",
    "Dr. Barbara Sturm Hyaluronic Serum",
    "La Prairie Skin Caviar Liquid Lift",
  ],
  rows: [
    {
      label: "Price",
      values: [
        "$116 with subscription · $145 one-time (30 ml)",
        "~$185 (30 ml)",
        "~$320 (30 ml)",
        "~$545 (30 ml)",
      ],
    },
    {
      label: "Active concentrations disclosed",
      values: [
        "Yes — Palmitoyl Pentapeptide-4 at 3%, Bioactive Ferment Lysate at 0.30%, published on the product page",
        "Not published",
        "Not published",
        "Not published",
      ],
    },
    {
      label: "Manufacturing partner named",
      values: [
        "Yes — Natural You Srl, Isola del Liri, Italy",
        "Not published",
        "Not published",
        "Not published",
      ],
    },
    {
      label: "Subscription policy",
      values: [
        "Pause or adjust anytime, no lock-in",
        "No subscription program",
        "No subscription program",
        "No subscription program",
      ],
    },
  ],
};

const cremeTable = {
  title: "The Daily Crème",
  columns: [
    "Terra Radiance Crème™",
    "La Mer Rejuvenating Night Cream",
    "Augustinus Bader The Rich Cream",
  ],
  rows: [
    {
      label: "Price",
      values: [
        "$126 with subscription · $158 one-time (50 g)",
        "$450 (0.5 oz) · price scales with size",
        "~$315 (50 ml)",
      ],
    },
    {
      label: "Active concentrations disclosed",
      values: [
        "Yes — Ceramide NP at 0.8%, Niacinamide at 3.0%, published on the product page",
        "Not published",
        "Not published",
      ],
    },
    {
      label: "Manufacturing partner named",
      values: [
        "Yes — Natural You Srl, Isola del Liri, Italy",
        "Not published",
        "Not published",
      ],
    },
    {
      label: "Subscription policy",
      values: [
        "Pause or adjust anytime, no lock-in",
        "No subscription program",
        "No subscription program",
      ],
    },
  ],
};

function ComparisonTable({
  table,
}: {
  table: {
    title: string;
    columns: string[];
    rows: { label: string; values: string[] }[];
  };
}) {
  return (
    <div className="mt-14">
      <h2 className="font-serif text-2xl">{table.title}</h2>
      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-left text-[13px]">
          <thead>
            <tr>
              <th className="w-40 border-b border-ink/15 pb-3 pr-4 text-[11px] uppercase tracking-[0.14em] text-ink/50">
                &nbsp;
              </th>
              {table.columns.map((col, i) => (
                <th
                  key={col}
                  className={`border-b pb-3 pr-6 align-bottom font-serif text-base font-normal ${
                    i === 0
                      ? "border-ochre text-ochre"
                      : "border-ink/15 text-ink/70"
                  }`}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row) => (
              <tr key={row.label} className="border-b border-ink/10">
                <th
                  scope="row"
                  className="py-4 pr-4 align-top text-[12px] font-medium uppercase tracking-[0.08em] text-ink/50"
                >
                  {row.label}
                </th>
                {row.values.map((v, i) => (
                  <td
                    key={i}
                    className={`py-4 pr-6 align-top leading-relaxed ${
                      i === 0 ? "text-ink" : "text-ink/65"
                    }`}
                  >
                    {v}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function ComparisonPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <p className="eyebrow">The Science</p>
      <h1 className="mt-2 font-serif text-4xl leading-tight">
        How CHIAREL Compares
      </h1>
      <p className="mt-5 max-w-2xl text-sm leading-relaxed text-ink/75">
        Luxury skincare is rarely sold with its facts visible. Prices are
        listed; formulation detail, manufacturing origin, and subscription
        terms often are not. Below is a plain comparison of CHIAREL™ against
        houses whose products occupy a comparable role in a daily ritual —
        the concentrations, the provenance, and the policy, side by side.
        Nothing here is a claim about which formulation performs better;
        efficacy is not something either house can verify for the other.
      </p>

      <ComparisonTable table={serumTable} />
      <ComparisonTable table={cremeTable} />

      <div className="mt-14 max-w-2xl border-t border-ink/10 pt-10">
        <h2 className="font-serif text-2xl">A Different Kind of Authority</h2>
        <p className="mt-3 text-sm leading-relaxed text-ink/70">
          Mass-market brands talk about the ingredient. Clinical brands
          compete on efficacy claims alone. CHIAREL formulates for a third
          thing: explaining the mechanism, disclosing the dose, and
          delivering it inside a lipid/occlusive vehicle designed for
          sustained release. Ingredients like Bifida Ferment Lysate and
          L-Ornithine are established, industry-wide INCI names — CHIAREL
          does not claim exclusivity over them. What we describe and stand
          behind is our formulation approach and the outcomes it is
          designed to support.{" "}
          <Link href="/science/synergy" className="border-b border-ochre text-ochre">
            See the full synergy
          </Link>
          .
        </p>
      </div>

      <div className="mt-14 max-w-2xl border-t border-ink/10 pt-8 text-[12px] leading-relaxed text-ink/50">
        <p>
          Competitor prices and formulation disclosures reflect publicly
          listed information as of {new Date().getFullYear()} and are subject
          to change without notice from the respective houses. CHIAREL™
          prices reflect current subscription and one-time pricing as listed
          in{" "}
          <Link href="/shop" className="border-b border-ochre text-ochre">
            The Shop
          </Link>
          . &ldquo;Active concentrations disclosed&rdquo; refers only to
          whether a brand publishes the percentage of a named active
          ingredient on its product page — not to the presence or absence of
          any ingredient itself.
        </p>
      </div>

      <div className="mt-10 flex flex-wrap gap-6 border-t border-ink/10 pt-8 text-[12px] uppercase tracking-[0.16em]">
        <Link href="/science" className="border-b border-ochre pb-0.5 text-ochre">
          Back to The Science
        </Link>
        <Link href="/shop" className="border-b border-ink/30 pb-0.5 text-ink/60">
          Visit The Shop
        </Link>
      </div>
    </div>
  );
}
