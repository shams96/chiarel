/**
 * CHIAREL Skin Assessment™ — scoring engine.
 *
 * Instrument: adapted from the Baumann Skin Type Indicator (BSTI), Baumann L.,
 * "Understanding and Treating Various Skin Types: The Baumann Skin Type
 * Indicator," Dermatol Clin. 2008 — a validated 4-axis dermatological
 * classification (Dry/Oily, Sensitive/Resistant, Pigmented/Nonpigmented,
 * Wrinkled/Tight; 16 permutations). We use 2 Likert questions per axis
 * (8 total) rather than the full clinical instrument's ~20, but preserve
 * its structure: independent axis scoring, deterministic thresholds, no
 * single question drives the whole result.
 *
 * Recommendation logic maps each axis's dominant pole to the launch SKU
 * whose formulation (per CHIAREL_Formulation_Registry_V1.0) addresses it —
 * never to unlaunched SKUs. Only the two most extreme axes drive a
 * recommendation, so most respondents get 1–2 products, not the full
 * catalog — deliberately anti-upsell, per the ingredient-level-trust
 * research this was designed against.
 */

export type Axis = "sebum" | "reactivity" | "pigment" | "structure";

export type Question = {
  id: string;
  axis: Axis;
  /** Lower score = first pole (dry/sensitive/pigmented/wrinkled-prone). Higher = second pole. */
  prompt: string;
  why: string;
  options: { label: string; value: number }[];
};

export const QUESTIONS: Question[] = [
  {
    id: "q1",
    axis: "sebum",
    prompt: "By midday, my skin generally feels…",
    why: "Sebum activity determines whether a formulation should reinforce lipids or stay lightweight.",
    options: [
      { label: "Tight and dry, even with moisturizer", value: 1 },
      { label: "Comfortable, a little dry in spots", value: 2 },
      { label: "Balanced", value: 3 },
      { label: "Slightly shiny in the T-zone", value: 4 },
      { label: "Visibly oily across most of the face", value: 5 },
    ],
  },
  {
    id: "q2",
    axis: "sebum",
    prompt: "After cleansing, before applying anything else, my skin feels…",
    why: "Post-cleanse tightness is a direct barrier-lipid signal, independent of daily oil production.",
    options: [
      { label: "Tight for 20+ minutes", value: 1 },
      { label: "Mildly tight, resolves quickly", value: 2 },
      { label: "Neutral", value: 3 },
      { label: "Comfortable immediately", value: 4 },
      { label: "Still slightly oily", value: 5 },
    ],
  },
  {
    id: "q3",
    axis: "reactivity",
    prompt: "When I try a new skincare product, my skin…",
    why: "Reactivity threshold determines how much active concentration and how frequently we'd suggest introducing it.",
    options: [
      { label: "Often reacts with redness, stinging, or itching", value: 1 },
      { label: "Sometimes reacts", value: 2 },
      { label: "Occasionally, only with certain actives", value: 3 },
      { label: "Rarely reacts", value: 4 },
      { label: "Essentially never reacts", value: 5 },
    ],
  },
  {
    id: "q4",
    axis: "reactivity",
    prompt: "Weather changes, fragrance, or fabric contact…",
    why: "Environmental reactivity is a second, independent marker of barrier resilience (per BSTI methodology).",
    options: [
      { label: "Frequently trigger visible redness or discomfort", value: 1 },
      { label: "Sometimes trigger a reaction", value: 2 },
      { label: "Rarely bother my skin", value: 3 },
      { label: "Almost never affect my skin", value: 4 },
      { label: "Never affect my skin", value: 5 },
    ],
  },
  {
    id: "q5",
    axis: "pigment",
    prompt: "Uneven tone, dark spots, or marks after blemishes…",
    why: "Pigment-axis tendency guides whether clarity-focused actives should be prioritized.",
    options: [
      { label: "Are a frequent, visible concern", value: 1 },
      { label: "Show up occasionally", value: 2 },
      { label: "Are minor", value: 3 },
      { label: "Rarely happen", value: 4 },
      { label: "Essentially never happen", value: 5 },
    ],
  },
  {
    id: "q6",
    axis: "pigment",
    prompt: "In the sun, my skin tends to…",
    why: "Sun-response is the second BSTI pigment marker, independent of visible spotting.",
    options: [
      { label: "Tan or darken very easily", value: 1 },
      { label: "Darken somewhat", value: 2 },
      { label: "Change gradually", value: 3 },
      { label: "Rarely darken", value: 4 },
      { label: "Stay essentially the same", value: 5 },
    ],
  },
  {
    id: "q7",
    axis: "structure",
    prompt: "When I gently press or stretch my skin, I notice…",
    why: "Tissue bounce is a direct, in-the-moment read on structural/collagen support — not an age assumption.",
    options: [
      { label: "Fine lines or a loss of bounce", value: 1 },
      { label: "A slight change from a few years ago", value: 2 },
      { label: "Not much difference", value: 3 },
      { label: "Good elasticity", value: 4 },
      { label: "Very firm, immediate rebound", value: 5 },
    ],
  },
  {
    id: "q8",
    axis: "structure",
    prompt: "Compared to a few years ago, my skin's texture feels…",
    why: "A second, independent structural marker, per BSTI's paired-question-per-axis design.",
    options: [
      { label: "Noticeably less resilient", value: 1 },
      { label: "Somewhat less resilient", value: 2 },
      { label: "About the same", value: 3 },
      { label: "Slightly firmer / no concern", value: 4 },
      { label: "No change at all", value: 5 },
    ],
  },
];

export type AxisScore = { axis: Axis; score: number; pole: string; extremity: number };

const AXIS_LABELS: Record<Axis, { low: string; high: string }> = {
  sebum: { low: "Dry", high: "Oily" },
  reactivity: { low: "Sensitive", high: "Resistant" },
  pigment: { low: "Pigment-Prone", high: "Even-Toned" },
  structure: { low: "Structure-Focused", high: "Resilient" },
};

/** Sum 2 questions per axis (range 2–10). Midpoint 6; ties resolve to the milder/higher pole
 *  (conservative default — avoids overstating a concern from a near-neutral answer set). */
export function scoreAxes(answers: Record<string, number>): AxisScore[] {
  const axes: Axis[] = ["sebum", "reactivity", "pigment", "structure"];
  return axes.map((axis) => {
    const qs = QUESTIONS.filter((q) => q.axis === axis);
    const score = qs.reduce((sum, q) => sum + (answers[q.id] ?? 3), 0);
    const pole = score < 6 ? AXIS_LABELS[axis].low : AXIS_LABELS[axis].high;
    return { axis, score, pole, extremity: Math.abs(score - 6) };
  });
}

export type Recommendation = {
  slug: string;
  reason: string;
};

/**
 * Deterministic mapping: each axis's low pole (the concern side) maps to the
 * launch SKU whose registered formulation addresses it. Only axes at or below
 * the midpoint (score < 6) are eligible — a resistant/resilient/even-toned/oily
 * result on an axis contributes no recommendation from that axis, which is why
 * most respondents get 1–2 products rather than all six.
 */
const AXIS_TO_SKU: Record<Axis, { slug: string; reason: string }> = {
  sebum: {
    slug: "terra-radiance-creme",
    reason:
      "Your answers point to a barrier that could use lipid support. Terra Radiance Crème™ carries Ceramide NP and Niacinamide, formulated for daily barrier resilience.",
  },
  reactivity: {
    slug: "cellular-cleanser",
    reason:
      "Your skin shows signs of reactivity. Cellular Cleanser™ is pH 5.0 with a prebiotic complex — formulated to cleanse without disrupting a sensitized barrier.",
  },
  pigment: {
    slug: "chiarel-essence",
    reason:
      "Uneven tone is a signal for CHIAREL Essence™, built on the Cellular Intelligence Complex™ to support even-looking clarity.",
  },
  structure: {
    slug: "chiarel-essence",
    reason:
      "Structural concerns are best met by CHIAREL Essence™ and Terra Radiance Crème™ together — the Founding Pair — supporting resilience from both the serum and moisturizer steps.",
  },
};

export function recommend(axisScores: AxisScore[]): {
  recommendations: Recommendation[];
  bundleEligible: boolean;
} {
  const concerns = axisScores
    .filter((a) => a.score < 6)
    .sort((a, b) => b.extremity - a.extremity);

  if (concerns.length === 0) {
    return {
      recommendations: [
        {
          slug: "cellular-mist",
          reason:
            "Your skin shows no dominant concern on this assessment — a strong baseline. Cellular Mist™ is a light maintenance step to keep it that way.",
        },
      ],
      bundleEligible: false,
    };
  }

  const top = concerns.slice(0, 2);
  const slugs = new Set<string>();
  const recommendations: Recommendation[] = [];
  for (const c of top) {
    const rec = AXIS_TO_SKU[c.axis];
    if (!slugs.has(rec.slug)) {
      slugs.add(rec.slug);
      recommendations.push(rec);
    }
  }

  return { recommendations, bundleEligible: top.length >= 2 && slugs.size >= 2 };
}
