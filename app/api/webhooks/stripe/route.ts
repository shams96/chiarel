import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { settleCheckoutSession } from "@/lib/order-payment";

// Source of truth for order payment status. The order confirmation page
// (app/order/[id]/page.tsx) already re-verifies the session server-side on
// the customer's return redirect and is NOT spoofable — but a customer who
// closes the tab after paying never triggers that check, so the order stays
// "pending" forever with no reconciliation path. This webhook is what
// actually closes that gap, independent of whether the customer's browser
// ever comes back.
export async function POST(req: NextRequest) {
  const signature = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not configured");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error("Stripe webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId;

    if (orderId && session.payment_status === "paid") {
      try {
        // Shared with the order page: whichever path arrives first makes the
        // pending->paid move (guarded in the update, so redelivery is a no-op),
        // records the PaymentIntent id disputes and refunds match on, and sends
        // the confirmation email once.
        await settleCheckoutSession(orderId, session);
      } catch (err) {
        // Let this surface as a 500 (not caught/downgraded) so Stripe's
        // automatic retry has a chance to succeed once the DB recovers —
        // unlike customer-facing routes, a retry-worthy failure here should
        // NOT return a clean success-shaped response.
        console.error("Failed to reconcile order from Stripe webhook:", err);
        return NextResponse.json({ error: "Reconciliation failed" }, { status: 500 });
      }
    }
  }

  // The customer never paid: the session ran out, or the card was declined.
  // Both only touch orders still pending, so a redelivered event cannot undo a
  // payment, and a later successful payment on the same session still wins.
  if (event.type === "checkout.session.expired") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId;
    if (orderId) {
      try {
        await db.order.updateMany({
          where: { id: orderId, status: "pending" },
          data: { status: "expired" },
        });
      } catch (err) {
        console.error("Failed to record expired session from Stripe webhook:", err);
        return NextResponse.json({ error: "Reconciliation failed" }, { status: 500 });
      }
    }
  }

  if (event.type === "payment_intent.payment_failed") {
    // orderId rides on the PaymentIntent via payment_intent_data.metadata set at
    // checkout; sessions created before that carry none and are skipped.
    const intent = event.data.object as Stripe.PaymentIntent;
    const orderId = intent.metadata?.orderId;
    if (orderId) {
      try {
        await db.order.updateMany({
          where: { id: orderId, status: "pending" },
          data: { status: "failed" },
        });
      } catch (err) {
        console.error("Failed to record failed payment from Stripe webhook:", err);
        return NextResponse.json({ error: "Reconciliation failed" }, { status: 500 });
      }
    }
  }

  // Refunds are issued in the Stripe Dashboard; this only records them against
  // the order. Setting the same values on redelivery is harmless. A partial
  // refund records the amount and leaves the status as paid.
  if (event.type === "charge.refunded") {
    const charge = event.data.object as Stripe.Charge;
    const paymentIntentId = typeof charge.payment_intent === "string" ? charge.payment_intent : null;
    if (paymentIntentId) {
      try {
        await db.order.updateMany({
          where: { stripePaymentIntentId: paymentIntentId },
          data: {
            refundedCents: charge.amount_refunded,
            refundedAt: new Date(event.created * 1000),
            ...(charge.refunded ? { status: "refunded" } : {}),
          },
        });
      } catch (err) {
        console.error("Failed to record refund from Stripe webhook:", err);
        return NextResponse.json({ error: "Reconciliation failed" }, { status: 500 });
      }
    } else {
      console.error(`Refunded charge ${charge.id} has no payment_intent — cannot match to an order`);
    }
  }

  // Dispute handling — see claudedocs/specs/dispute-risk-mitigation/. This does
  // NOT submit evidence programmatically (Stripe's Dashboard/Smart Disputes stays
  // the actual response mechanism, per that spec's explicit scope boundary); it
  // exists purely to make dispute state visible against the order record instead
  // of only living in the Stripe Dashboard, and to feed the daily rate monitor.
  if (event.type === "charge.dispute.created" || event.type === "charge.dispute.closed") {
    const dispute = event.data.object as Stripe.Dispute;
    const paymentIntentId =
      typeof dispute.payment_intent === "string" ? dispute.payment_intent : null;

    if (paymentIntentId) {
      try {
        const isClosed = event.type === "charge.dispute.closed";
        await db.order.updateMany({
          where: { stripePaymentIntentId: paymentIntentId },
          data: {
            disputeId: dispute.id,
            disputeStatus: dispute.status,
            disputeReason: dispute.reason,
            disputeAmount: dispute.amount,
            // Use Stripe's own event timestamp, not `new Date()` — a redelivered
            // event must not shift these dates on retry.
            ...(isClosed
              ? { disputeClosedAt: new Date(event.created * 1000) }
              : { disputeOpenedAt: new Date(dispute.created * 1000) }),
          },
        });
      } catch (err) {
        console.error("Failed to reconcile dispute from Stripe webhook:", err);
        return NextResponse.json({ error: "Reconciliation failed" }, { status: 500 });
      }
    } else {
      console.error(`Dispute ${dispute.id} has no payment_intent — cannot match to an order`);
    }
  }

  return NextResponse.json({ received: true });
}
