import { describe, expect, it } from "vitest";
import { pickUpsell, redundantComponents, slugsCoveredBySets } from "@/lib/cart-math";
import { products, ritualProducts } from "@/lib/products";

const ritualSet = products.find((p) => p.set && p.includes?.includes("cellular-cleanser"));

describe("set-aware upsell and redundancy note", () => {
  it("fixture: The Ritual Set includes the cleanser", () => {
    expect(ritualSet).toBeDefined();
  });

  it("does not offer a product already covered by a set in the bag", () => {
    const lines = [{ slug: ritualSet!.slug }];
    const covered = slugsCoveredBySets(lines);
    expect(covered.has("cellular-cleanser")).toBe(true);
    const pick = pickUpsell(ritualProducts, lines);
    expect(pick?.slug).not.toBe("cellular-cleanser");
    for (const s of ritualSet!.includes!) expect(pick?.slug).not.toBe(s);
  });

  it("still offers the first missing ritual product when no set is present", () => {
    const first = ritualProducts[0];
    expect(pickUpsell(ritualProducts, [])?.slug).toBe(first.slug);
    expect(pickUpsell(ritualProducts, [{ slug: first.slug }])?.slug).toBe(ritualProducts[1].slug);
  });

  it("flags a component that sits in the bag next to its set, without removing anything", () => {
    const lines = [{ slug: ritualSet!.slug }, { slug: "chiarel-essence" }];
    const notes = redundantComponents(lines);
    expect(notes).toHaveLength(1);
    expect(notes[0]).toMatchObject({ slug: "chiarel-essence", setName: ritualSet!.name });
    expect(lines).toHaveLength(2);
  });

  it("no note for a set alone or components alone", () => {
    expect(redundantComponents([{ slug: ritualSet!.slug }])).toEqual([]);
    expect(redundantComponents([{ slug: "chiarel-essence" }])).toEqual([]);
  });
});
