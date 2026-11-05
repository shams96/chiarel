import type Stripe from "stripe";
import { db } from "@/lib/db";
import { sendOrderConfirmation } from "@/lib/order-email";

// The one place an order becomes paid. Both the Stripe webhook and the
// customer's return to /order/[id] call settleCheckoutSession(); whichever
// arrives first makes the transition, the other is a no-op. Everything that
// must happen exactly once on payment (confirmation email, cart clear) hangs
// off the `transitioned` flag returned here.

// A paid Stripe session is authoritative, so a late success is honoured even
// if we had already recorded a failed attempt or an expiry.
const PAYABLE_FROM = ["pending", "failed", "expired"];

export type SettleResult = {
  found: boolean;
  /** True only for the call that moved the order to paid. */
  transitioned: boolean;
  /** Set when the amount Stripe took does not match the order. Already logged. */
  mismatch: string | null;
};

function paymentIntentId(session: Stripe.Checkout.Session): string | null {
  const pi = session.payment_intent;
  if (typeof pi === "string") return pi;
  return pi?.id ?? null;
}

/**
 * Compare what Stripe charged with what the order says. Tax is added by Stripe,
 * so (amount_total - tax) must equal the order's pre-tax total. Money has
 * already been taken by now, so a mismatch is logged for a human, never used to
 * block the order.
 */
export function reconcileAmount(
  order: { id: string; total: number },
  amountTotal: number | null,
  taxCents: number,
): string | null {
  if (amountTotal == null) return null;
  const expected = order.total * 100;
  if (amountTotal - taxCents === expected) return null;
  return `order ${order.id}: Stripe charged ${amountTotal} cents (tax ${taxCents}), order total is ${expected} cents`;
}

export async function markOrderPaid(
  orderId: string,
  session: Stripe.Checkout.Session,
): Promise<SettleResult> {
  const order = await db.order.findUnique({
    where: { id: orderId },
    select: { id: true, total: true },
  });
  if (!order) return { found: false, transitioned: false, mismatch: null };

  const amountPaidCents = session.amount_total ?? null;
  const taxCents = session.total_details?.amount_tax ?? 0;
  const intent = paymentIntentId(session);

  const mismatch = reconcileAmount(order, amountPaidCents, taxCents);
  if (mismatch) console.error(`[alert] checkout.amount_mismatch ${mismatch}`);

  const record = {
    stripePaymentIntentId: intent,
    amountPaidCents,
    taxCents,
    currency: session.currency ?? null,
  };

  const moved = await db.order.updateMany({
    where: { id: orderId, status: { in: PAYABLE_FROM } },
    data: { status: "paid", paidAt: new Date(), ...record },
  });
  if (moved.count > 0) return { found: true, transitioned: true, mismatch };

  // Already paid by the other path. Make sure the payment record is complete:
  // before this existed the order page marked orders paid without the
  // PaymentIntent id, which left later disputes with nothing to attach to.
  if (intent) {
    await db.order.updateMany({
      where: { id: orderId, status: "paid", stripePaymentIntentId: null },
      data: record,
    });
  }
  return { found: true, transitioned: false, mismatch };
}

/** Mark paid, then send the confirmation email once, on the first transition. */
export async function settleCheckoutSession(
  orderId: string,
  session: Stripe.Checkout.Session,
): Promise<SettleResult> {
  const result = await markOrderPaid(orderId, session);
  if (result.transitioned) {
    // Never let a mail problem fail the payment path or trigger a webhook retry.
    await sendOrderConfirmation(orderId).catch((err) =>
      console.error(`[order-email] confirmation for ${orderId} failed:`, err),
    );
  }
  return result;
}
