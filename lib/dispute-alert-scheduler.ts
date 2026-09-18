import { computeDisputeRateReport } from "@/lib/dispute-monitoring";
import { sendMail } from "@/lib/mail";
import { ORDERS_EMAIL } from "@/lib/seo";

const CHECK_INTERVAL_MS = 24 * 60 * 60 * 1000; // once daily — matches the monitor's own monthly-window granularity, no need for finer polling

const globalForScheduler = globalThis as unknown as { chiarelDisputeSchedulerStarted?: boolean };

function formatAlert(report: Awaited<ReturnType<typeof computeDisputeRateReport>>): string {
  const pct = (n: number) => `${(n * 100).toFixed(2)}%`;
  return [
    `Chiarel dispute-rate warning: ${report.overallTier.toUpperCase()}`,
    "",
    `Visa ratio: ${pct(report.visaRatio)} (non-compliant at 0.5%, excessive at 1.5%)`,
    `Mastercard ratio: ${pct(report.mastercardRatio)} (ECM at 1.5%, HECM at 3%)`,
    `Disputes this month: ${report.disputesThisMonth}`,
    `Payments last month: ${report.paymentsLastMonth}`,
    "",
    "This is Chiarel's own continuous estimate — see claudedocs/specs/dispute-risk-mitigation/ — " +
      "not a notice from Stripe or a card network, which only notify after a monitoring program " +
      "has already been triggered.",
  ].join("\n");
}

async function runCheck(): Promise<void> {
  try {
    const report = await computeDisputeRateReport();
    if (report.overallTier === "ok") return;

    await sendMail({
      to: process.env.DISPUTE_ALERT_EMAIL || ORDERS_EMAIL,
      subject: `[Chiarel] Dispute rate ${report.overallTier} — action review recommended`,
      text: formatAlert(report),
    });
  } catch (err) {
    // A failed check/alert must never crash the process — this is a background
    // monitor, not a request path. Logged for visibility only.
    console.error("[dispute-monitor] check failed:", err);
  }
}

// Started from instrumentation.ts, once, after the server process is up — never
// awaited before app.listen() (per this project's own deploy-readiness-checklist
// lesson: startup work must never block the port bind). Guarded against
// double-registration across Next.js's dev-mode hot reloads, the same pattern
// already used for the Prisma client singleton in lib/db.ts.
export function startDisputeMonitorSchedule(): void {
  if (globalForScheduler.chiarelDisputeSchedulerStarted) return;
  globalForScheduler.chiarelDisputeSchedulerStarted = true;

  console.log("[dispute-monitor] scheduler started");
  runCheck();
  setInterval(runCheck, CHECK_INTERVAL_MS);
}
