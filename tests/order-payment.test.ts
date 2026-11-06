import { describe, it, expect, vi, beforeEach } from "vitest";
import type Stripe from "stripe";

// A one-order in-memory database whose updateMany honours the where-clauses the
// payment code relies on. Each updateMany body is synchronous after its await,
// so it is atomic the way a single SQL UPDATE is.
type Row = {
  id: string;
  total: number;
  status: string;
  stripePaymentIntentId: string | null;
  amountPaidCents: number | null;
  taxCents: number | null;
  paidAt: Date | null;
};
const store = { order: null as Row | null };

vi.mock("@/lib/db", () => ({
  db: {
    order: {
      findUnique: async ({ where }: { where: { id: string } }) =>
        store.order && store.order.id === where.id ? store.order : null,
      updateMany: async ({ where, data }: { where: Record<string, any>; data: Partial<Row> }) => {
        const o = store.order;
        if (!o || o.id !== where.id) return { count: 0 };
        if (where.status) {
          const allowed: string[] = where.status.in ?? [where.status];
          if (!allowed.includes(o.status)) return { count: 0 };
        }
        if ("stripePaymentIntentId" in where && o.stripePaymentIntentId !== where.stripePaymentIntentId) {
          return { count: 0 };
        }
        Object.assign(o, data);
        return { count: 1 };
      },
    },
  },
}));

const sendConfirmation = vi.fn();
vi.mock("@/lib/order-email", () => ({ sendOrderConfirmation: (...a: unknown[]) => sendConfirmation(...a) }));

const { markOrderPaid, settleCheckoutSession, reconcileAmount } = await import("@/lib/order-payment");

const session = (over: Partial<Stripe.Checkout.Session> = {}) =>
  ({
    id: "cs_1",
    payment_status: "paid",
    payment_intent: "pi_1",
    amount_total: 10850,
    currency: "usd",
    total_details: { amount_tax: 850 },
    ...over,
  }) as Stripe.Checkout.Session;

const freshOrder = (over: Partial<Row> = {}): Row => ({
  id: "order_1",
  total: 100,
  status: "pending",
  stripePaymentIntentId: null,
  amountPaidCents: null,
  taxCents: null,
  paidAt: null,
  ...over,
});

beforeEach(() => {
  store.order = freshOrder();
  sendConfirmation.mockReset();
  sendConfirmation.mockResolvedValue(undefined);
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("reconcileAmount", () => {
  it("accepts a charge equal to the order total plus tax", () => {
    expect(reconcileAmount({ id: "o", total: 100 }, 10850, 850)).toBeNull();
    expect(reconcileAmount({ id: "o", total: 100 }, 10000, 0)).toBeNull();
  });
  it("describes a charge that differs, with both figures", () => {
    const msg = reconcileAmount({ id: "o1", total: 100 }, 9000, 0);
    expect(msg).toContain("o1");
    expect(msg).toContain("9000");
    expect(msg).toContain("10000");
  });
  it("cannot judge a session with no amount", () => {
    expect(reconcileAmount({ id: "o", total: 100 }, null, 0)).toBeNull();
  });
});

describe("markOrderPaid", () => {
  it("moves a pending order to paid with the full payment record", async () => {
    const r = await markOrderPaid("order_1", session());
    expect(r).toEqual({ found: true, transitioned: true, mismatch: null });
    expect(store.order).toMatchObject({
      status: "paid",
      stripePaymentIntentId: "pi_1",
      amountPaidCents: 10850,
      taxCents: 850,
    });
    expect(store.order?.paidAt).toBeInstanceOf(Date);
  });

  it("honours a late successful payment on an order recorded as failed or expired", async () => {
    for (const status of ["failed", "expired"]) {
      store.order = freshOrder({ status });
      expect((await markOrderPaid("order_1", session())).transitioned).toBe(true);
      expect(store.order.status).toBe("paid");
    }
  });

  it("does not resurrect a refunded order", async () => {
    store.order = freshOrder({ status: "refunded", stripePaymentIntentId: "pi_1" });
    expect((await markOrderPaid("order_1", session())).transitioned).toBe(false);
    expect(store.order.status).toBe("refunded");
  });

  it("reports an unknown order without writing", async () => {
    expect(await markOrderPaid("nope", session())).toEqual({ found: false, transitioned: false, mismatch: null });
  });

  it("flags and logs a mismatch yet still marks the order paid", async () => {
    const r = await markOrderPaid("order_1", session({ amount_total: 5000, total_details: { amount_tax: 0 } } as any));
    expect(r.transitioned).toBe(true);
    expect(r.mismatch).toContain("5000");
    expect(String((console.error as any).mock.calls[0][0])).toContain("[alert] checkout.amount_mismatch");
  });

  it("accepts a PaymentIntent given as an expanded object", async () => {
    await markOrderPaid("order_1", session({ payment_intent: { id: "pi_obj" } as any }));
    expect(store.order?.stripePaymentIntentId).toBe("pi_obj");
  });
});

describe("settleCheckoutSession: webhook and order page race", () => {
  it("webhook first, then the customer's return: one email, record complete", async () => {
    const webhook = await settleCheckoutSession("order_1", session());
    const page = await settleCheckoutSession("order_1", session());
    expect(webhook.transitioned).toBe(true);
    expect(page.transitioned).toBe(false);
    expect(sendConfirmation).toHaveBeenCalledTimes(1);
    expect(store.order?.stripePaymentIntentId).toBe("pi_1");
  });

  it("customer's return first, then the webhook: one email", async () => {
    await settleCheckoutSession("order_1", session());
    await settleCheckoutSession("order_1", session());
    expect(sendConfirmation).toHaveBeenCalledTimes(1);
  });

  it("both at the same moment: exactly one wins and one email goes out", async () => {
    const [a, b] = await Promise.all([
      settleCheckoutSession("order_1", session()),
      settleCheckoutSession("order_1", session()),
    ]);
    expect([a.transitioned, b.transitioned].filter(Boolean)).toHaveLength(1);
    expect(sendConfirmation).toHaveBeenCalledTimes(1);
  });

  it("repairs an order an older page marked paid with no PaymentIntent id", async () => {
    store.order = freshOrder({ status: "paid" });
    const r = await settleCheckoutSession("order_1", session());
    expect(r.transitioned).toBe(false);
    expect(store.order.stripePaymentIntentId).toBe("pi_1");
    expect(store.order.amountPaidCents).toBe(10850);
    expect(sendConfirmation).not.toHaveBeenCalled();
  });

  it("a failed email never fails the payment", async () => {
    sendConfirmation.mockRejectedValue(new Error("smtp down"));
    const r = await settleCheckoutSession("order_1", session());
    expect(r.transitioned).toBe(true);
    expect(store.order?.status).toBe("paid");
  });
});
