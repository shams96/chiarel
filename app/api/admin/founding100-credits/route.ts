import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withRole } from "@/lib/auth";
import { auditEntry } from "@/lib/audit";
import { withApiErrorHandling } from "@/lib/api-error";

// View access for ops staff (ADMIN + MEMBER) — matches this project's RBAC
// gate: MEMBER can see what's owed, only ADMIN can mark it redeemed (POST
// below). Never widened to VIEWER — this is real financial-liability data.
export const GET = withApiErrorHandling(
  withRole(["ADMIN", "MEMBER"], async () => {
    const orders = await db.order.findMany({
      where: { founding100Credit: { not: null } },
      select: {
        id: true,
        createdAt: true,
        email: true,
        founding100Credit: true,
        founding100CreditIssuedAt: true,
        status: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ orders });
  })
);

export const POST = withApiErrorHandling(
  withRole(["ADMIN"], async (req: NextRequest, actor) => {
    const body = await req.json().catch(() => null);
    const orderId = typeof body?.orderId === "string" ? body.orderId : "";
    if (!orderId) {
      return NextResponse.json({ error: "orderId is required" }, { status: 400 });
    }

    const order = await db.order.findUnique({ where: { id: orderId } });
    if (!order || order.founding100Credit == null) {
      return NextResponse.json(
        { error: "No Founding 100 credit owed on this order" },
        { status: 404 }
      );
    }
    if (order.founding100CreditIssuedAt) {
      return NextResponse.json({ error: "Credit already marked as issued" }, { status: 409 });
    }

    const [updated] = await db.$transaction([
      db.order.update({
        where: { id: orderId },
        data: { founding100CreditIssuedAt: new Date() },
        select: { id: true, founding100CreditIssuedAt: true },
      }),
      auditEntry(req, actor, {
        action: "founding100.credit_issued",
        entityType: "Order",
        entityId: orderId,
        summary: `Marked Founding 100 credit of ${order.founding100Credit} as issued for ${order.email}`,
        before: { founding100CreditIssuedAt: null },
        after: { founding100Credit: order.founding100Credit, issued: true },
      }),
    ]);
    return NextResponse.json({ order: updated });
  })
);
