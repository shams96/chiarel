import type { Product } from "@/lib/products";

// Which compact accordions the product page shows beside the buy box. Built
// only from fields already published elsewhere on the page (benefits, how to
// use, disclosed actives, final-label INCI when the lab supplies it), so the
// accordions can never say more than the rest of the page does.

export type PdpSection =
  | { id: "benefits"; title: string; kind: "list"; items: string[] }
  | { id: "how-to-use"; title: string; kind: "steps"; items: string[] }
  | { id: "ingredients"; title: string; kind: "inci"; inci: string }
  | { id: "actives"; title: string; kind: "actives"; actives: { name: string; percent: string }[] };

export function pdpSections(p: Product): PdpSection[] {
  const sections: PdpSection[] = [];

  if (p.benefits && p.benefits.length > 0) {
    sections.push({ id: "benefits", title: "Benefits", kind: "list", items: p.benefits });
  }

  if (p.howToUse && p.howToUse.length > 0) {
    sections.push({ id: "how-to-use", title: "How to use", kind: "steps", items: p.howToUse });
  }

  if (p.ingredientsInci) {
    sections.push({ id: "ingredients", title: "Ingredients", kind: "inci", inci: p.ingredientsInci });
  } else {
    // Only actives with a real formulated concentration, matching the Formulation
    // Record section. Titled "Key actives", not "Ingredients", because it is not
    // the full label list.
    const dosed = (p.actives ?? []).filter(
      (a): a is { name: string; percent: string } => a.percent != null
    );
    if (dosed.length > 0) {
      sections.push({ id: "actives", title: "Key actives", kind: "actives", actives: dosed });
    }
  }

  return sections;
}
