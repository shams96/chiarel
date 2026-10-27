import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withRole } from "@/lib/auth";
import { withApiErrorHandling } from "@/lib/api-error";

const MAX_TAKE = 100;

// Read-only view of the audit trail (Admin only). There is deliberately no
// write, update or delete route: entries are created only by the routes that
// make the change they describe.
//   ?take=50 (max 100)  ?cursor=<id> (older than this entry)
//   ?action=user.      (prefix match)  ?actor=<email fragment>
export const GET = withApiErrorHandling(
  withRole(["ADMIN"], async (req: NextRequest) => {
    const q = req.nextUrl.searchParams;
    const take = Math.min(MAX_TAKE, Math.max(1, Number(q.get("take")) || 50));
    const cursor = q.get("cursor");
    const action = q.get("action")?.trim();
    const actor = q.get("actor")?.trim();

    const rows = await db.auditLog.findMany({
      where: {
        ...(action ? { action: { startsWith: action } } : {}),
        ...(actor ? { actorEmail: { contains: actor, mode: "insensitive" as const } } : {}),
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: take + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });

    const hasMore = rows.length > take;
    const entries = hasMore ? rows.slice(0, take) : rows;
    return NextResponse.json({
      entries,
      nextCursor: hasMore ? entries[entries.length - 1].id : null,
    });
  })
);
