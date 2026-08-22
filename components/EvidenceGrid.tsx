import Link from "next/link";
import type { Product } from "@/lib/products";

/**
 * The honest counterpart to a clinical-percentage stat grid: CHIAREL has no
 * third-party trial data to cite, so this shows the thing that IS real and
 * verifiable — exact active-ingredient concentrations, per Decision 012's
 * "no hidden blends" positioning — with the same visual weight AB gives
 * its trial-result stat blocks.
 */
export default function EvidenceGrid({ products }: { products: Product[] }) {
  const entries = products
    .flatMap((p) =>
      (p.actives ?? []).map((a) => ({
        productSlug: p.slug,
        productName: p.name,
        activeName: a.name,
        percent: a.percent,
      }))
    )
    .filter((e) => e.percent)
    .slice(0, 3);

  return (
    <div className="grid gap-10 sm:grid-cols-3">
      {entries.map((e) => (
        <Link
          key={`${e.productSlug}-${e.activeName}`}
          href={`/shop/${e.productSlug}`}
          className="group block text-center"
        >
          <p className="font-serif text-5xl text-ochre transition group-hover:text-ink">
            {e.percent}
          </p>
          <p className="mt-3 text-sm text-ink/80">{e.activeName}</p>
          <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-ink/45">
            {e.productName}
          </p>
        </Link>
      ))}
    </div>
  );
}
