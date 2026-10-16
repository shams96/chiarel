import { products, publishedInci } from "@/lib/products";

// The five launch formulas the free-from statement is scoped to. Cellular
// Cleanser and Cellular Mist are NOT in the v2 formula workbook, so nothing
// about their composition is claimed.
export const LAUNCH_FORMULA_SLUGS = [
  "chiarel-essence",
  "terra-radiance-creme",
  "n1-neck-decollete",
  "recovery-masque",
  "eye-contour-concentrate",
] as const;

export function isLaunchFormula(slug: string): boolean {
  return (LAUNCH_FORMULA_SLUGS as readonly string[]).includes(slug);
}

// Categories named in the free-from sentence. Each was checked absent from all
// five v2 draft INCI lists (see tests/free-from-claim.test.ts).
export const FREE_FROM_CATEGORIES = [
  "parabens",
  "sulfates",
  "mineral oil",
  "silicones",
  "denatured alcohol",
] as const;

export const FREE_FROM_SENTENCE =
  "The five launch formulas (Essence, Terra Radiance Crème, Recovery Masque, N1 and Eye Treatment) are formulated without parabens, sulfates, mineral oil, silicones or denatured alcohol.";

/**
 * "Formulation first. Every ingredient has a job." The "listed in full"
 * wording is only added once a launch product's full INCI list is published
 * (publishedInci() non-empty); until then it stays off.
 */
export function formulationLine(): string {
  const anyPublished = products.some((p) => isLaunchFormula(p.slug) && publishedInci(p));
  return anyPublished
    ? "Formulation first. Every ingredient has a job, and every ingredient is listed in full."
    : "Formulation first. Every ingredient has a job.";
}
