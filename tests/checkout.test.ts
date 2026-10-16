import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import Stripe from "stripe";

type Line = {
  id: string;
  slug: string;
  mode: "ninetyDay" | "subscription" | "oneTime";
  qty: number;
  unitPrice: number;
  product: { name: string; image: string; descriptor: string };
};
const cartState = { lines: [] as Line[], subtotal: 0, savings: 0 };
const rate = { limited: false };

const orderCreate = vi.fn();
const orderUpdate = vi.fn();
const customersList = vi.fn();
const customersCreate = vi.fn();
const customersUpdate = vi.fn();
const sessionsCreate = vi.fn();

vi.mock("@/lib/cart-server", () => ({
  getCartWithTotals: async () => ({ cartId: "cart_1", ...cartState, count: 0 }),
  getOrCreateCart: async () => ({ id: "cart_1" }),
}));
vi.mock("@/lib/rate-limit", () => ({ isRateLimited: () => rate.limited, clientIp: () => "1.2.3.4" }));
vi.mock("@/lib/products", () => ({ getProductOrThrow: () => ({ price: { subscription: 118 } }) }));
vi.mock("@/lib/db", () => ({ db: { order: { create: (...a: unknown[]) => orderCreate(...a), update: (...a: unknown[]) => orderUpdate(...a) } } }));
vi.mock("@/lib/stripe", () => ({
  stripe: {
    customers: {
      list: (...a: unknown[]) => customersList(...a),
      create: (...a: unknown[]) => customersCreate(...a),
      update: (...a: unknown[]) => customersUpdate(...a),
    },
    checkout: { sessions: { create: (...a: unknown[]) => sessionsCreate(...a) } },
  },
}));

const { POST } = await import("@/app/api/checkout/route");

const line = (over: Partial<Line> = {}): Line => ({
  id: "i1",
  slug: "chiarel-essence",
  mode: "oneTime",
  qty: 1,
  unitPrice: 100,
  product: { name: "Essence", image: "/e.png", descriptor: "d" },
  ...over,
});

const validBody = {
  email: "a@b.com",
  firstName: "Ada",
  lastName: "Lovelace",
  address: "1 Main St",
  city: "Austin",
  country: "US",
  state: "TX",
  zip: "78701",
  termsAccepted: true,
  termsVersion: "2026-09",
};

const checkout = (body: unknown) =>
  POST(
    new NextRequest("http://localhost/api/checkout", {
      method: "POST",
      body: JSON.stringify(body),
      headers: { origin: "https://chiarel.com" },
    }),
  );

function setCart(lines: Line[]) {
  cartState.lines = lines;
  cartState.subtotal = lines.reduce((s, l) => s + l.unitPrice * l.qty, 0);
  cartState.savings = 0;
}

beforeEach(() => {
  vi.clearAllMocks();
  rate.limited = false;
  setCart([line()]);
  orderCreate.mockImplementation(async ({ data }) => ({ id: "order_1", ...data }));
  orderUpdate.mockResolvedValue({});
  customersList.mockResolvedValue({ data: [] });
  customersCreate.mockResolvedValue({ id: "cus_new" });
  customersUpdate.mockResolvedValue({ id: "cus_old" });
  sessionsCreate.mockResolvedValue({ id: "cs_1", url: "https://checkout.stripe.com/c/cs_1" });
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("checkout: request validation", () => {
  it("returns 429 when rate limited, before touching anything", async () => {
    rate.limited = true;
    const res = await checkout(validBody);
    expect(res.status).toBe(429);
    expect(orderCreate).not.toHaveBeenCalled();
  });

  it("rejects an unsupported country", async () => {
    expect((await checkout({ ...validBody, country: "FR" })).status).toBe(400);
  });

  it("rejects a missing body", async () => {
    expect((await checkout(null)).status).toBe(400);
  });

  it("names the missing fields", async () => {
    const res = await checkout({ ...validBody, firstName: "  ", city: undefined });
    expect(res.status).toBe(400);
    const { error } = await res.json();
    expect(error).toContain("firstName");
    expect(error).toContain("city");
  });

  it("requires a state for US but not for Italy", async () => {
    expect((await checkout({ ...validBody, state: undefined })).status).toBe(400);
    const it = await checkout({ ...validBody, country: "IT", state: undefined });
    expect(it.status).toBe(201);
  });

  it("rejects a missing zip and an email without @", async () => {
    expect((await checkout({ ...validBody, zip: "" })).status).toBe(400);
    expect((await checkout({ ...validBody, email: "nope" })).status).toBe(400);
  });

  it("requires terms acceptance on the server", async () => {
    expect((await checkout({ ...validBody, termsAccepted: false })).status).toBe(400);
    expect((await checkout({ ...validBody, termsAccepted: "true" })).status).toBe(400);
    expect((await checkout({ ...validBody, termsVersion: "" })).status).toBe(400);
    expect(orderCreate).not.toHaveBeenCalled();
  });

  it("rejects an empty cart", async () => {
    setCart([]);
    const res = await checkout(validBody);
    expect(res.status).toBe(400);
    expect(orderCreate).not.toHaveBeenCalled();
  });
});

describe("checkout: totals", () => {
  it("charges 12 shipping under the free-shipping threshold", async () => {
    setCart([line({ unitPrice: 100 })]);
    await checkout(validBody);
    const data = orderCreate.mock.calls[0][0].data;
    expect(data).toMatchObject({ subtotal: 100, shipping: 12, total: 112, bonusSample: false });
    const items = sessionsCreate.mock.calls[0][0].line_items;
    expect(items).toHaveLength(2);
    expect(items[1].price_data).toMatchObject({ unit_amount: 1200 });
    expect(items[1].price_data.product_data.name).toBe("Shipping");
  });

  it("ships a subscription under 150 free (no Shipping line item)", async () => {
    setCart([line({ mode: "subscription", unitPrice: 118 })]);
    await checkout(validBody);
    expect(orderCreate.mock.calls[0][0].data).toMatchObject({ subtotal: 118, shipping: 0, total: 118 });
    expect(sessionsCreate.mock.calls[0][0].line_items).toHaveLength(1);
  });

  it("ships the whole bag free when any line is a Ritual Plan", async () => {
    setCart([line({ mode: "ninetyDay", unitPrice: 100 }), line({ id: "i2", slug: "other", unitPrice: 20 })]);
    await checkout(validBody);
    expect(orderCreate.mock.calls[0][0].data).toMatchObject({ shipping: 0 });
  });

  it("ships free at exactly 150", async () => {
    setCart([line({ unitPrice: 150 })]);
    await checkout(validBody);
    const data = orderCreate.mock.calls[0][0].data;
    expect(data).toMatchObject({ shipping: 0, total: 150 });
    expect(sessionsCreate.mock.calls[0][0].line_items).toHaveLength(1);
  });

  it("adds the bonus sample at 250 and not before", async () => {
    setCart([line({ unitPrice: 249 })]);
    await checkout(validBody);
    expect(orderCreate.mock.calls[0][0].data.bonusSample).toBe(false);
    orderCreate.mockClear();
    setCart([line({ unitPrice: 250 })]);
    await checkout(validBody);
    expect(orderCreate.mock.calls[0][0].data.bonusSample).toBe(true);
  });

  it("sends Stripe the server-computed price in cents, not anything from the request", async () => {
    setCart([line({ unitPrice: 189.5, qty: 2 })]);
    await checkout({ ...validBody, total: 1, unitPrice: 1, lineItems: [] });
    const item = sessionsCreate.mock.calls[0][0].line_items[0];
    expect(item.price_data.unit_amount).toBe(18950);
    expect(item.quantity).toBe(2);
    expect(item.price_data.currency).toBe("usd");
  });

  it("never writes a founders credit on the order", async () => {
    setCart([line({ slug: "n1-neck-decollete", mode: "ninetyDay", unitPrice: 236 })]);
    await checkout(validBody);
    expect(orderCreate.mock.calls[0][0].data.founding100Credit).toBeUndefined();
  });
});

describe("checkout: order and Stripe session", () => {
  it("creates a pending order with a terms timestamp and the cart lines", async () => {
    await checkout(validBody);
    const data = orderCreate.mock.calls[0][0].data;
    expect(data.status).toBe("pending");
    expect(data.termsVersion).toBe("2026-09");
    expect(data.termsAcceptedAt).toBeInstanceOf(Date);
    expect(data.items.create).toEqual([
      { productSlug: "chiarel-essence", mode: "oneTime", qty: 1, unitPrice: 100 },
    ]);
  });

  it("drops state for countries that do not use one", async () => {
    await checkout({ ...validBody, country: "IT", state: "RM" });
    expect(orderCreate.mock.calls[0][0].data.state).toBeNull();
  });

  it("returns 201 with the order id and Stripe URL, and links the session to the order", async () => {
    const res = await checkout(validBody);
    expect(res.status).toBe(201);
    expect(await res.json()).toEqual({
      orderId: "order_1",
      checkoutUrl: "https://checkout.stripe.com/c/cs_1",
    });
    expect(orderUpdate).toHaveBeenCalledWith({
      where: { id: "order_1" },
      data: { stripeSessionId: "cs_1" },
    });
    const args = sessionsCreate.mock.calls[0][0];
    expect(args.metadata).toEqual({ orderId: "order_1" });
    expect(args.success_url).toBe("https://chiarel.com/order/order_1?session_id={CHECKOUT_SESSION_ID}");
    expect(args.cancel_url).toBe("https://chiarel.com/checkout");
    expect(args.automatic_tax).toEqual({ enabled: true });
  });

  it("reuses an existing Stripe customer only when the address on file matches, and never rewrites it", async () => {
    customersList.mockResolvedValue({
      data: [{ id: "cus_old", address: { line1: validBody.address, postal_code: validBody.zip, country: validBody.country } }],
    });
    await checkout(validBody);
    expect(customersCreate).not.toHaveBeenCalled();
    expect(customersUpdate).not.toHaveBeenCalled();
    expect(sessionsCreate.mock.calls[0][0].customer).toBe("cus_old");
  });

  it("creates a new customer, leaving the old one untouched, when the email matches but the address differs", async () => {
    customersList.mockResolvedValue({
      data: [{ id: "cus_old", address: { line1: "9 Other Rd", postal_code: "99999", country: "US" } }],
    });
    await checkout(validBody);
    expect(customersUpdate).not.toHaveBeenCalled();
    expect(customersCreate).toHaveBeenCalledTimes(1);
    expect(sessionsCreate.mock.calls[0][0].customer).toBe("cus_new");
  });

  it("creates a customer when none exists", async () => {
    await checkout(validBody);
    expect(customersCreate).toHaveBeenCalledTimes(1);
    expect(sessionsCreate.mock.calls[0][0].customer).toBe("cus_new");
  });

  it("returns 502 when Stripe gives no checkout URL", async () => {
    sessionsCreate.mockResolvedValue({ id: "cs_1", url: null });
    expect((await checkout(validBody)).status).toBe(502);
  });
});

describe("checkout: automatic tax fallback", () => {
  it("retries without automatic tax only for the head-office-address error", async () => {
    sessionsCreate
      .mockRejectedValueOnce(
        new Stripe.errors.StripeInvalidRequestError({
          type: "invalid_request_error",
          message: "You must have a valid head office address to enable automatic tax",
        }),
      )
      .mockResolvedValueOnce({ id: "cs_2", url: "https://checkout.stripe.com/c/cs_2" });
    const res = await checkout(validBody);
    expect(res.status).toBe(201);
    expect(sessionsCreate).toHaveBeenCalledTimes(2);
    expect(sessionsCreate.mock.calls[1][0].automatic_tax).toBeUndefined();
  });

  it("does not swallow other Stripe errors", async () => {
    sessionsCreate.mockRejectedValue(
      new Stripe.errors.StripeInvalidRequestError({ type: "invalid_request_error", message: "No such price" }),
    );
    const res = await checkout(validBody);
    expect(res.status).toBe(503);
    expect(sessionsCreate).toHaveBeenCalledTimes(1);
  });

  it("returns a JSON 503 when the database fails", async () => {
    orderCreate.mockRejectedValue(new Error("db down"));
    const res = await checkout(validBody);
    expect(res.status).toBe(503);
    expect((await res.json()).error).toBeTruthy();
  });
});
