// Closes the gaps between claudedocs/commerce/CHIAREL_IMPLEMENTATION_PLAN.md (Phases A-C) and what
// shipped: the CTA vocabulary, the summary-first bag on phones, the quiet header on the bag, the
// tax-inclusive total everywhere, and the sweep of abandoned pending orders.
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { CTA, addCtaLabel } from "@/lib/plan-labels";
import { orderTaxText, orderTotalLabel, orderTotalText } from "@/lib/order-total";
import { EXPIRE_GRACE_MINUTES, LEGACY_PENDING_MAX_AGE_HOURS, stalePendingWhere } from "@/lib/order-sweep";

const read = (p: string) => readFileSync(p, "utf8");

describe("one CTA vocabulary for the buying funnel", () => {
  it("is exactly three phrases plus the one-time variant", () => {
    expect(CTA).toEqual({
      begin: "Begin the Ritual",
      addOneTime: "Add to Bag",
      bag: "Checkout",
      pay: "Complete Your Order",
    });
  });

  it("the product page and the sticky bar label a plan 'Begin the Ritual' and a one-time buy 'Add to Bag'", () => {
    expect(addCtaLabel("ninetyDay")).toBe("Begin the Ritual");
    expect(addCtaLabel("single")).toBe("Begin the Ritual");
    expect(addCtaLabel("oneTime")).toBe("Add to Bag");
    // both buttons read the same function, so they can never disagree (the audit found the
    // sticky bar always saying "Add to Bag" while adding a subscription)
    for (const f of ["components/PurchaseOptions.tsx", "components/StickyPurchaseBar.tsx"]) {
      const s = read(f);
      expect(s, f).toContain("addCtaLabel(tier)");
      expect(s, f).not.toMatch(/>\s*Add to Bag\s*</);
    }
  });

  it("the drawer and the bag say 'Checkout', and the pay step says 'Complete Your Order'", () => {
    expect(read("components/CartDrawer.tsx")).toContain("{CTA.bag} —");
    const bag = read("components/CartPageContent.tsx");
    expect(bag).toContain("{CTA.bag} —");
    expect(bag).toMatch(/\{CTA\.bag\}\s*<\/Link>/); // the docked bar
    const pay = read("app/checkout/page.tsx");
    expect(pay).toContain("<h1");
    expect(pay).toMatch(/\{CTA\.pay\}<\/h1>/);
    expect(pay).toContain("`${CTA.pay} — $${total}`");
    expect(pay).not.toContain("Continue to Payment");
  });

  it("the pay button stays honest: the card is entered on the next screen", () => {
    expect(read("app/checkout/page.tsx")).toMatch(/enter your card details securely on the next\s+screen/);
  });
});

describe("the bag page puts the summary first on phones", () => {
  const bag = read("components/CartPageContent.tsx");

  it("orders summary, items, guidance below lg and restores the two columns at lg", () => {
    expect(bag).toMatch(/<section aria-label="Items in your bag" className="order-2 lg:order-none">/);
    expect(bag).toMatch(/className="order-1 h-fit bg-cloud\/40 p-6 lg:order-none lg:sticky lg:top-28"/);
    expect(bag).toMatch(/<div className="order-3 lg:hidden">\s*<BagGuidance \/>/);
  });

  it("shows the guidance once at each width, so a screen reader meets it once", () => {
    expect(bag).toMatch(/<div className="mt-6 hidden lg:block">\s*<BagGuidance \/>/);
    expect([...bag.matchAll(/<BagGuidance \/>/g)]).toHaveLength(2);
  });

  it("keeps the docked total and Checkout for when the summary scrolls away", () => {
    expect(bag).toContain('data-testid="bag-dock"');
    expect(bag).toMatch(/!summaryInView/);
  });
});

describe("the quiet header covers the bag as well as checkout", () => {
  async function chromeAt(path: string) {
    vi.resetModules();
    vi.doMock("next/navigation", () => ({ usePathname: () => path }));
    const m = await import("@/components/CheckoutChrome");
    return {
      header: renderToStaticMarkup(m.CheckoutHeader()),
      hide: renderToStaticMarkup(m.HideOnCheckout({ children: "SITE-HEADER" })),
    };
  }

  it("on /cart: the full header is hidden and the quiet one links to the shop", async () => {
    const c = await chromeAt("/cart");
    expect(c.hide).toBe("");
    expect(c.header).toContain('href="/shop"');
    expect(c.header).toContain("Continue shopping");
  });

  it("on /checkout: the quiet header links back to the bag", async () => {
    const c = await chromeAt("/checkout");
    expect(c.hide).toBe("");
    expect(c.header).toContain('href="/cart"');
    expect(c.header).toContain("Back to bag");
  });

  it("everywhere else the full site header stays and no quiet header renders", async () => {
    for (const p of ["/", "/shop", "/shop/clarity-essence", "/ritual", "/cartography"]) {
      const c = await chromeAt(p);
      expect(c.hide, p).toBe("SITE-HEADER");
      expect(c.header, p).toBe("");
    }
  });
});

describe("the total is tax-inclusive wherever it is shown", () => {
  const paid = { total: 87, amountPaidCents: 9437, taxCents: 737 };

  it("shows what Stripe charged, labelled incl. tax, once paid with tax", () => {
    expect(orderTotalLabel(paid)).toBe("Total (incl. tax)");
    expect(orderTotalText(paid)).toBe("$94.37");
    expect(orderTaxText(paid)).toBe("$7.37");
  });

  it("falls back to the pre-tax whole-dollar figure before payment or when no tax applied", () => {
    expect(orderTotalText({ total: 87, amountPaidCents: null, taxCents: null })).toBe("$87");
    expect(orderTotalLabel({ amountPaidCents: null, taxCents: null })).toBe("Total");
    expect(orderTotalLabel({ amountPaidCents: 8700, taxCents: 0 })).toBe("Total");
    expect(orderTotalText({ total: 87, amountPaidCents: 8700, taxCents: 0 })).toBe("$87.00");
    expect(orderTaxText({ taxCents: 0 })).toBeNull();
    expect(orderTaxText({ taxCents: null })).toBeNull();
  });

  it("the account page, admin list and admin detail all read the one helper", () => {
    expect(read("app/account/page.tsx")).toContain("orderTotalText(o)");
    expect(read("app/admin/orders/page.tsx")).toContain("orderTotalText(o)");
    expect(read("app/admin/orders/[id]/page.tsx")).toContain("orderTotalText(");
    expect(read("app/api/admin/orders/route.ts")).toMatch(/amountPaidCents: true,\s*taxCents: true/);
  });
});

describe("abandoned pending orders are expired, not left open", () => {
  const NOW = new Date("2026-11-06T12:00:00Z");

  it("selects only pending orders, past the session expiry plus the grace period", () => {
    const where = stalePendingWhere(NOW);
    expect(where.status).toBe("pending");
    const [withExpiry, legacy] = where.OR;
    expect(withExpiry.sessionExpiresAt).toEqual({
      lt: new Date(NOW.getTime() - EXPIRE_GRACE_MINUTES * 60_000),
    });
    expect(EXPIRE_GRACE_MINUTES).toBeGreaterThanOrEqual(30);
    // orders written before sessionExpiresAt existed use Stripe's own 24 h session life
    expect(legacy.sessionExpiresAt).toBeNull();
    expect(legacy.createdAt).toEqual({ lt: new Date(NOW.getTime() - LEGACY_PENDING_MAX_AGE_HOURS * 3_600_000) });
    expect(LEGACY_PENDING_MAX_AGE_HOURS).toBeGreaterThan(24);
  });

  it("marks them expired and never deletes", async () => {
    vi.resetModules();
    const updateMany = vi.fn().mockResolvedValue({ count: 3 });
    const deleteMany = vi.fn();
    vi.doMock("@/lib/db", () => ({ db: { order: { updateMany, deleteMany } } }));
    const { expireStalePendingOrders } = await import("@/lib/order-sweep");
    await expect(expireStalePendingOrders(NOW)).resolves.toBe(3);
    expect(updateMany).toHaveBeenCalledWith({ where: stalePendingWhere(NOW), data: { status: "expired" } });
    expect(deleteMany).not.toHaveBeenCalled();
  });

  it("can still be paid late: 'expired' is in the payable-from set", () => {
    expect(read("lib/order-payment.ts")).toMatch(/PAYABLE_FROM[^\n]*"expired"/);
  });

  it("is started from instrumentation, not at import time", () => {
    expect(read("instrumentation.ts")).toContain("startOrderSweepSchedule()");
  });
});

describe("the CI smoke test guards the price source of truth", () => {
  it("fails when /api/products prices differ from data/products.json", () => {
    const smoke = read("scripts/smoke.mjs");
    expect(smoke).toContain("GET /api/products prices equal data/products.json prices");
    expect(smoke).toContain("price drift:");
  });
});
