import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { withRole } from "@/lib/auth";
import { withApiErrorHandling } from "@/lib/api-error";
import { presentSubscriber } from "@/lib/admin-subscribers";

const MAX_TAKE = 100;

// Subscriber list for the console. All roles may read it; a Viewer gets masked
// emails and cannot search, so the search box cannot be used to probe whether a
// given address is on the list.
//   ?status=active|unsubscribed  ?source=<source>  ?q=<email fragment>
//   ?take=50 (max 100)  ?cursor=<id>
export const GET = withApiErrorHandling(
  withRole(["ADMIN", "MEMBER", "VIEWER"], async (req: NextRequest, user) => {
    const q = req.nextUrl.searchParams;
    const take = Math.min(MAX_TAKE, Math.max(1, Number(q.get("take")) || 50));
    const cursor = q.get("cursor");
    const status = q.get("status");
    const source = q.get("source")?.trim();
    const search = q.get("q")?.trim().toLowerCase();
    const viewer = user.role === "VIEWER";

    const where: Prisma.EmailSubscriberWhereInput = {
      ...(status === "active" ? { unsubscribedAt: null } : {}),
      ...(status === "unsubscribed" ? { unsubscribedAt: { not: null } } : {}),
      ...(source ? { source } : {}),
      ...(search && !viewer ? { email: { contains: search } } : {}),
    };

    const [rows, total, active, bySource] = await Promise.all([
      db.emailSubscriber.findMany({
        where,
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        take: take + 1,
        ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      }),
      db.emailSubscriber.count(),
      db.emailSubscriber.count({ where: { unsubscribedAt: null } }),
      db.emailSubscriber.groupBy({ by: ["source"], _count: { _all: true } }),
    ]);

    const hasMore = rows.length > take;
    const page = hasMore ? rows.slice(0, take) : rows;
    return NextResponse.json({
      subscribers: page.map((s) => presentSubscriber(s, user.role)),
      nextCursor: hasMore ? page[page.length - 1].id : null,
      counts: {
        total,
        active,
        unsubscribed: total - active,
        bySource: bySource.map((b) => ({ source: b.source, count: b._count._all })),
      },
    });
  })
);
