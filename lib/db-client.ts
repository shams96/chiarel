import { AsyncLocalStorage } from "node:async_hooks";
import { PrismaClient } from "@prisma/client";
import { createBreaker } from "@/lib/db-breaker";
import { capEngineThreads } from "@/lib/db-engine-limits";
import { DbUnavailableError, isConnectivityError, isEnginePanic, withConnectionDefaults } from "@/lib/db-resilience";

// The Prisma client behind `db` (lib/db.ts), kept here with the logic that
// replaces it and the breaker that guards it, so code that only needs recovery
// does not pull in `db` itself.

// Before any client exists, so the query engine starts few threads (see the file).
capEngineThreads();

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient; prismaGeneration?: number };

function createClient() {
  return new PrismaClient({
    datasourceUrl: withConnectionDefaults(process.env.DATABASE_URL),
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

let current: PrismaClient | undefined = globalForPrisma.prisma;
let generation = globalForPrisma.prismaGeneration ?? 0;
let lastReplacedAt = 0;

function client(): PrismaClient {
  if (!current) {
    current = createClient();
    if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = current;
  }
  return current;
}

/** Shared by every database route; the health probe reports its state. */
export const dbBreaker = createBreaker();

// One context per guarded request (withDbBreaker). The first use of `db` inside
// it asks the breaker for permission once; a request that never touches the
// database (an empty cart, say) neither needs permission nor counts for or
// against the breaker. Code outside a guarded request (schedulers, scripts)
// is not gated.
type RequestContext = { acquired: boolean; generation: number };
const requestContext = new AsyncLocalStorage<RequestContext>();

// Callers keep importing `db`. It forwards to whichever client is current, so a
// client whose query engine has crashed can be swapped out without a restart.
export const db: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const ctx = typeof prop === "string" && prop !== "then" ? requestContext.getStore() : undefined;
    if (ctx && !ctx.acquired) {
      if (!dbBreaker.tryAcquire()) throw new DbUnavailableError(dbBreaker.retryAfterSeconds());
      ctx.acquired = true;
      ctx.generation = generation;
    }
    const c = client();
    const value = Reflect.get(c, prop, c);
    return typeof value === "function" ? value.bind(c) : value;
  },
});

/**
 * Runs a request under the breaker: refuses database use at once while it is
 * open, and records the outcome (and replaces the client) when the database was
 * used. An error that is not about connectivity means the database did answer.
 */
export async function withDbBreaker<T>(fn: () => Promise<T>): Promise<T> {
  const ctx: RequestContext = { acquired: false, generation };
  try {
    const value = await requestContext.run(ctx, fn);
    if (ctx.acquired) dbBreaker.success();
    return value;
  } catch (err) {
    if (ctx.acquired && !(err instanceof DbUnavailableError)) {
      if (isConnectivityError(err)) {
        dbBreaker.failure();
        replaceDbClient(ctx.generation);
      } else {
        dbBreaker.success();
      }
    }
    throw err;
  }
}

/** Which client a request started on; pass it to replaceDbClient. */
export function dbGeneration(): number {
  return generation;
}

const MIN_REPLACE_INTERVAL_MS = 10_000;

/**
 * Replaces the Prisma client with a fresh one (new engine, new pool). Used after
 * an engine panic, and after any connectivity failure, because a client that has
 * lost its connections or its engine does not always recover on its own.
 *
 * Never exits the process: the host does not reliably restart the app, and a dead
 * process would take the static pages down with it. Replacement is rate-limited
 * instead, and the breaker keeps requests off the database in between.
 *
 * `failedGeneration` is the generation the failing request started on, so
 * several requests failing on the same dead client replace it only once.
 */
export function replaceDbClient(failedGeneration: number): void {
  if (failedGeneration !== generation) return;
  if (Date.now() - lastReplacedAt < MIN_REPLACE_INTERVAL_MS) return;
  console.error("[db] replacing the Prisma client after a connectivity failure");
  const old = current;
  current = createClient();
  generation += 1;
  lastReplacedAt = Date.now();
  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = current;
    globalForPrisma.prismaGeneration = generation;
  }
  void old?.$disconnect().catch(() => {});
}

/** Replaces the client only if `err` is an engine panic; kept for call sites that care. */
export function replaceDbClientOnPanic(err: unknown, failedGeneration: number): void {
  if (isEnginePanic(err)) replaceDbClient(failedGeneration);
}
