import { describe, expect, it, vi } from "vitest";
import { removeLine, setLinePlan, setLineQty, withTotals } from "@/lib/cart-math";
import { createOpRunner } from "@/lib/cart-ops";
import { computeUnitPrice } from "@/lib/pricing";
import { isPurchasable, products } from "@/lib/products";

const line = (over: Partial<{ id: string; slug: string; mode: "ninetyDay" | "subscription" | "oneTime"; qty: number; unitPrice: number }> = {}) => ({
  id: "l1",
  slug: "chiarel-essence",
  mode: "ninetyDay" as const,
  qty: 1,
  unitPrice: 302,
  ...over,
});
const snap = (lines = [line()]) => withTotals({ lines, count: 0, subtotal: 0, savings: 0 })!;

describe("optimistic cart arithmetic (matches the server's pricing)", () => {
  it("totals for an Essence Ritual Plan: $302, saves $76", () => {
    expect(snap()).toMatchObject({ subtotal: 302, savings: 76, count: 1 });
  });

  it("quantity: subtotal, savings and count scale", () => {
    const s = setLineQty(snap([line({ mode: "subscription", unitPrice: 151 })]), "l1", 3)!;
    expect(s).toMatchObject({ subtotal: 453, savings: 114, count: 3 }); // 38 x 3
  });

  it("plan change keeps the quantity and reprices with the server's unit price", () => {
    const two = setLineQty(snap(), "l1", 2)!;
    const toSub = setLinePlan(two, "chiarel-essence", "subscription")!;
    expect(toSub.lines[0]).toMatchObject({ mode: "subscription", unitPrice: 151, qty: 2 });
    expect(toSub).toMatchObject({ subtotal: 302, savings: 76, count: 2 });
    const toOne = setLinePlan(toSub, "chiarel-essence", "oneTime")!;
    expect(toOne).toMatchObject({ subtotal: 378, savings: 0 });
  });

  it("every plan of every purchasable product is priced exactly as the cart prices it", () => {
    for (const p of products.filter(isPurchasable)) {
      for (const mode of ["ninetyDay", "subscription", "oneTime"] as const) {
        const s = setLinePlan(snap([line({ slug: p.slug })]), p.slug, mode)!;
        expect(s.lines[0].unitPrice).toBe(computeUnitPrice(p.price.subscription, p.price.oneTime, mode, p.slug));
      }
    }
  });

  it("removing a line drops its totals; unknown ids and bad quantities change nothing", () => {
    const two = snap([line(), line({ id: "l2", slug: "n1-neck-decollete", mode: "subscription", unitPrice: 118 })]);
    expect(removeLine(two, "l2")).toMatchObject({ subtotal: 302, count: 1 });
    expect(removeLine(two, "nope")).toBeNull();
    expect(setLineQty(two, "l1", 0)).toBeNull();
    expect(setLineQty(two, "l1", 1.5)).toBeNull();
    expect(setLineQty(two, "nope", 2)).toBeNull();
    expect(setLinePlan(two, "not-a-product", "oneTime")).toBeNull();
  });
});

const ok = (n: number) => new Response(JSON.stringify({ n }), { status: 200 });
const bad = () => new Response("{}", { status: 503 });
const tick = (ms: number) => new Promise((r) => setTimeout(r, ms));

describe("createOpRunner (serial changes, last answer wins)", () => {
  it("sends changes one at a time, in order", async () => {
    const log: string[] = [];
    const runner = createOpRunner(() => {}, () => {});
    const make = (name: string, ms: number) => async () => {
      log.push(`start ${name}`);
      await tick(ms);
      log.push(`end ${name}`);
      return ok(1);
    };
    await Promise.all([runner.run(make("a", 20)), runner.run(make("b", 1)), runner.run(make("c", 1))]);
    expect(log).toEqual(["start a", "end a", "start b", "end b", "start c", "end c"]);
  });

  it("applies only the answer to the last pending change, so the bag never jumps backwards", async () => {
    const applied: number[] = [];
    const runner = createOpRunner(
      async (res) => void applied.push((await res.json()).n),
      () => {}
    );
    await Promise.all([runner.run(async () => ok(1)), runner.run(async () => ok(2)), runner.run(async () => ok(3))]);
    expect(applied).toEqual([3]);
  });

  it("an earlier failure is ignored when the last change succeeds", async () => {
    const applied: number[] = [];
    const resync = vi.fn();
    const runner = createOpRunner(async (res) => void applied.push((await res.json()).n), resync);
    await Promise.all([runner.run(async () => bad()), runner.run(async () => ok(2))]);
    expect(applied).toEqual([2]);
    expect(resync).not.toHaveBeenCalled();
  });

  it("a failed last change re-reads the bag from the server instead of applying anything", async () => {
    const apply = vi.fn();
    const resync = vi.fn();
    const runner = createOpRunner(apply, resync);
    await Promise.all([runner.run(async () => ok(1)), runner.run(async () => bad())]);
    expect(apply).not.toHaveBeenCalled();
    expect(resync).toHaveBeenCalledTimes(1);
  });

  it("a network error counts as a failure and re-reads the bag", async () => {
    const resync = vi.fn();
    const runner = createOpRunner(() => {}, resync);
    await runner.run(async () => {
      throw new Error("offline");
    });
    expect(resync).toHaveBeenCalledTimes(1);
  });

  it("keeps working after a failure", async () => {
    const applied: number[] = [];
    const runner = createOpRunner(async (res) => void applied.push((await res.json()).n), () => {});
    await runner.run(async () => bad());
    await runner.run(async () => ok(9));
    expect(applied).toEqual([9]);
    expect(runner.pending).toBe(0);
  });
});
