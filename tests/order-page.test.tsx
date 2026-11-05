import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

type Order = Record<string, any>;
const state = { order: null as Order | null };
const settle = vi.fn();
const retrieve = vi.fn();
const deleteMany = vi.fn();

vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("NOT_FOUND");
  },
}));
vi.mock("next/headers", () => ({ cookies: async () => ({ get: () => undefined }) }));
vi.mock("next/image", () => ({ default: (p: any) => <img alt={p.alt} src={p.src} /> }));
vi.mock("@/components/TrackPurchase", () => ({
  default: ({ purchase }: any) => <span data-purchase={JSON.stringify(purchase)} />,
}));
vi.mock("@/components/account/SaveRitual", () => ({ default: () => null }));
vi.mock("@/components/RefreshBag", () => ({ default: () => <span data-refresh-bag /> }));
vi.mock("@/lib/customer-session", () => ({
  CUSTOMER_COOKIE: "chiarel_session",
  resolveCustomerSession: async () => null,
}));
vi.mock("@/lib/cart-server", () => ({ getOrCreateCart: async () => ({ id: "cart_1" }) }));
vi.mock("@/lib/stripe", () => ({ stripe: { checkout: { sessions: { retrieve: (...a: unknown[]) => retrieve(...a) } } } }));
vi.mock("@/lib/order-payment", () => ({ settleCheckoutSession: (...a: unknown[]) => settle(...a) }));
vi.mock("@/lib/db", () => ({
  db: {
    order: { findUnique: async () => state.order },
    cartItem: { deleteMany: (...a: unknown[]) => deleteMany(...a) },
  },
}));

const { default: Page } = await import("@/app/order/[id]/page");
const { getProduct } = await import("@/lib/products");

const base = (over: Order = {}): Order => ({
  id: "cl_abcdefgh12345678",
  status: "pending",
  stripeSessionId: "cs_1",
  firstName: "Ada",
  email: "ada@example.com",
  subtotal: 118,
  savings: 0,
  shipping: 0,
  total: 118,
  amountPaidCents: null,
  taxCents: null,
  currency: null,
  confirmationEmailAt: null,
  items: [
    {
      id: "i1",
      productSlug: "chiarel-essence",
      mode: "subscription",
      qty: 1,
      unitPrice: 118,
      product: { name: "Clarity Essence", image: "/e.png" },
    },
  ],
  ...over,
});

const render = async (sessionId: string | null = "cs_1") =>
  renderToStaticMarkup(
    await Page({
      params: Promise.resolve({ id: "cl_abcdefgh12345678" }),
      searchParams: Promise.resolve({ session_id: sessionId ?? undefined }),
    }),
  );

beforeEach(() => {
  state.order = base();
  settle.mockReset();
  retrieve.mockReset();
  deleteMany.mockReset();
});

describe("order page: access", () => {
  it("shows nothing for an unknown order", async () => {
    state.order = null;
    await expect(render()).rejects.toThrow("NOT_FOUND");
  });

  it("shows nothing when the Stripe session id is missing or wrong, however valid the order id", async () => {
    await expect(render(null)).rejects.toThrow("NOT_FOUND");
    await expect(render("cs_other")).rejects.toThrow("NOT_FOUND");
  });
});

describe("order page: confirming payment", () => {
  it("settles through the shared path, empties the bag and shows the order as confirmed", async () => {
    retrieve.mockResolvedValue({ payment_status: "paid" });
    state.order = base({ status: "pending" });
    settle.mockImplementation(async () => {
      state.order = base({ status: "paid", amountPaidCents: 12744, taxCents: 944, currency: "usd" });
    });
    const html = await render();
    expect(settle).toHaveBeenCalledWith("cl_abcdefgh12345678", { payment_status: "paid" });
    expect(deleteMany).toHaveBeenCalledWith({ where: { cartId: "cart_1" } });
    expect(html).toContain("Payment received");
    expect(html).toContain("#12345678");
    expect(html).toContain("Total (incl. tax)");
    expect(html).toContain("$127.44");
    expect(html).toContain("$9.44");
  });

  it("reports GA4 purchase value including tax, in USD (the only currency charged)", async () => {
    retrieve.mockResolvedValue({ payment_status: "paid" });
    settle.mockImplementation(async () => {
      state.order = base({ status: "paid", amountPaidCents: 12744, taxCents: 944, currency: "usd" });
    });
    const html = await render();
    const purchase = JSON.parse(/data-purchase="([^"]*)"/.exec(html)![1].replace(/&quot;/g, '"'));
    expect(purchase).toMatchObject({ transaction_id: "cl_abcdefgh12345678", currency: "USD", value: 127.44 });
  });

  it("does not claim an email was sent unless one was", async () => {
    state.order = base({ status: "paid", confirmationEmailAt: null });
    expect(await render()).not.toContain("has been sent");
    state.order = base({ status: "paid", confirmationEmailAt: new Date() });
    const html = await render();
    expect(html).toContain("confirmation has been sent to ada@example.com");
    expect(html).not.toContain("receipt");
  });

  it("leaves an already-paid order alone: no Stripe call, no settle, bag untouched", async () => {
    state.order = base({ status: "paid" });
    await render();
    expect(retrieve).not.toHaveBeenCalled();
    expect(settle).not.toHaveBeenCalled();
    expect(deleteMany).not.toHaveBeenCalled();
  });

  it("says payment is unconfirmed, and charges nothing, when Stripe reports unpaid", async () => {
    retrieve.mockResolvedValue({ payment_status: "unpaid" });
    const html = await render();
    expect(settle).not.toHaveBeenCalled();
    expect(deleteMany).not.toHaveBeenCalled();
    expect(html).toContain("confirm payment for order");
    expect(html).toContain("no charge has been made");
    expect(html).not.toContain("data-purchase");
  });

  it("welcomes a paid order, refreshes the bag, and tells the customer how to use what they bought", async () => {
    state.order = base({
      status: "paid",
      items: [
        { id: "i1", productSlug: "chiarel-essence", mode: "oneTime", qty: 1, unitPrice: 189, product: { name: "Clarity Essence", image: "/e.png" } },
      ],
    });
    const html = await render();
    expect(html).toContain("Welcome to the House of Clarity");
    expect(html).toContain("data-refresh-bag");
    expect(html).toContain("Your CHIAREL Ritual");
    const steps = getProduct("chiarel-essence")?.howToUse ?? [];
    expect(steps.length).toBeGreaterThan(0);
    // Directions come from the published product data, character for character.
    expect(html).toContain(steps[0].replace(/&/g, "&amp;").replace(/'/g, "&#x27;"));
  });

  it("shows no directions for a product that has none published", async () => {
    state.order = base({
      status: "paid",
      items: [{ id: "i1", productSlug: "no-such-product", mode: "oneTime", qty: 1, unitPrice: 1, product: { name: "X", image: "/x.png" } }],
    });
    expect(await render()).not.toContain("Your CHIAREL Ritual");
  });

  it("does not welcome, refresh the bag or give directions before payment is confirmed", async () => {
    retrieve.mockResolvedValue({ payment_status: "unpaid" });
    const html = await render();
    expect(html).not.toContain("Welcome to the House of Clarity");
    expect(html).not.toContain("data-refresh-bag");
    expect(html).not.toContain("Your CHIAREL Ritual");
  });

  it("gives an unconfirmed order a real way to reach us", async () => {
    retrieve.mockResolvedValue({ payment_status: "unpaid" });
    expect(await render()).toMatch(/href="\/contact"[^>]*>contact us/);
  });

  it("keeps showing a refunded order as a paid one", async () => {
    state.order = base({ status: "refunded", amountPaidCents: 11800, currency: "usd" });
    const html = await render();
    expect(html).toContain("Payment received");
  });
});
