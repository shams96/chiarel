import { describe, expect, it } from "vitest";
import { ANY_CART_MAX_AGE_DAYS, EMPTY_CART_MAX_AGE_DAYS, staleCartWhere } from "@/lib/cart-prune";

const NOW = new Date("2026-10-16T12:00:00Z");
const daysAgo = (d: number) => new Date(NOW.getTime() - d * 86_400_000);

describe("stale cart rules", () => {
  const [emptyRule, anyRule] = staleCartWhere(NOW).OR;

  it("empty carts go after a week, carts with items are kept", () => {
    expect(emptyRule.items).toEqual({ none: {} });
    expect(emptyRule.createdAt?.lt).toEqual(daysAgo(EMPTY_CART_MAX_AGE_DAYS));
  });

  it("any cart goes once its 90-day cookie can no longer open it", () => {
    expect(anyRule.createdAt?.lt).toEqual(daysAgo(ANY_CART_MAX_AGE_DAYS));
    expect(ANY_CART_MAX_AGE_DAYS).toBeGreaterThan(90);
  });

  it("is started from instrumentation, not at import time", async () => {
    const { readFileSync } = await import("node:fs");
    expect(readFileSync("instrumentation.ts", "utf8")).toContain("startCartPruneSchedule()");
  });
});
