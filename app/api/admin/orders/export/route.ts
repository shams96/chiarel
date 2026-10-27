import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withRole } from "@/lib/auth";
import { withApiErrorHandling } from "@/lib/api-error";
import { auditEntry } from "@/lib/audit";
import { isFulfilmentStatus } from "@/lib/order-fulfilment";
import { EXPORT_HEADER, exportRow } from "@/lib/admin-orders";

const MAX_ROWS = 2000;

// Pick-and-pack CSV of paid orders (default: unfulfilled and packed). It holds
// customer names and addresses, so it is Admin and Member only, and the export
// is recorded in the audit log BEFORE the file is returned: no record, no file.
//   ?fulfilment=unfulfilled  (one state)   default: unfulfilled + packed
export const GET = withApiErrorHandling(
  withRole(["ADMIN", "MEMBER"], async (req: NextRequest, user) => {
    const f = req.nextUrl.searchParams.get("fulfilment");
    const states = isFulfilmentStatus(f) ? [f] : ["unfulfilled", "packed"];

    const orders = await db.order.findMany({
      where: { status: "paid", fulfilmentStatus: { in: states } },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
      take: MAX_ROWS,
      include: { items: { include: { product: { select: { name: true } } } } },
    });

    await auditEntry(req, user, {
      action: "orders.export",
      entityType: "Order",
      summary: `Exported ${orders.length} ${states.join(" + ")} order(s) to CSV`,
      after: { count: orders.length, states },
    });

    const csv = [EXPORT_HEADER, ...orders.map(exportRow)].join("\r\n") + "\r\n";
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="orders-${new Date().toISOString().slice(0, 10)}.csv"`,
        "Cache-Control": "no-store",
      },
    });
  })
);
