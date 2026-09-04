import type { Variants } from "framer-motion";

// The site's one established ease-out curve (see components/Reveal.tsx,
// components/StickyPurchaseBar.tsx, .card-elevated in globals.css) — every
// treatment below reuses it rather than inventing new timing per product.
export const EASE = [0.22, 1, 0.36, 1] as const;
const EASE_CLASS = "ease-[cubic-bezier(0.22,1,0.36,1)]";

// Per-product hover gesture, keyed by ritual step. Each reads as a distinct
// but restrained motion appropriate to what the product physically is —
// mist rises, a jar settles with weight, a serum stays light — rather than
// the same scale-[1.03] copy-pasted across every card. Hover-gated to real
// pointers so touch taps don't trigger a "stuck" hover state.
const GATE = "[@media(hover:hover)_and_(pointer:fine)]";

const HOVER_TRANSFORM_BY_STEP: Record<string, string> = {
  // Cleanse — a light upward drift, like foam lifting.
  Cleanse: `${GATE}:group-hover:-translate-y-0.5 ${GATE}:group-hover:scale-[1.02]`,
  // Tone — mist is the lightest product in the line; barely a breath of scale.
  Tone: `${GATE}:group-hover:scale-[1.015]`,
  // Serum — the signature concentrate; the most pronounced (still subtle) lift.
  Serum: `${GATE}:group-hover:scale-[1.035]`,
  // Moisturize (AM/PM) — jars read as heavier; they settle down, not up.
  "Moisturize AM": `${GATE}:group-hover:translate-y-0.5 ${GATE}:group-hover:scale-[1.02]`,
  "Moisturize PM": `${GATE}:group-hover:translate-y-0.5 ${GATE}:group-hover:scale-[1.02]`,
  // Standalone (Lip Concentrate) — a precise tool, not a ritual step: crisp, quick.
  Standalone: `${GATE}:group-hover:scale-[1.02]`,
};
const DEFAULT_HOVER_TRANSFORM = `${GATE}:group-hover:scale-[1.03]`;

const DURATION_BY_STEP: Record<string, string> = {
  Tone: "duration-500",
  Standalone: "duration-500",
};
const DEFAULT_DURATION = "duration-700";

/** Tailwind classes for a product image's hover gesture — transform only, pointer-gated. */
export function productHoverClass(step?: string | null): string {
  const transform =
    (step && HOVER_TRANSFORM_BY_STEP[step]) || DEFAULT_HOVER_TRANSFORM;
  const duration = (step && DURATION_BY_STEP[step]) || DEFAULT_DURATION;
  return `transition-transform ${duration} ${EASE_CLASS} ${transform}`;
}

// PDP hero entrance — seen once per product-page visit (occasional tier, not
// a repeated hover), so it can carry a little more character. The serum's
// "drops in from above" and the jars' "settles into place" are the two
// gestures actually worth telling apart; everything else takes a shared,
// quieter default rather than invented variety for its own sake.
const HERO_ENTRANCE_BY_STEP: Record<string, Variants> = {
  Serum: {
    hidden: { opacity: 0, y: -28, scale: 0.97 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.8, ease: EASE },
    },
  },
  "Moisturize AM": {
    hidden: { opacity: 0, scale: 0.94 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.75, ease: EASE } },
  },
  "Moisturize PM": {
    hidden: { opacity: 0, scale: 0.94 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.75, ease: EASE } },
  },
};
const DEFAULT_HERO_ENTRANCE: Variants = {
  hidden: { opacity: 0, scale: 0.97 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.7, ease: EASE } },
};

export function getHeroEntrance(step?: string | null): Variants {
  return (step && HERO_ENTRANCE_BY_STEP[step]) || DEFAULT_HERO_ENTRANCE;
}
