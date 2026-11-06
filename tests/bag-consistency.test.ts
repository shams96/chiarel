import { readFileSync } from "node:fs";
import { beforeEach, describe, expect, it } from "vitest";
import { PLAN_DETAIL, PLAN_NAME, modeToTier, tierToMode } from "@/lib/plan-labels";
import { getSelectedTier, resetSelectedTiers, setSelectedTier, DEFAULT_TIER } from "@/lib/pdp-plan";
import { planOptions } from "@/lib/pricing";

const read = (p: string) => readFileSync(p, "utf8");

describe("plan labels: one source", () => {
  it("keeps the wording the site already used", () => {
    expect(PLAN_NAME).toEqual({ ninetyDay: "90-day plan", subscription: "Subscription", oneTime: "One-time" });
    expect(PLAN_DETAIL).toEqual({
      ninetyDay: "90-day plan · one delivery",
      subscription: "Subscription · every 45 days",
      oneTime: "One-time purchase",
    });
  });

  it("the bag-page plan selector reads the same names", () => {
    expect(planOptions("chiarel-essence", 151, 189).map((o) => o.label)).toEqual([
      PLAN_NAME.ninetyDay,
      PLAN_NAME.subscription,
      PLAN_NAME.oneTime,
    ]);
  });

  it("no file keeps its own table of plan names", () => {
    const files = [
      "components/CartDrawer.tsx",
      "components/CartPageContent.tsx",
      "components/PlanSelect.tsx",
      "app/checkout/page.tsx",
      "app/order/[id]/page.tsx",
      "app/api/checkout/route.ts",
      "lib/pricing.ts",
    ];
    for (const f of files) {
      const src = read(f);
      expect(src, f).not.toMatch(/ninetyDay:\s*"90-day plan/);
      expect(src, f).not.toMatch(/oneTime:\s*"One-time/);
      expect(src, f).not.toMatch(/label:\s*"(90-day plan|Subscription|One-time)"/);
    }
  });
});

describe("product-page plan choice", () => {
  beforeEach(() => resetSelectedTiers());

  it("maps the page's tiers to cart modes and back", () => {
    expect(tierToMode("single")).toBe("subscription");
    expect(tierToMode("ninetyDay")).toBe("ninetyDay");
    expect(tierToMode("oneTime")).toBe("oneTime");
    for (const m of ["ninetyDay", "subscription", "oneTime"] as const) {
      expect(tierToMode(modeToTier(m))).toBe(m);
    }
  });

  it("starts on the 90-day plan, the option the page shows selected", () => {
    expect(getSelectedTier("chiarel-essence")).toBe(DEFAULT_TIER);
    expect(DEFAULT_TIER).toBe("ninetyDay");
  });

  it("remembers the choice per product", () => {
    setSelectedTier("a", "oneTime");
    setSelectedTier("b", "single");
    expect(getSelectedTier("a")).toBe("oneTime");
    expect(getSelectedTier("b")).toBe("single");
    expect(getSelectedTier("c")).toBe("ninetyDay");
  });

  it("the purchase options and the sticky bar read and add the same plan", () => {
    const options = read("components/PurchaseOptions.tsx");
    const bar = read("components/StickyPurchaseBar.tsx");
    for (const src of [options, bar]) {
      expect(src).toMatch(/useSelectedTier\(slug\)/);
      expect(src).toMatch(/add\(slug, tierToMode\(tier\)\)/);
    }
    expect(options).toMatch(/setSelectedTier\(slug, next\)/);
    // The bar used to hard-code a subscription whatever the page showed.
    expect(bar).not.toMatch(/add\(slug, "subscription"\)/);
  });

  it("the product page gives the bar both prices", () => {
    expect(read("app/shop/[slug]/page.tsx")).toMatch(/oneTimePrice=\{p\.price\.oneTime\}/);
  });
});

describe("Ritual Bag drawer", () => {
  const drawer = read("components/CartDrawer.tsx");

  it("lets a line switch plan in place, with the shared selector", () => {
    expect(drawer).toMatch(/<PlanSelect line=\{line\}/);
  });

  it("gives the quantity buttons a real 44px size", () => {
    expect(drawer).not.toMatch(/h-7 w-7/);
    expect(drawer.match(/h-11 w-11/g)?.length ?? 0).toBeGreaterThanOrEqual(3);
  });

  it("announces quantity changes", () => {
    expect(drawer).toMatch(/aria-live="polite">\s*\{line\.qty\}/);
  });

  it("suggests one product, on the plan already in the bag, and can be dismissed for the visit", () => {
    expect(drawer).toMatch(/upsellDismissed/);
    expect(drawer).toMatch(/Not now/);
    expect(drawer).toMatch(/lines\[0\]\?\.mode \?\? "subscription"/);
    expect(drawer).toMatch(/add\(nextStep\.slug, upsellMode\)/);
    expect(drawer).not.toMatch(/add\(nextStep\.slug, "subscription"\)/);
  });
});

describe("bag page on a phone", () => {
  const page = read("components/CartPageContent.tsx");

  it("docks the total and Checkout while the summary is off screen, and only below lg", () => {
    expect(page).toMatch(/data-testid="bag-dock"/);
    expect(page).toMatch(/lg:hidden/);
    expect(page).toMatch(/IntersectionObserver/);
    expect(page).toMatch(/!summaryInView/);
  });

  it("uses the shared plan selector", () => {
    expect(page).toMatch(/import PlanSelect from "@\/components\/PlanSelect"/);
  });
});
