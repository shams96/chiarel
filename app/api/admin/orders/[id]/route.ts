import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withRole } from "@/lib/auth";
import { withApiErrorHandling } from "@/lib/api-error";
import { auditEntry } from "@/lib/audit";
import { allowedNext, planOrderUpdate, isFulfilmentStatus } from "@/lib/order-fulfilment";
import { presentOrder, shortId } from "@/lib/admin-orders";

type RouteContext = { params: Promise<{ id: string }> };

class StaleOrder extends Error {}

const detail = { items: { include: { product: { select: { name: true } } } } } as const;

export const GET = withApiErrorHandling(
  withRole<[RouteContext]>(["ADMIN", "MEMBER", "VIEWER"], async (_req, user, { params }) => {
    const { id } = await params;
    const order = await db.order.findUnique({ where: { id }, include: detail });
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
    const shaped = presentOrder(order, user.role);
    const next = isFulfilmentStatus(order.fulfilmentStatus) ? allowedNext(order.fulfilmentStatus) : [];
    return NextResponse.json({ order: shaped, allowedNext: user.role === "VIEWER" ? [] : next });
  })
);

// Move an order through fulfilment, set tracking, or save an internal note.
// Admin and Member; cancelling is Admin only (checked in planOrderUpdate).
// The write is conditional on the state the editor saw, so two people cannot
// both win, and the audit entry commits in the same transaction. Cancelling
// does not refund: that stays in Stripe.
export const PATCH = withApiErrorHandling(
  withRole<[RouteContext]>(["ADMIN", "MEMBER"], async (req, user, { params }) => {
    const { id } = await params;
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "A JSON body is required" }, { status: 400 });
    }

    const order = await db.order.findUnique({ where: { id } });
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    const plan = planOrderUpdate(order, body, user.role);
    if (!plan.ok) return NextResponse.json({ error: plan.error }, { status: plan.status });
    if (!plan.changed) return NextResponse.json({ order: presentOrder(order, user.role), unchanged: true });

    const tracking = (o: { trackingCarrier: string | null; trackingNumber: string | null }) =>
      o.trackingCarrier || o.trackingNumber ? `${o.trackingCarrier ?? ""} ${o.trackingNumber ?? ""}`.trim() : null;
    const after = { ...order, ...plan.data } as typeof order;
    const statusChanged = plan.to !== plan.from;

    try {
      await db.$transaction(async (tx) => {
        const res = await tx.order.updateMany({
          where: { id, fulfilmentStatus: plan.from },
          data: plan.data,
        });
        if (res.count !== 1) throw new StaleOrder();
        await auditEntry(
          req,
          user,
          {
            action: statusChanged ? "order.fulfilment_change" : "order.update",
            entityType: "Order",
            entityId: id,
            summary: statusChanged
              ? `Order ${shortId(id)}: ${plan.from} to ${plan.to}${tracking(after) ? ` (${tracking(after)})` : ""}`
              : `Order ${shortId(id)}: updated tracking or note`,
            before: {
              fulfilmentStatus: order.fulfilmentStatus,
              trackingCarrier: order.trackingCarrier,
              trackingNumber: order.trackingNumber,
              internalNote: order.internalNote,
            },
            after: {
              fulfilmentStatus: after.fulfilmentStatus,
              trackingCarrier: after.trackingCarrier,
              trackingNumber: after.trackingNumber,
              internalNote: after.internalNote,
            },
          },
          tx
        );
      });
    } catch (err) {
      if (err instanceof StaleOrder) {
        return NextResponse.json(
          { error: "This order was changed by someone else. Reload and try again." },
          { status: 409 }
        );
      }
      throw err;
    }

    const fresh = await db.order.findUnique({ where: { id }, include: detail });
    const next = fresh && isFulfilmentStatus(fresh.fulfilmentStatus) ? allowedNext(fresh.fulfilmentStatus) : [];
    return NextResponse.json({ order: fresh ? presentOrder(fresh, user.role) : null, allowedNext: next });
  })
);
