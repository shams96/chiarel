import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const updateMany = vi.fn();
const findUnique = vi.fn();
const sendConfirmation = vi.fn();
vi.mock("@/lib/db", () => ({
  db: { order: { updateMany: (...a: unknown[]) => updateMany(...a), findUnique: (...a: unknown[]) => findUnique(...a) } },
}));
vi.mock("@/lib/order-email", () => ({ sendOrderConfirmation: (...a: unknown[]) => sendConfirmation(...a) }));

const SECRET = "whsec_test_secret";
process.env.STRIPE_SECRET_KEY = "sk_test_unit";
process.env.STRIPE_WEBHOOK_SECRET = SECRET;

// Real Stripe library on purpose: signatures are verified for real, not mocked.
const { POST } = await import("@/app/api/webhooks/stripe/route");
const { stripe } = await import("@/lib/stripe");

function signed(event: object, secret = SECRET) {
  const payload = JSON.stringify(event);
  const header = stripe.webhooks.generateTestHeaderString({ payload, secret });
  return new NextRequest("http://localhost/api/webhooks/stripe", {
    method: "POST",
    body: payload,
    headers: { "stripe-signature": header },
  });
}

const completed = (over: Record<string, unknown> = {}) => ({
  id: "evt_1",
  type: "checkout.session.completed",
  created: 1_700_000_000,
  data: {
    object: {
      id: "cs_1",
      metadata: { orderId: "order_1" },
      payment_status: "paid",
      payment_intent: "pi_1",
      amount_total: 10000,
      currency: "usd",
      total_details: { amount_tax: 0 },
      ...over,
    },
  },
});

const dispute = (type: string) => ({
  id: "evt_2",
  type,
  created: 1_700_000_500,
  data: {
    object: {
      id: "dp_1",
      payment_intent: "pi_1",
      status: "needs_response",
      reason: "fraudulent",
      amount: 12000,
      created: 1_700_000_100,
    },
  },
});

beforeEach(() => {
  updateMany.mockReset();
  updateMany.mockResolvedValue({ count: 1 });
  findUnique.mockReset();
  findUnique.mockResolvedValue({ id: "order_1", total: 100 });
  sendConfirmation.mockReset();
  sendConfirmation.mockResolvedValue(undefined);
  vi.spyOn(console, "error").mockImplementation(() => {});
});

const errorCalls = () => (console.error as unknown as ReturnType<typeof vi.fn>).mock.calls;

describe("stripe webhook: authenticity", () => {
  it("rejects a request with no signature", async () => {
    const res = await POST(
      new NextRequest("http://localhost/api/webhooks/stripe", { method: "POST", body: "{}" }),
    );
    expect(res.status).toBe(400);
    expect(updateMany).not.toHaveBeenCalled();
  });

  it("rejects a payload signed with the wrong secret", async () => {
    const res = await POST(signed(completed(), "whsec_attacker"));
    expect(res.status).toBe(400);
    expect(updateMany).not.toHaveBeenCalled();
  });

  it("rejects a payload altered after signing", async () => {
    const good = signed(completed());
    const header = good.headers.get("stripe-signature")!;
    const tampered = new NextRequest("http://localhost/api/webhooks/stripe", {
      method: "POST",
      body: JSON.stringify(completed({ metadata: { orderId: "someone_elses_order" } })),
      headers: { "stripe-signature": header },
    });
    const res = await POST(tampered);
    expect(res.status).toBe(400);
    expect(updateMany).not.toHaveBeenCalled();
  });
});

describe("stripe webhook: payment reconciliation", () => {
  it("marks a payable order paid and stores the payment record", async () => {
    const res = await POST(signed(completed({ amount_total: 10850, total_details: { amount_tax: 850 } })));
    expect(res.status).toBe(200);
    const arg = updateMany.mock.calls[0][0];
    expect(arg.where).toEqual({ id: "order_1", status: { in: ["pending", "failed", "expired"] } });
    expect(arg.data).toMatchObject({
      status: "paid",
      stripePaymentIntentId: "pi_1",
      amountPaidCents: 10850,
      taxCents: 850,
      currency: "usd",
    });
    expect(arg.data.paidAt).toBeInstanceOf(Date);
  });

  it("never runs the transition on an order that is already paid or refunded", async () => {
    await POST(signed(completed()));
    const statuses = updateMany.mock.calls[0][0].where.status.in;
    expect(statuses).not.toContain("paid");
    expect(statuses).not.toContain("refunded");
  });

  it("sends the confirmation email only when this delivery made the transition", async () => {
    await POST(signed(completed()));
    expect(sendConfirmation).toHaveBeenCalledTimes(1);
    expect(sendConfirmation).toHaveBeenCalledWith("order_1");
  });

  it("does not email again on a redelivered event", async () => {
    updateMany.mockResolvedValue({ count: 0 });
    await POST(signed(completed()));
    expect(sendConfirmation).not.toHaveBeenCalled();
  });

  it("backfills the PaymentIntent id on an order the order page already marked paid", async () => {
    updateMany.mockResolvedValueOnce({ count: 0 }).mockResolvedValueOnce({ count: 1 });
    await POST(signed(completed()));
    expect(updateMany).toHaveBeenCalledTimes(2);
    expect(updateMany.mock.calls[1][0].where).toEqual({
      id: "order_1",
      status: "paid",
      stripePaymentIntentId: null,
    });
    expect(updateMany.mock.calls[1][0].data).toMatchObject({ stripePaymentIntentId: "pi_1" });
  });

  it("still accepts the payment when the confirmation email fails", async () => {
    sendConfirmation.mockRejectedValue(new Error("smtp down"));
    const res = await POST(signed(completed()));
    expect(res.status).toBe(200);
  });

  it("raises an alert when the amount Stripe took does not match the order, but still records the payment", async () => {
    const res = await POST(signed(completed({ amount_total: 9000 })));
    expect(res.status).toBe(200);
    expect(String(errorCalls()[0][0])).toContain("[alert] checkout.amount_mismatch");
    expect(updateMany.mock.calls[0][0].data.status).toBe("paid");
  });

  it("treats tax added by Stripe as expected, not as a mismatch", async () => {
    await POST(signed(completed({ amount_total: 10850, total_details: { amount_tax: 850 } })));
    expect(errorCalls()).toHaveLength(0);
  });

  it("does nothing when the session is not paid", async () => {
    const res = await POST(signed(completed({ payment_status: "unpaid" })));
    expect(res.status).toBe(200);
    expect(updateMany).not.toHaveBeenCalled();
    expect(sendConfirmation).not.toHaveBeenCalled();
  });

  it("does nothing when the session has no orderId", async () => {
    const res = await POST(signed(completed({ metadata: {} })));
    expect(res.status).toBe(200);
    expect(updateMany).not.toHaveBeenCalled();
  });

  it("ignores a paid session for an order that does not exist", async () => {
    findUnique.mockResolvedValue(null);
    const res = await POST(signed(completed()));
    expect(res.status).toBe(200);
    expect(updateMany).not.toHaveBeenCalled();
    expect(sendConfirmation).not.toHaveBeenCalled();
  });

  it("returns 500 when the database fails so Stripe retries", async () => {
    updateMany.mockRejectedValue(new Error("db down"));
    const res = await POST(signed(completed()));
    expect(res.status).toBe(500);
  });

  it("ignores unrelated event types", async () => {
    const res = await POST(signed({ id: "evt_3", type: "customer.created", created: 1, data: { object: {} } }));
    expect(res.status).toBe(200);
    expect(updateMany).not.toHaveBeenCalled();
  });
});

describe("stripe webhook: unpaid outcomes", () => {
  const expired = {
    id: "evt_4",
    type: "checkout.session.expired",
    created: 1,
    data: { object: { id: "cs_1", metadata: { orderId: "order_1" } } },
  };
  const failed = (metadata: Record<string, string> = { orderId: "order_1" }) => ({
    id: "evt_5",
    type: "payment_intent.payment_failed",
    created: 1,
    data: { object: { id: "pi_1", metadata } },
  });

  it("marks a pending order expired, and only a pending one", async () => {
    const res = await POST(signed(expired));
    expect(res.status).toBe(200);
    expect(updateMany).toHaveBeenCalledWith({
      where: { id: "order_1", status: "pending" },
      data: { status: "expired" },
    });
  });

  it("marks a pending order failed from the PaymentIntent metadata, and only a pending one", async () => {
    await POST(signed(failed()));
    expect(updateMany).toHaveBeenCalledWith({
      where: { id: "order_1", status: "pending" },
      data: { status: "failed" },
    });
  });

  it("skips a failed payment that carries no order id", async () => {
    const res = await POST(signed(failed({})));
    expect(res.status).toBe(200);
    expect(updateMany).not.toHaveBeenCalled();
  });

  it("returns 500 so Stripe retries when recording either outcome fails", async () => {
    updateMany.mockRejectedValue(new Error("db down"));
    expect((await POST(signed(expired))).status).toBe(500);
    expect((await POST(signed(failed()))).status).toBe(500);
  });
});

describe("stripe webhook: refunds", () => {
  const refund = (over: Record<string, unknown> = {}) => ({
    id: "evt_6",
    type: "charge.refunded",
    created: 1_700_001_000,
    data: { object: { id: "ch_1", payment_intent: "pi_1", amount_refunded: 10000, refunded: true, ...over } },
  });

  it("records a full refund against the order matched by PaymentIntent and sets it refunded", async () => {
    const res = await POST(signed(refund()));
    expect(res.status).toBe(200);
    const arg = updateMany.mock.calls[0][0];
    expect(arg.where).toEqual({ stripePaymentIntentId: "pi_1" });
    expect(arg.data).toMatchObject({ refundedCents: 10000, status: "refunded" });
    expect(arg.data.refundedAt).toEqual(new Date(1_700_001_000 * 1000));
  });

  it("records a partial refund without changing the order status", async () => {
    await POST(signed(refund({ amount_refunded: 2500, refunded: false })));
    const arg = updateMany.mock.calls[0][0];
    expect(arg.data.refundedCents).toBe(2500);
    expect(arg.data.status).toBeUndefined();
  });

  it("does not guess an order for a refund with no PaymentIntent", async () => {
    const res = await POST(signed(refund({ payment_intent: null })));
    expect(res.status).toBe(200);
    expect(updateMany).not.toHaveBeenCalled();
  });

  it("returns 500 when the database fails so Stripe retries", async () => {
    updateMany.mockRejectedValue(new Error("db down"));
    expect((await POST(signed(refund()))).status).toBe(500);
  });
});

describe("stripe webhook: disputes", () => {
  it("records a new dispute against the order matched by PaymentIntent", async () => {
    const res = await POST(signed(dispute("charge.dispute.created")));
    expect(res.status).toBe(200);
    const arg = updateMany.mock.calls[0][0];
    expect(arg.where).toEqual({ stripePaymentIntentId: "pi_1" });
    expect(arg.data).toMatchObject({
      disputeId: "dp_1",
      disputeStatus: "needs_response",
      disputeReason: "fraudulent",
      disputeAmount: 12000,
    });
    expect(arg.data.disputeOpenedAt).toEqual(new Date(1_700_000_100 * 1000));
    expect(arg.data.disputeClosedAt).toBeUndefined();
  });

  it("uses Stripe's event time for the close date, not the current time", async () => {
    await POST(signed(dispute("charge.dispute.closed")));
    const arg = updateMany.mock.calls[0][0];
    expect(arg.data.disputeClosedAt).toEqual(new Date(1_700_000_500 * 1000));
    expect(arg.data.disputeOpenedAt).toBeUndefined();
  });

  it("returns 500 when the database fails so Stripe retries", async () => {
    updateMany.mockRejectedValue(new Error("db down"));
    const res = await POST(signed(dispute("charge.dispute.created")));
    expect(res.status).toBe(500);
  });
});
