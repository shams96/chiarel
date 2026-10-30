// Next.js's standard startup hook (stable since Next 14, no experimental flag
// needed) — register() runs once when a server instance starts. Used here only
// to start the dispute-rate monitor's daily background check; see
// claudedocs/specs/dispute-risk-mitigation/PLAN.md item 4.
//
// Guarded to the Node.js runtime only — this also runs under the Edge runtime
// in a middleware context, where setInterval/Prisma access isn't meaningful.
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // Before anything loads the Prisma engine: cap its worker threads (the host
    // has a hard process/thread limit shared by every site on the plan).
    const { capEngineThreads } = await import("@/lib/db-engine-limits");
    capEngineThreads();
    // A fire-and-forget promise that rejects would otherwise terminate the Node
    // process (Node 15+), and the host does not necessarily restart it. Log and
    // keep serving.
    process.on("unhandledRejection", (reason) => {
      console.error("[unhandledRejection]", reason);
    });
    const { startDisputeMonitorSchedule } = await import("@/lib/dispute-alert-scheduler");
    startDisputeMonitorSchedule();
    const { startCartPruneSchedule } = await import("@/lib/cart-prune");
    startCartPruneSchedule();
  }
}
