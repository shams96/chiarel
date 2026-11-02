import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import manifest from "../lib/image-variants.json";
import { srcSetFor } from "../components/ResponsiveImage";

type Entry = { width: number; widths: number[] };
const entries = Object.entries(manifest as Record<string, Entry>);

// Pixel width of a JPEG, read from its SOF marker (no image library needed in CI).
function jpegWidth(path: string): number {
  const b = readFileSync(path);
  let i = 2;
  while (i < b.length) {
    if (b[i] !== 0xff) throw new Error(`bad JPEG: ${path}`);
    const marker = b[i + 1];
    const len = b.readUInt16BE(i + 2);
    if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) return b.readUInt16BE(i + 7);
    i += 2 + len;
  }
  throw new Error(`no SOF in ${path}`);
}

describe("responsive image variants", () => {
  it("lists at least the hero and the product scene photos", () => {
    const keys = entries.map(([k]) => k);
    expect(keys).toContain("/assets/products/clarity-essence-festive-scene-v2.jpg");
    expect(keys.length).toBeGreaterThanOrEqual(10);
  });

  it.each(entries)("%s: source, variants and recorded width agree", (src, e) => {
    expect(existsSync(`public${src}`), `missing source ${src}`).toBe(true);
    // a replaced image with a new size must be followed by `npm run make:variants`
    expect(jpegWidth(`public${src}`), `width of ${src} changed: run npm run make:variants and commit lib/image-variants.json`).toBe(e.width);
    for (const w of e.widths.filter((x) => x < e.width)) {
      const v = src.replace(/(\.[a-z0-9]+)$/i, `-${w}$1`);
      expect(existsSync(`public${v}`), `missing variant ${v}`).toBe(true);
      expect(jpegWidth(`public${v}`)).toBe(w);
    }
  });

  it("builds a srcSet for a listed image and none for an unlisted one", () => {
    const set = srcSetFor("/assets/products/clarity-essence-festive-scene-v2.jpg");
    expect(set).toContain("-640.jpg 640w");
    expect(set).toContain("-960.jpg 960w");
    expect(set).toMatch(/festive-scene-v2\.jpg 1500w$/);
    expect(srcSetFor("/assets/products/not-listed.jpg")).toBeUndefined();
  });
});
