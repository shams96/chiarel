// Next.js's standard startup hook (stable since Next 14, no experimental flag
// needed) — register() runs once when a server instance starts. Used here only
// to start the dispute-rate monitor's daily background check; see
// claudedocs/specs/dispute-risk-mitigation/PLAN.md item 4.
//
// Guarded to the Node.js runtime only — this also runs under the Edge runtime
// in a middleware context, where setInterval/Prisma access isn't meaningful.
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { startDisputeMonitorSchedule } = await import("@/lib/dispute-alert-scheduler");
    startDisputeMonitorSchedule();
  }
}
