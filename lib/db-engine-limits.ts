// Caps the threads Prisma's query engine starts.
//
// The engine is a Rust library whose async runtime starts one worker thread per
// CPU core it can see. The shared Hostinger plan runs many sites under one hard
// process/thread limit (120) on a host with far more cores than that suggests, so
// each Node process paid dozens of extra threads and, when the limit was hit,
// thread creation failed and the engine panicked (PrismaClientRustPanicError).
// Measured on a 12-core machine: 32 threads by default, 22 with the cap, i.e.
// exactly the 10 workers saved; the saving grows with the core count.
//
// Two workers is plenty: the engine mostly waits on the network. An operator-set
// value always wins. Must run before the engine library loads (before the first
// query), so db-client.ts calls it at import time and instrumentation.ts calls it
// at startup.

export const DEFAULT_ENGINE_WORKER_THREADS = "2";

export function capEngineThreads(env: Record<string, string | undefined> = process.env): string {
  if (!env.TOKIO_WORKER_THREADS) env.TOKIO_WORKER_THREADS = DEFAULT_ENGINE_WORKER_THREADS;
  return env.TOKIO_WORKER_THREADS;
}
