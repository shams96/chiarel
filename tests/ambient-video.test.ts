import { existsSync, readFileSync, statSync } from "node:fs";
import { describe, expect, it } from "vitest";

const video = readFileSync("components/AmbientVideo.tsx", "utf8");
const page = readFileSync("app/shop/[slug]/page.tsx", "utf8");

describe("ambient product video", () => {
  it("is muted, looping, inline, lazy, and respects reduced motion", () => {
    expect(video).toMatch(/\bmuted\b/);
    expect(video).toMatch(/\bloop\b/);
    expect(video).toContain("playsInline");
    expect(video).toContain('preload="none"');
    expect(video).toContain("poster={poster}");
    expect(video).toContain("prefers-reduced-motion: reduce");
    expect(video).not.toMatch(/\bautoPlay\b/);
  });

  it("is placed on the N1 page with files present and within 3 MB", () => {
    expect(page).toContain("<AmbientVideo");
    const mp4 = "public/assets/products/n1-neck-decollete-ambient.mp4";
    expect(existsSync(mp4)).toBe(true);
    expect(statSync(mp4).size).toBeLessThanOrEqual(3 * 1024 * 1024);
    expect(existsSync("public/assets/products/serum-drop-macro.jpg")).toBe(true);
  });
});
