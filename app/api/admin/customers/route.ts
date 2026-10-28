import { NextRequest, NextResponse } from "next/server";
import { withRole } from "@/lib/auth";
import { withApiErrorHandling } from "@/lib/api-error";
import { MAX_OFFSET, MAX_TAKE, clampInt, parseSort, presentCustomer, queryCustomers } from "@/lib/admin-customers";

// Customer list, derived from paid orders. All roles may read it; a Viewer gets
// masked emails and cannot search (a search box on masked data would let them
// probe which emails exist).
//   ?q=<email or surname> (Admin/Member)  ?sort=last|ltv  ?take=50  ?offset=0
export const GET = withApiErrorHandling(
  withRole(["ADMIN", "MEMBER", "VIEWER"], async (req: NextRequest, user) => {
    const q = req.nextUrl.searchParams;
    const viewer = user.role === "VIEWER";
    const take = clampInt(q.get("take"), 50, 1, MAX_TAKE);
    const offset = clampInt(q.get("offset"), 0, 0, MAX_OFFSET);

    const rows = await queryCustomers({
      search: viewer ? undefined : q.get("q") ?? undefined,
      sort: parseSort(q.get("sort")),
      offset,
      take: take + 1,
    });
    const hasMore = rows.length > take;
    const customers = (hasMore ? rows.slice(0, take) : rows).map((c) => presentCustomer(c, user.role));
    return NextResponse.json({ customers, nextOffset: hasMore ? offset + take : null });
  })
);
