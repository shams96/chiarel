import type { Product } from "@/lib/products";
import { pdpSections } from "@/lib/pdp-sections";

// Compact accordions under the buy box, so benefits, directions and the
// key ingredients are one tap from the Add to Bag button instead of far
// down the page. Zero-JS <details>, the same pattern used by the FAQ and
// checkout policy. The longer sections further down the page are unchanged.
export default function ProductAccordions({ product }: { product: Product }) {
  const sections = pdpSections(product);
  if (sections.length === 0) return null;

  return (
    <div className="mt-6 border-b border-ink/10">
      {sections.map((s) => (
        <details key={s.id} className="group border-t border-ink/10">
          <summary className="flex min-h-[44px] cursor-pointer list-none items-center justify-between text-[12px] uppercase tracking-[0.16em] text-ink/80">
            {s.title}
            <span className="ml-4 text-lg text-ink/50 group-open:hidden" aria-hidden="true">+</span>
            <span className="ml-4 hidden text-lg text-ink/50 group-open:inline" aria-hidden="true">−</span>
          </summary>
          <div className="pb-4 text-[13px] leading-relaxed text-ink/75">
            {s.kind === "list" && (
              <ul className="list-disc space-y-1.5 pl-5">
                {s.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )}
            {s.kind === "steps" && (
              <ol className="space-y-1.5">
                {s.items.map((item, i) => (
                  <li key={item} className="flex gap-3">
                    <span className="font-serif text-ochre" aria-hidden="true">{i + 1}.</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ol>
            )}
            {s.kind === "inci" && <p>{s.inci}</p>}
            {s.kind === "actives" && (
              <ul className="list-disc space-y-1.5 pl-5">
                {s.actives.map((a) => (
                  <li key={a.name}>{a.name}</li>
                ))}
              </ul>
            )}
          </div>
        </details>
      ))}
    </div>
  );
}
