import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const read = (p: string) => readFileSync(p, "utf8");
const css = read("app/globals.css").replace(/\s+/g, " ");

// Phone tap targets: every standalone control needs a 44px hit area. These pin the
// global rules and the targeted fixes found by measuring real hit areas in the browser
// (elementFromPoint 21px above and below each control's centre at 390px wide).
describe("global tap-target rules", () => {
  it("underlined text links (a.border-b, a.underline) get an invisible 44px hit area", () => {
    expect(css).toMatch(/a\.border-b::after, a\.underline::after \{[^}]*width: max\(100%, 44px\)[^}]*height: max\(100%, 44px\)/);
    expect(css).toMatch(/a\.border-b, a\.underline \{ position: relative; \}/);
  });

  it("FAQ and accordion rows are at least 44px tall", () => {
    expect(css).toMatch(/summary\.list-none \{ min-height: 44px; \}/);
  });
});

describe("targeted tap-target fixes", () => {
  it("gallery dots are 44px wide as well as tall", () => {
    expect(read("components/ProductGallery.tsx")).toMatch(/flex h-11 w-11 items-center justify-center/);
  });

  it("the intro's Skip button has a 44px hit area", () => {
    expect(read("components/HeroIntro.tsx")).toMatch(/Skip intro animation[\s\S]{0,200}min-h-\[44px\] min-w-\[44px\]/);
  });

  it("the terms checkbox sits in a 44px-tall label and is larger than the default", () => {
    const src = read("app/checkout/page.tsx");
    expect(src).toMatch(/<label className="flex min-h-\[44px\] items-center[^"]*">\s*<input type="checkbox" name="termsAccepted"[^>]*h-5 w-5/);
  });

  it("stacked small links keep their tap zones from overlapping (gap of at least 24px between boxes)", () => {
    // Each invisible zone extends 11.5px beyond its link, so links need > 23px between them.
    expect(read("components/home/HomeClosing.tsx")).toMatch(/gap-x-8 gap-y-7/);
    expect(read("app/shop/[slug]/page.tsx")).toMatch(/gap-x-2 gap-y-6/);
    const prov = read("components/home/HomeProvenance.tsx");
    expect(prov.match(/flex min-h-\[44px\] items-center text-\[11px\]/g)?.length).toBe(2);
  });

  it("bag and routine product links have a hit area", () => {
    expect(read("components/CartPageContent.tsx")).toMatch(/tap-area font-serif text-lg/);
    expect(read("app/shop/[slug]/page.tsx")).toMatch(/tap-area text-sm text-ink\/70/);
  });
});
