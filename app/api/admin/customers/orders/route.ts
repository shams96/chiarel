import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withRole } from "@/lib/auth";
import { withApiErrorHandling } from "@/lib/api-error";

const EMAIL = /^[^\s@]+@[^\s@]+$/;

// One customer's orders. A POST with the email in the JSON body, not a GET with
// the email in the path or query string, so personal data stays out of URLs and
// access logs. Admin and Member only: a Viewer gets no drill-down.
export const POST = withApiErrorHandling(
  withRole(["ADMIN", "MEMBER"], async (req: NextRequest) => {
    const body = await req.json().catch(() => null);
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    if (!email || email.length > 254 || !EMAIL.test(email)) {
      return NextResponse.json({ error: "A valid email is required" }, { status: 400 });
    }

    const orders = await db.order.findMany({
      where: { email: { equals: email, mode: "insensitive" } },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: 100,
      select: {
        id: true,
        createdAt: true,
        total: true,
        status: true,
        fulfilmentStatus: true,
        country: true,
        _count: { select: { items: true } },
      },
    });
    return NextResponse.json({
      orders: orders.map((o) => ({
        id: o.id,
        createdAt: o.createdAt,
        total: o.total,
        status: o.status,
        fulfilmentStatus: o.fulfilmentStatus,
        country: o.country,
        itemCount: o._count.items,
      })),
    });
  })
);
