import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextResponse } from "next/server";
import { isConnectivityError, isEnginePanic, isRetryableDbError } from "@/lib/db-resilience";

const created: { $disconnect: ReturnType<typeof vi.fn>; marker: string }[] = [];
const behaviour: { error: unknown } = { error: null };
let queries = 0;

vi.mock("@prisma/client", () => ({
  PrismaClient: class {
    marker = `client-${created.length}`;
    $disconnect = vi.fn().mockResolvedValue(undefined);
    user = {
      findFirst: async () => {
        queries += 1;
        if (behaviour.error) throw behaviour.error;
        return { id: 1 };
      },
    };
    constructor() {
      created.push(this as never);
    }
  },
}));

const panic = () => Object.assign(new Error("engine died"), { name: "PrismaClientRustPanicError" });
const unreachable = () => Object.assign(new Error("can't reach"), { code: "P1001" });
const unique = () => Object.assign(new Error("unique"), { code: "P2002" });

function reset() {
  created.length = 0;
  queries = 0;
  behaviour.error = null;
  delete (globalThis as { prisma?: unknown }).prisma;
  delete (globalThis as { prismaGeneration?: unknown }).prismaGeneration;
  vi.resetModules();
  vi.restoreAllMocks();
  vi.spyOn(console, "error").mockImplementation(() => {});
}

describe("error classification", () => {
  it("recognises the engine panic by name or code", () => {
    expect(isEnginePanic(panic())).toBe(true);
    expect(isEnginePanic({ code: "PrismaClientRustPanicError" })).toBe(true);
    expect(isEnginePanic(new Error("nope"))).toBe(false);
    expect(isEnginePanic(null)).toBe(false);
  });

  it("retries a panic for reads only, since it can strike mid-statement", () => {
    expect(isRetryableDbError(panic(), true)).toBe(true);
    expect(isRetryableDbError(panic(), false)).toBe(false);
  });

  it("treats unreachable, pool, initialization, timeout and panic as connectivity, not query errors", () => {
    expect(isConnectivityError(unreachable())).toBe(true);
    expect(isConnectivityError({ code: "P2024" })).toBe(true);
    expect(isConnectivityError({ code: "TIMEOUT" })).toBe(true);
    expect(isConnectivityError({ name: "PrismaClientInitializationError" })).toBe(true);
    expect(isConnectivityError(panic())).toBe(true);
    expect(isConnectivityError(unique())).toBe(false);
    expect(isConnectivityError(new Error("plain"))).toBe(false);
  });
});

describe("replaceDbClient", () => {
  beforeEach(reset);

  it("swaps the client behind db and disconnects the dead one", async () => {
    const { db, dbGeneration, replaceDbClient } = await import("@/lib/db-client");
    expect((db as unknown as { marker: string }).marker).toBe("client-0");

    replaceDbClient(dbGeneration());

    expect(dbGeneration()).toBe(1);
    expect((db as unknown as { marker: string }).marker).toBe("client-1");
    expect(created[0].$disconnect).toHaveBeenCalled();
  });

  it("replaces only once when several requests fail on the same dead client", async () => {
    const { db, dbGeneration, replaceDbClient } = await import("@/lib/db-client");
    void (db as unknown as { marker: string }).marker;
    const startedOn = dbGeneration();
    replaceDbClient(startedOn);
    replaceDbClient(startedOn);
    expect(created).toHaveLength(2);
  });

  it("never exits the process, and rate-limits replacement instead", async () => {
    const { db, dbGeneration, replaceDbClient } = await import("@/lib/db-client");
    void (db as unknown as { marker: string }).marker;
    const exit = vi.spyOn(process, "exit").mockImplementation((() => undefined) as never);

    replaceDbClient(dbGeneration());
    replaceDbClient(dbGeneration()); // the fresh client failed straight away

    expect(exit).not.toHaveBeenCalled();
    expect(created).toHaveLength(2); // second replacement refused inside the interval
  });

  it("caps the engine's worker threads before any client exists", async () => {
    delete process.env.TOKIO_WORKER_THREADS;
    await import("@/lib/db-client");
    expect(process.env.TOKIO_WORKER_THREADS).toBe("2");
  });
});

describe("withApiErrorHandling and the circuit breaker", () => {
  beforeEach(() => {
    reset();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-29T12:00:00Z"));
  });
  afterEach(() => vi.useRealTimers());

  async function setup() {
    const { withApiErrorHandling } = await import("@/lib/api-error");
    const { db, dbBreaker } = await import("@/lib/db-client");
    const usesDb = withApiErrorHandling(async (_req: Request) => {
      await db.user.findFirst();
      return NextResponse.json({ ok: true });
    });
    const noDb = withApiErrorHandling(async (_req: Request) => NextResponse.json({ ok: true }));
    const post = () => new Request("http://x/api", { method: "POST" });
    return { usesDb, noDb, post, dbBreaker };
  }

  it("replaces the client and retries a read, which then succeeds", async () => {
    const { withApiErrorHandling } = await import("@/lib/api-error");
    const { dbGeneration } = await import("@/lib/db-client");
    const handler = vi
      .fn()
      .mockRejectedValueOnce(panic())
      .mockResolvedValueOnce(NextResponse.json({ ok: true }));
    vi.useRealTimers();

    const res = await withApiErrorHandling(handler)(new Request("http://x/api", { method: "GET" }));

    expect(res.status).toBe(200);
    expect(handler).toHaveBeenCalledTimes(2);
    expect(dbGeneration()).toBe(1);
  });

  it("does not repeat a write after a panic", async () => {
    const { withApiErrorHandling } = await import("@/lib/api-error");
    const handler = vi.fn().mockRejectedValue(panic());
    const res = await withApiErrorHandling(handler)(new Request("http://x/api", { method: "POST" }));
    expect(res.status).toBe(503);
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("opens after repeated connectivity failures, then refuses at once without touching the database", async () => {
    const { usesDb, post, dbBreaker } = await setup();
    behaviour.error = unreachable();
    for (let i = 0; i < 3; i++) expect((await usesDb(post())).status).toBe(503);
    expect(dbBreaker.state()).toBe("open");
    const before = queries;

    const res = await usesDb(post());

    expect(res.status).toBe(503);
    expect(queries).toBe(before);
    expect(Number(res.headers.get("Retry-After"))).toBeGreaterThan(0);
    expect((await res.json()).code).toBe("temporarily_unavailable");
  });

  it("does not block a request that never uses the database while the breaker is open", async () => {
    const { usesDb, noDb, post, dbBreaker } = await setup();
    behaviour.error = unreachable();
    for (let i = 0; i < 3; i++) await usesDb(post());
    expect(dbBreaker.state()).toBe("open");

    expect((await noDb(post())).status).toBe(200);
    expect(dbBreaker.state()).toBe("open"); // and it did not close the breaker by succeeding
  });

  it("probes after the cooldown and closes when the database is back", async () => {
    const { usesDb, post, dbBreaker } = await setup();
    behaviour.error = unreachable();
    for (let i = 0; i < 3; i++) await usesDb(post());
    vi.advanceTimersByTime(16_000);
    behaviour.error = null;

    expect((await usesDb(post())).status).toBe(200);
    expect(dbBreaker.state()).toBe("closed");
    expect((await usesDb(post())).status).toBe(200);
  });

  it("re-opens for a full cooldown when the probe fails", async () => {
    const { usesDb, post, dbBreaker } = await setup();
    behaviour.error = unreachable();
    for (let i = 0; i < 3; i++) await usesDb(post());
    vi.advanceTimersByTime(16_000);
    const before = queries;

    expect((await usesDb(post())).status).toBe(503);
    expect(queries).toBe(before + 1); // the probe did reach the database
    expect(dbBreaker.state()).toBe("open");
    expect((await usesDb(post())).status).toBe(503);
    expect(queries).toBe(before + 1); // and the next request was refused again
  });

  it("does not count a query error (the database answered) against the breaker", async () => {
    const { usesDb, post, dbBreaker } = await setup();
    behaviour.error = unique();
    for (let i = 0; i < 6; i++) await usesDb(post());
    expect(dbBreaker.state()).toBe("closed");
  });
});

describe("error code on admin 503s", () => {
  beforeEach(reset);

  it("labels the failure on /api/admin routes with a safe code, never the message", async () => {
    const { withApiErrorHandling } = await import("@/lib/api-error");
    const secret = withApiErrorHandling(async (_req: Request) => {
      throw new Error("ADMIN_SESSION_SECRET is not set");
    });
    const prisma = withApiErrorHandling(async (_req: Request) => {
      throw Object.assign(new Error("Unique constraint failed on host db.secret-host.example"), { code: "P2002" });
    });
    const admin = (path: string) => new Request(`http://x${path}`, { method: "POST" });

    const a = await (await secret(admin("/api/admin/auth/login"))).json();
    expect(a.code).toBe("config_missing_admin_session_secret");
    const b = await prisma(admin("/api/admin/auth/login"));
    expect(b.status).toBe(503);
    const body = await b.json();
    expect(body.code).toBe("P2002");
    expect(JSON.stringify(body)).not.toContain("secret-host");
  });

  it("returns no code on public routes", async () => {
    const { withApiErrorHandling } = await import("@/lib/api-error");
    const failing = withApiErrorHandling(async (_req: Request) => {
      throw Object.assign(new Error("boom"), { code: "P2002" });
    });
    const body = await (await failing(new Request("http://x/api/cart", { method: "POST" }))).json();
    expect(body).toEqual({ error: "Something went wrong on our end. Please try again in a moment." });
  });
});
