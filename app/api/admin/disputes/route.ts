import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { withRole } from "@/lib/auth";
import { withApiErrorHandling } from "@/lib/api-error";
import { computeDisputeRateReport } from "@/lib/dispute-monitoring";
import { paymentsMode } from "@/lib/admin-dashboard";
import { presentDispute } from "@/lib/admin-disputes";

const MAX_TAKE = 100;

// Read-only disputes view (Admin and Member; it holds customer details and
// financial exposure, so never Viewer). Newest dispute first.
//   ?status=open|closed|all (default all)  ?take=50 (max 100)  ?cursor=<order id>
// Returns the current dispute-rate report, headline counts, and each dispute
// with an evidence checklist and a Stripe dashboard link.
export const GET = withApiErrorHandling(
  withRole(["ADMIN", "MEMBER"], async (req: NextRequest) => {
    const q = req.nextUrl.searchParams;
    const take = Math.min(MAX_TAKE, Math.max(1, Number(q.get("take")) || 50));
    const cursor = q.get("cursor");
    const status = q.get("status");

    const base: Prisma.OrderWhereInput = { disputeId: { not: null } };
    const where: Prisma.OrderWhereInput = {
      ...base,
      ...(status === "open" ? { disputeClosedAt: null } : status === "closed" ? { disputeClosedAt: { not: null } } : {}),
    };

    const [rows, report, open, closed, openSum] = await Promise.all([
      db.order.findMany({
        where,
        orderBy: [{ disputeOpenedAt: { sort: "desc", nulls: "last" } }, { id: "desc" }],
        take: take + 1,
        ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
        include: { items: { include: { product: { select: { name: true } } } } },
      }),
      computeDisputeRateReport(),
      db.order.count({ where: { ...base, disputeClosedAt: null } }),
      db.order.count({ where: { ...base, disputeClosedAt: { not: null } } }),
      db.order.aggregate({ where: { ...base, disputeClosedAt: null }, _sum: { disputeAmount: true } }),
    ]);

    const hasMore = rows.length > take;
    const page = hasMore ? rows.slice(0, take) : rows;
    const mode = paymentsMode(process.env.STRIPE_SECRET_KEY);
    return NextResponse.json({
      paymentsMode: mode,
      report,
      summary: { open, closed, openAmount: openSum._sum.disputeAmount ?? 0 },
      disputes: page.map((o) => presentDispute(o, mode)),
      nextCursor: hasMore ? page[page.length - 1].id : null,
    });
  })
);
