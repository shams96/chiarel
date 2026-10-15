import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// In-memory stand-in for the three Prisma models the cart touches. It
// implements only the calls the cart code makes, so a changed query shape in
// the real code fails loudly here instead of silently passing.
type Item = { id: string; cartId: string; productSlug: string; mode: string; qty: number };
const state = {
  carts: new Set<string>(),
  items: [] as Item[],
  nextId: 1,
  cookie: undefined as string | undefined,
};

const products = [
  { slug: "chiarel-essence", name: "Essence", image: "/e.png", descriptor: "d", priceSub: 100, priceOneTime: 120 },
  { slug: "n1-neck-decollete", name: "N1", image: "/n.png", descriptor: "d", priceSub: 200, priceOneTime: 240 },
];

vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) =>
      name === "chiarel_cart_id" && state.cookie ? { value: state.cookie } : undefined,
  }),
}));

vi.mock("@/lib/db", () => ({
  db: {
    product: {
      findUnique: async ({ where }: { where: { slug: string } }) =>
        products.find((p) => p.slug === where.slug) ?? null,
    },
    cart: {
      findUnique: async ({ where }: { where: { id: string } }) =>
        state.carts.has(where.id) ? { id: where.id } : null,
      create: async ({ data }: { data: { id?: string } }) => {
        const id = data.id ?? `cart_${state.nextId++}`;
        state.carts.add(id);
        return { id };
      },
    },
    cartItem: {
      findUnique: async ({ where }: { where: { id?: string; cartId_productSlug?: { cartId: string; productSlug: string } } }) =>
        state.items.find((i) =>
          where.id
            ? i.id === where.id
            : i.cartId === where.cartId_productSlug!.cartId &&
              i.productSlug === where.cartId_productSlug!.productSlug,
        ) ?? null,
      findMany: async ({ where }: { where: { cartId: string } }) =>
        state.items
          .filter((i) => i.cartId === where.cartId)
          .map((i) => ({ ...i, product: products.find((p) => p.slug === i.productSlug)! })),
      create: async ({ data }: { data: Omit<Item, "id"> }) => {
        const item = { id: `item_${state.nextId++}`, ...data };
        state.items.push(item);
        return item;
      },
      update: async ({ where, data }: { where: { id: string }; data: Partial<Item> }) => {
        const item = state.items.find((i) => i.id === where.id)!;
        Object.assign(item, data);
        return item;
      },
      delete: async ({ where }: { where: { id: string } }) => {
        state.items = state.items.filter((i) => i.id !== where.id);
      },
    },
  },
}));

const cartRoute = await import("@/app/api/cart/route");
const itemRoute = await import("@/app/api/cart/[itemId]/route");

const post = (body: unknown) =>
  cartRoute.POST(
    new NextRequest("http://localhost/api/cart", { method: "POST", body: JSON.stringify(body) }),
  );
const patch = (id: string, body: unknown) =>
  itemRoute.PATCH(
    new NextRequest(`http://localhost/api/cart/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
    { params: Promise.resolve({ itemId: id }) },
  );
const del = (id: string) =>
  itemRoute.DELETE(new NextRequest(`http://localhost/api/cart/${id}`, { method: "DELETE" }), {
    params: Promise.resolve({ itemId: id }),
  });

beforeEach(() => {
  state.carts = new Set(["cart_mine", "cart_other"]);
  state.items = [];
  state.nextId = 1;
  state.cookie = "cart_mine";
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("cart: adding items", () => {
  it("rejects a missing slug or an invalid mode", async () => {
    expect((await post({ mode: "oneTime" })).status).toBe(400);
    expect((await post({ slug: "chiarel-essence", mode: "free" })).status).toBe(400);
    expect((await post(null)).status).toBe(400);
  });

  it("returns 404 for an unknown product", async () => {
    expect((await post({ slug: "nope", mode: "oneTime" })).status).toBe(404);
  });

  it("adds a line and prices it on the server", async () => {
    const res = await post({ slug: "chiarel-essence", mode: "subscription" });
    expect(res.status).toBe(201);
    const cart = await res.json();
    expect(cart.cartId).toBe("cart_mine");
    expect(cart.lines).toHaveLength(1);
    expect(cart.lines[0]).toMatchObject({ slug: "chiarel-essence", qty: 1, unitPrice: 100 });
    expect(cart.subtotal).toBe(100);
  });

  it("ignores any client-supplied price", async () => {
    const res = await post({ slug: "chiarel-essence", mode: "oneTime", price: 1, unitPrice: 1 });
    const cart = await res.json();
    expect(cart.lines[0].unitPrice).toBe(120);
  });

  it("adding the same tier again increases quantity", async () => {
    await post({ slug: "chiarel-essence", mode: "oneTime" });
    const cart = await (await post({ slug: "chiarel-essence", mode: "oneTime" })).json();
    expect(cart.lines[0].qty).toBe(2);
    expect(cart.count).toBe(2);
    expect(cart.subtotal).toBe(240);
  });

  it("switching tier keeps quantity and changes only the plan", async () => {
    await post({ slug: "chiarel-essence", mode: "oneTime" });
    await post({ slug: "chiarel-essence", mode: "oneTime" });
    const cart = await (await post({ slug: "chiarel-essence", mode: "subscription" })).json();
    expect(cart.lines).toHaveLength(1);
    expect(cart.lines[0]).toMatchObject({ mode: "subscription", qty: 2, unitPrice: 100 });
  });
});

describe("cart: pricing rules", () => {
  it("90-day plan is twice the subscription price for a normal product", async () => {
    const cart = await (await post({ slug: "chiarel-essence", mode: "ninetyDay" })).json();
    expect(cart.lines[0].unitPrice).toBe(200);
    expect(cart.savings).toBe(40);
  });

  it("N1 is charged the flat 2x for 90 days, with no founders discount", async () => {
    const cart = await (await post({ slug: "n1-neck-decollete", mode: "ninetyDay" })).json();
    expect(cart.lines[0].unitPrice).toBe(400);
  });
});

describe("cart: changing a line's plan (PATCH mode)", () => {
  it("sets the plan and keeps the quantity", async () => {
    await post({ slug: "chiarel-essence", mode: "subscription" });
    await post({ slug: "chiarel-essence", mode: "subscription" });
    const res = await patch(state.items[0].id, { mode: "oneTime" });
    expect(res.status).toBe(200);
    expect(state.items[0]).toMatchObject({ mode: "oneTime", qty: 2 });
  });

  it("is idempotent: asking for the plan the line already has changes nothing", async () => {
    await post({ slug: "chiarel-essence", mode: "oneTime" });
    await patch(state.items[0].id, { mode: "oneTime" });
    await patch(state.items[0].id, { mode: "oneTime" });
    expect(state.items[0]).toMatchObject({ mode: "oneTime", qty: 1 });
  });

  it("rejects an unknown plan and another shopper's line", async () => {
    await post({ slug: "chiarel-essence", mode: "oneTime" });
    expect((await patch(state.items[0].id, { mode: "free" })).status).toBe(400);
    state.items.push({ id: "theirs", cartId: "cart_other", productSlug: "chiarel-essence", mode: "oneTime", qty: 1 });
    expect((await patch("theirs", { mode: "subscription" })).status).toBe(404);
    expect(state.items.find((i) => i.id === "theirs")!.mode).toBe("oneTime");
  });
});

describe("cart: ownership", () => {
  it("creates a cart when the cookie is missing", async () => {
    state.cookie = undefined;
    const cart = await (await post({ slug: "chiarel-essence", mode: "oneTime" })).json();
    expect(cart.cartId).toMatch(/^cart_/);
    expect(cart.cartId).not.toBe("cart_mine");
  });

  it("cannot change another shopper's item", async () => {
    state.items.push({ id: "theirs", cartId: "cart_other", productSlug: "chiarel-essence", mode: "oneTime", qty: 1 });
    const res = await patch("theirs", { qty: 9 });
    expect(res.status).toBe(404);
    expect(state.items[0].qty).toBe(1);
  });

  it("cannot delete another shopper's item", async () => {
    state.items.push({ id: "theirs", cartId: "cart_other", productSlug: "chiarel-essence", mode: "oneTime", qty: 1 });
    const res = await del("theirs");
    expect(res.status).toBe(404);
    expect(state.items).toHaveLength(1);
  });
});

describe("cart: quantity and removal", () => {
  beforeEach(async () => {
    await post({ slug: "chiarel-essence", mode: "oneTime" });
  });

  it.each([0, -1, 1.5, "3", null])("rejects invalid quantity %j", async (qty) => {
    expect((await patch("item_1", { qty })).status).toBe(400);
  });

  it("updates quantity and recomputes totals", async () => {
    const cart = await (await patch("item_1", { qty: 3 })).json();
    expect(cart.count).toBe(3);
    expect(cart.subtotal).toBe(360);
  });

  it("removes an item", async () => {
    const cart = await (await del("item_1")).json();
    expect(cart.lines).toHaveLength(0);
    expect(cart.subtotal).toBe(0);
  });

  it("returns 404 for an item that does not exist", async () => {
    expect((await del("missing")).status).toBe(404);
  });
});

describe("cart: failures", () => {
  it("returns a JSON 503 instead of an empty 500 when the database is down", async () => {
    state.carts = {
      has: () => {
        throw new Error("db down");
      },
    } as unknown as Set<string>;
    const res = await cartRoute.GET();
    expect(res.status).toBe(503);
    expect((await res.json()).error).toBeTruthy();
  });
});
