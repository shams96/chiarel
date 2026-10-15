import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { clientIp, isRateLimited } from "@/lib/rate-limit";

// Liveness and readiness in one place, so an outage can be told apart quickly:
//   /api/health        answers without touching the database. If this hangs or
//                      fails, the Node process or the host is the problem.
//   /api/health?db=1   also runs `select 1` and reports how long it took. If
//                      the first answers and this one fails or is slow, the
//                      database connection is the problem.
export const dynamic = "force-dynamic";

const startedAt = Date.now();

export async function GET(req: NextRequest) {
  const body: Record<string, unknown> = {
    ok: true,
    uptimeSeconds: Math.round((Date.now() - startedAt) / 1000),
  };
  if (new URL(req.url).searchParams.get("db") === "1") {
    // The database check uses a pooled connection, so it is throttled per IP.
    if (isRateLimited(`health-db:${clientIp(req)}`, 10, 60_000)) {
      return NextResponse.json({ ...body, ok: false, error: "rate limited" }, { status: 429 });
    }
    const t = Date.now();
    try {
      await db.$queryRaw`select 1`;
      body.db = { ok: true, ms: Date.now() - t };
    } catch {
      return NextResponse.json({ ...body, ok: false, db: { ok: false, ms: Date.now() - t } }, { status: 503 });
    }
  }
  return NextResponse.json(body, { headers: { "Cache-Control": "no-store" } });
}
