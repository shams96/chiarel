import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const read = (p: string) => readFileSync(p, "utf8");

// Every interactive element in the site chrome must keep a >=44px hit area
// (min-h-[44px], h-11, or the .tap-area pseudo-element expansion), and the
// announcement bar must never be a nowrap/marquee that clips copy on phones.
describe("site chrome tap targets", () => {
  // Normalise whitespace so the checks don't depend on line endings/indent.
  const flat = (p: string) => read(p).replace(/\s+/g, " ");
  const header = flat("components/Header.tsx");
  const footer = flat("components/Footer.tsx");
  const cart = flat("components/CartDrawer.tsx");
  const css = flat("app/globals.css");

  const bigEnough = /min-h-\[44px\]|h-11\b|tap-area/;

  it("header Bag, Shop and logo links have a 44px hit area", () => {
    for (const needle of ['aria-label="Open cart"', 'href="/shop" className', 'href="/" className']) {
      const i = header.indexOf(needle);
      expect(i, needle).toBeGreaterThan(-1);
      expect(header.slice(i, i + 220)).toMatch(bigEnough);
    }
  });

  it("footer links have a 44px hit area", () => {
    expect(footer).toMatch(/key=\{link\.href\}[^>]*min-h-\[44px\]/);
    expect(footer).toMatch(/href="\/contact"\s+className="tap-area/);
  });

  it("cart drawer controls have a 44px hit area", () => {
    for (const needle of ['aria-label="Close cart"', "Decrease quantity", "Increase quantity", "onClick={() => remove("]) {
      const i = cart.indexOf(needle);
      expect(i, needle).toBeGreaterThan(-1);
      expect(cart.slice(i, i + 260)).toMatch(bigEnough);
    }
  });

  it("announcement bar wraps instead of scrolling or clipping", () => {
    expect(header).not.toMatch(/marquee/);
    const bar = header.slice(header.indexOf("Founding 100 is open"), header.indexOf("<Ticker />"));
    expect(bar).not.toMatch(/whitespace-nowrap/);
    expect(css).toMatch(/\.ticker-msg[\s\S]*?animation: none/);
  });
});

describe("off-canvas drawers", () => {
  // A closed drawer is translated just off-screen; a permanent shadow-2xl
  // bleeds into the viewport edge as a grey strip. The shadow belongs to the
  // open state only.
  for (const file of ["components/CartDrawer.tsx", "components/Header.tsx"]) {
    it(`${file} only casts its shadow while open`, () => {
      const src = readFileSync(file, "utf8");
      const panel = src.slice(src.indexOf("cart-panel fixed"), src.indexOf("cart-panel fixed") + 260);
      expect(panel).toMatch(/\?\s*"translate-x-0 shadow-2xl"\s*:\s*"translate-x-full"/);
      expect(panel).not.toMatch(/bg-ivory shadow-2xl/);
    });
  }
});
