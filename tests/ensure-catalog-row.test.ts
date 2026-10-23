import { describe, expect, it, vi, beforeEach } from "vitest";

const { findUnique, upsert } = vi.hoisted(() => ({ findUnique: vi.fn(), upsert: vi.fn() }));
vi.mock("@/lib/db", () => ({ db: { product: { findUnique, upsert } } }));

import { ensureCatalogRow } from "@/lib/ensure-catalog-row";

describe("ensureCatalogRow", () => {
  beforeEach(() => {
    findUnique.mockReset();
    upsert.mockReset();
  });

  it("returns an existing row untouched (database price stays authoritative)", async () => {
    findUnique.mockResolvedValue({ slug: "chiarel-essence", priceOneTime: 189 });
    const row = await ensureCatalogRow("chiarel-essence");
    expect(row).toMatchObject({ slug: "chiarel-essence" });
    expect(upsert).not.toHaveBeenCalled();
  });

  it("creates the missing row for a purchasable catalog product from the catalog", async () => {
    findUnique.mockResolvedValue(null);
    upsert.mockImplementation(async (a: { create: unknown }) => a.create);
    const row = (await ensureCatalogRow("eye-contour-concentrate")) as unknown as Record<string, unknown>;
    expect(row).toMatchObject({ slug: "eye-contour-concentrate", sku: "7A", priceOneTime: 189, priceSub: 151, isSet: false });
    expect(upsert).toHaveBeenCalledWith(expect.objectContaining({ where: { slug: "eye-contour-concentrate" }, update: {} }));
  });

  it("never creates a row for a slug outside the catalog", async () => {
    findUnique.mockResolvedValue(null);
    expect(await ensureCatalogRow("cellular-mist")).toBeNull();
    expect(upsert).not.toHaveBeenCalled();
  });
});
