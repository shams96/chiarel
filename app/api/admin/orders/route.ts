import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { withRole } from "@/lib/auth";
import { withApiErrorHandling } from "@/lib/api-error";
import { isFulfilmentStatus } from "@/lib/order-fulfilment";
import { maskEmail } from "@/lib/admin-orders";

const MAX_TAKE = 100;

const parseDate = (v: string | null, endOfDay = false) => {
  if (!v || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return undefined;
  const d = new Date(`${v}T${endOfDay ? "23:59:59.999" : "00:00:00.000"}Z`);
  return Number.isNaN(d.getTime()) ? undefined : d;
};

// Order list for the console. All roles may read it; a Viewer gets a redacted
// shape (masked email, no name) and can search by order id only, so the search
// box cannot be used to probe which customer emails exist.
//   ?fulfilment=packed  ?payment=paid|pending  ?country=US  ?from=YYYY-MM-DD  ?to=YYYY-MM-DD
//   ?q=<order id | email | surname | tracking number>  ?take=50  ?cursor=<id>
export const GET = withApiErrorHandling(
  withRole(["ADMIN", "MEMBER", "VIEWER"], async (req: NextRequest, user) => {
    const q = req.nextUrl.searchParams;
    const take = Math.min(MAX_TAKE, Math.max(1, Number(q.get("take")) || 50));
    const cursor = q.get("cursor");
    const fulfilment = q.get("fulfilment");
    const payment = q.get("payment");
    const country = q.get("country")?.trim().toUpperCase();
    const from = parseDate(q.get("from"));
    const to = parseDate(q.get("to"), true);
    const search = q.get("q")?.trim();
    const viewer = user.role === "VIEWER";

    const where: Prisma.OrderWhereInput = {
      ...(isFulfilmentStatus(fulfilment) ? { fulfilmentStatus: fulfilment } : {}),
      ...(payment === "paid" || payment === "pending" ? { status: payment } : {}),
      ...(country ? { country } : {}),
      ...(from || to ? { createdAt: { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) } } : {}),
      ...(search
        ? {
            OR: viewer
              ? [{ id: { endsWith: search } }, { id: { startsWith: search } }]
              : [
                  { id: { endsWith: search } },
                  { id: { startsWith: search } },
                  { email: { contains: search, mode: "insensitive" as const } },
                  { lastName: { contains: search, mode: "insensitive" as const } },
                  { trackingNumber: { contains: search, mode: "insensitive" as const } },
                ],
          }
        : {}),
    };

    const rows = await db.order.findMany({
      where,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: take + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      select: {
        id: true,
        createdAt: true,
        email: true,
        firstName: true,
        lastName: true,
        country: true,
        total: true,
        status: true,
        fulfilmentStatus: true,
        disputeStatus: true,
        _count: { select: { items: true } },
      },
    });

    const hasMore = rows.length > take;
    const page = hasMore ? rows.slice(0, take) : rows;
    const orders = page.map((o) => ({
      id: o.id,
      createdAt: o.createdAt,
      name: viewer ? null : `${o.firstName} ${o.lastName}`.trim(),
      email: viewer ? maskEmail(o.email) : o.email,
      country: o.country,
      total: o.total,
      status: o.status,
      fulfilmentStatus: o.fulfilmentStatus,
      disputeStatus: o.disputeStatus,
      itemCount: o._count.items,
    }));
    return NextResponse.json({ orders, nextCursor: hasMore ? page[page.length - 1].id : null });
  })
);
