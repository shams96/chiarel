import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { dbBreaker, dbGeneration, replaceDbClient } from "@/lib/db-client";
import { isConnectivityError } from "@/lib/db-resilience";
import { clientIp, isRateLimited } from "@/lib/rate-limit";

// Liveness and readiness in one place, so an outage can be told apart quickly:
//   /api/health        answers without touching the database. If this hangs or
//                      fails, the Node process or the host is the problem.
//   /api/health?db=1   also runs `select 1` and reports how long it took. If
//                      the first answers and this one fails or is slow, the
//                      database connection is the problem.
// The db probe is also the repair path: it bypasses the breaker (it must test
// the real connection), a failure replaces the Prisma client, and a success
// closes the breaker. An external uptime monitor that polls ?db=1 therefore
// both reports an outage and starts the recovery.
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
    const generation = dbGeneration();
    try {
      // Time-boxed: a stalled connection must answer "TIMEOUT", not hang the probe.
      await Promise.race([
        db.$queryRaw`select 1`,
        new Promise((_, reject) =>
          setTimeout(() => reject(Object.assign(new Error("db check timed out"), { code: "TIMEOUT" })), 8000)
        ),
      ]);
      dbBreaker.success();
      body.db = { ok: true, ms: Date.now() - t };
      body.breaker = dbBreaker.state();
    } catch (err) {
      // Hostinger exposes no runtime log for this app, so a failure reports what
      // it can safely: the Prisma/Node error code or class name (never the
      // message, which can contain connection details) and whether the database
      // settings are present at all.
      if (isConnectivityError(err)) {
        dbBreaker.failure();
        replaceDbClient(generation);
      }
      const e = err as { code?: unknown; name?: unknown };
      const code = typeof e?.code === "string" ? e.code : typeof e?.name === "string" ? e.name : "unknown";
      return NextResponse.json(
        {
          ...body,
          ok: false,
          db: { ok: false, ms: Date.now() - t, code },
          breaker: dbBreaker.state(),
          engineThreads: process.env.TOKIO_WORKER_THREADS ?? null,
          env: { DATABASE_URL: Boolean(process.env.DATABASE_URL), DIRECT_URL: Boolean(process.env.DIRECT_URL) },
        },
        { status: 503 }
      );
    }
  }
  return NextResponse.json(body, { headers: { "Cache-Control": "no-store" } });
}
