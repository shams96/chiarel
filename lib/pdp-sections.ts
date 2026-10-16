import { publishedInci, type Product } from "@/lib/products";

// Which compact accordions the product page shows beside the buy box. Built
// only from fields already published elsewhere on the page (benefits, how to
// use, named key ingredients, the full INCI list once marked final), so the
// accordions can never say more than the rest of the page does.

export type PdpSection =
  | { id: "benefits"; title: string; kind: "list"; items: string[] }
  | { id: "how-to-use"; title: string; kind: "steps"; items: string[] }
  | { id: "ingredients"; title: string; kind: "inci"; inci: string }
  | { id: "actives"; title: string; kind: "actives"; actives: { name: string }[] };

export function pdpSections(p: Product): PdpSection[] {
  const sections: PdpSection[] = [];

  if (p.benefits && p.benefits.length > 0) {
    sections.push({ id: "benefits", title: "Benefits", kind: "list", items: p.benefits });
  }

  if (p.howToUse && p.howToUse.length > 0) {
    sections.push({ id: "how-to-use", title: "How to use", kind: "steps", items: p.howToUse });
  }

  const inci = publishedInci(p);
  if (inci) {
    sections.push({ id: "ingredients", title: "Ingredients", kind: "inci", inci: inci.join(", ") });
  } else if (p.actives && p.actives.length > 0) {
    // Titled "Key ingredients", not "Ingredients", because it is not the full
    // list. Names only; no percentages anywhere.
    sections.push({ id: "actives", title: "Key ingredients", kind: "actives", actives: p.actives });
  }

  return sections;
}
