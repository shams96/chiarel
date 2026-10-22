import Link from "next/link";
import type { Product } from "@/lib/products";
import { productHref } from "@/lib/products";

/**
 * The honest counterpart to a clinical-percentage stat grid: CHIAREL has no
 * third-party trial data to cite, so this shows what IS real and verifiable —
 * the key ingredient names for each product. No percentages are published
 * anywhere on the site (owner decision: luxury standard is named key
 * ingredients plus a full INCI list, never concentrations).
 */
export default function EvidenceGrid({ products }: { products: Product[] }) {
  const entries = products
    .flatMap((p) =>
      (p.actives ?? []).slice(0, 1).map((a) => ({
        productSlug: p.slug,
        productName: p.name,
        activeName: a.name,
      }))
    )
    .slice(0, 3);

  return (
    <div className="grid gap-6 sm:grid-cols-3">
      {entries.map((e) => (
        <Link
          key={`${e.productSlug}-${e.activeName}`}
          href={productHref(e.productSlug)}
          className="card-elevated group block rounded-md bg-white p-6 text-center transition hover:-translate-y-0.5"
        >
          <p className="font-serif text-2xl leading-snug text-ochre transition group-hover:text-ink">
            {e.activeName}
          </p>
          <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-ink/65">
            {e.productName}
          </p>
        </Link>
      ))}
    </div>
  );
}
