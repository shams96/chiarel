import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextResponse } from "next/server";
import { isEnginePanic, isRetryableDbError } from "@/lib/db-resilience";

const created: { id: number; $disconnect: ReturnType<typeof vi.fn>; marker: string }[] = [];

vi.mock("@prisma/client", () => ({
  PrismaClient: class {
    id = created.length;
    marker = `client-${created.length}`;
    $disconnect = vi.fn().mockResolvedValue(undefined);
    constructor() {
      created.push(this as never);
    }
  },
}));

const panic = () => Object.assign(new Error("engine died"), { name: "PrismaClientRustPanicError" });

describe("isEnginePanic / isRetryableDbError", () => {
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
});

describe("recoverFromEnginePanic", () => {
  beforeEach(() => {
    created.length = 0;
    delete (globalThis as { prisma?: unknown }).prisma;
    delete (globalThis as { prismaGeneration?: unknown }).prismaGeneration;
    vi.resetModules();
    vi.restoreAllMocks();
  });

  it("swaps the client behind db and disconnects the dead one", async () => {
    const { db, dbGeneration, recoverFromEnginePanic } = await import("@/lib/db-client");
    expect((db as unknown as { marker: string }).marker).toBe("client-0");
    vi.spyOn(console, "error").mockImplementation(() => {});

    recoverFromEnginePanic(dbGeneration());

    expect(dbGeneration()).toBe(1);
    expect((db as unknown as { marker: string }).marker).toBe("client-1");
    expect(created[0].$disconnect).toHaveBeenCalled();
  });

  it("replaces only once when several requests fail on the same dead client", async () => {
    const { db, dbGeneration, recoverFromEnginePanic } = await import("@/lib/db-client");
    void (db as unknown as { marker: string }).marker;
    vi.spyOn(console, "error").mockImplementation(() => {});
    const exit = vi.spyOn(process, "exit").mockImplementation((() => undefined) as never);

    const startedOn = dbGeneration();
    recoverFromEnginePanic(startedOn);
    recoverFromEnginePanic(startedOn);

    expect(created).toHaveLength(2);
    expect(exit).not.toHaveBeenCalled();
  });

  it("exits when a fresh client panics again right away, so the host restarts the app", async () => {
    const { db, dbGeneration, recoverFromEnginePanic } = await import("@/lib/db-client");
    void (db as unknown as { marker: string }).marker;
    vi.spyOn(console, "error").mockImplementation(() => {});
    const exit = vi.spyOn(process, "exit").mockImplementation((() => undefined) as never);

    recoverFromEnginePanic(dbGeneration());
    recoverFromEnginePanic(dbGeneration());

    expect(exit).toHaveBeenCalledWith(1);
  });
});

describe("withApiErrorHandling with a panicking engine", () => {
  beforeEach(() => {
    created.length = 0;
    delete (globalThis as { prisma?: unknown }).prisma;
    delete (globalThis as { prismaGeneration?: unknown }).prismaGeneration;
    vi.resetModules();
    vi.restoreAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("replaces the client and retries a read, which then succeeds", async () => {
    const { withApiErrorHandling } = await import("@/lib/api-error");
    const { dbGeneration } = await import("@/lib/db-client");
    const handler = vi
      .fn()
      .mockRejectedValueOnce(panic())
      .mockResolvedValueOnce(NextResponse.json({ ok: true }));

    const res = await withApiErrorHandling(handler)(new Request("http://x/api", { method: "GET" }));

    expect(res.status).toBe(200);
    expect(handler).toHaveBeenCalledTimes(2);
    expect(dbGeneration()).toBe(1);
  });

  it("replaces the client after a failed write but does not repeat the write", async () => {
    const { withApiErrorHandling } = await import("@/lib/api-error");
    const { dbGeneration } = await import("@/lib/db-client");
    const handler = vi.fn().mockRejectedValue(panic());

    const res = await withApiErrorHandling(handler)(new Request("http://x/api", { method: "POST" }));

    expect(res.status).toBe(503);
    expect(handler).toHaveBeenCalledTimes(1);
    expect(dbGeneration()).toBe(1);
  });
});
