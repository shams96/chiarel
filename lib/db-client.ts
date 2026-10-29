import { PrismaClient } from "@prisma/client";
import { withConnectionDefaults } from "@/lib/db-resilience";

// The Prisma client behind `db` (lib/db.ts), kept here with the logic that
// replaces it, so code that only needs recovery does not pull in `db` itself.

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

// Callers keep importing `db`. It forwards to whichever client is current, so a
// client whose query engine has crashed can be swapped out without a restart.
export const db: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const c = client();
    const value = Reflect.get(c, prop, c);
    return typeof value === "function" ? value.bind(c) : value;
  },
});

/** Which client a request started on; pass it to recoverFromEnginePanic. */
export function dbGeneration(): number {
  return generation;
}

const REPLACE_WINDOW_MS = 60_000;

/**
 * Prisma's query engine can panic (PrismaClientRustPanicError); after that the
 * client rejects every query until the process restarts, which took the whole
 * shop's database routes down once. Replace the client with a fresh one. If a
 * fresh client panics again within a minute, replacing it will not help, so
 * exit and let the host restart the process.
 *
 * `failedGeneration` is the generation the failing request started on, so
 * several requests failing on the same dead client replace it only once.
 */
export function recoverFromEnginePanic(failedGeneration: number): void {
  if (failedGeneration !== generation) return;
  if (generation > 0 && Date.now() - lastReplacedAt < REPLACE_WINDOW_MS) {
    console.error("[db] a fresh Prisma client panicked again; exiting so the host restarts the app");
    process.exit(1);
  }
  console.error("[db] Prisma engine panic; replacing the client");
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
