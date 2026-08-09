/**
 * Product-color backdrop tint, luminance-aware.
 *
 * A flat low opacity (33%) reads fine for pale brand colors (Peach Dust,
 * Cloud Dancer) but washes dark ones (Formal Garden, Deep Ocean) into an
 * unrecognizable gray-sage. This scales opacity by the base color's
 * relative luminance so every product's backdrop stays visually
 * identifiable as its documented brand color.
 */
function relativeLuminance(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

export function productTint(hex: string): string {
  const alpha = relativeLuminance(hex) > 0.4 ? 0x55 : 0xe6;
  return `${hex}${alpha.toString(16)}`;
}

/** Whether text/UI on top of this product's tinted backdrop should be light (white/ivory) instead of dark ink. */
export function isDarkTint(hex: string): boolean {
  return relativeLuminance(hex) <= 0.4;
}
