import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const updateMany = vi.fn();
vi.mock("@/lib/db", () => ({ db: { order: { updateMany: (...a: unknown[]) => updateMany(...a) } } }));

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
  vi.spyOn(console, "error").mockImplementation(() => {});
});

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
  it("marks a pending order paid and stores the PaymentIntent id", async () => {
    const res = await POST(signed(completed()));
    expect(res.status).toBe(200);
    expect(updateMany).toHaveBeenCalledWith({
      where: { id: "order_1", status: "pending" },
      data: { status: "paid", stripePaymentIntentId: "pi_1" },
    });
  });

  it("only touches orders still pending, so redelivery is idempotent", async () => {
    await POST(signed(completed()));
    const arg = updateMany.mock.calls[0][0];
    expect(arg.where.status).toBe("pending");
  });

  it("does nothing when the session is not paid", async () => {
    const res = await POST(signed(completed({ payment_status: "unpaid" })));
    expect(res.status).toBe(200);
    expect(updateMany).not.toHaveBeenCalled();
  });

  it("does nothing when the session has no orderId", async () => {
    const res = await POST(signed(completed({ metadata: {} })));
    expect(res.status).toBe(200);
    expect(updateMany).not.toHaveBeenCalled();
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
