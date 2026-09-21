import { db } from "@/lib/db";

// Computes Chiarel's own dispute-rate estimate against the Visa/Mastercard
// monitoring-program thresholds, continuously — rather than waiting for Stripe's
// after-the-fact notification once a network has already placed the account into
// a program. Both networks calculate monthly, from the *prior* month's payment
// volume — see claudedocs/specs/dispute-risk-mitigation/SPEC.md for the cited
// Stripe documentation this is grounded in.
//
// Thresholds (Stripe docs, docs.stripe.com/disputes/monitoring-programs):
//   Visa VAMP:        non-compliant at 0.5% ratio, excessive at 1.5% (US/EU/etc.)
//   Mastercard ECM:    non-compliant at 1.5% rate, excessive (HECM) at 3%
const VISA_NON_COMPLIANT = 0.005;
const VISA_EXCESSIVE = 0.015;
const MASTERCARD_ECM = 0.015;
const MASTERCARD_HECM = 0.03;

// Fraction of the *non-compliant* threshold at which to warn early — catching
// the trend before the monthly cutoff is the entire point of this module, not
// just replicating the network's own after-the-fact math once the month closes.
const EARLY_WARNING_FRACTION = 0.7;

export type WarningTier = "ok" | "approaching" | "over-threshold";

export type DisputeRateReport = {
  paymentsLastMonth: number;
  disputesThisMonth: number;
  visaRatio: number;
  mastercardRatio: number;
  visaTier: WarningTier;
  mastercardTier: WarningTier;
  overallTier: WarningTier;
};

function startOfMonth(offsetMonths: number, from = new Date()): Date {
  return new Date(from.getFullYear(), from.getMonth() + offsetMonths, 1);
}

function tierFor(ratio: number, nonCompliant: number, excessive: number): WarningTier {
  if (ratio >= nonCompliant) return "over-threshold";
  if (ratio >= nonCompliant * EARLY_WARNING_FRACTION) return "approaching";
  return "ok";
}

function worseOf(a: WarningTier, b: WarningTier): WarningTier {
  const rank: Record<WarningTier, number> = { ok: 0, approaching: 1, "over-threshold": 2 };
  return rank[a] >= rank[b] ? a : b;
}

export async function computeDisputeRateReport(now = new Date()): Promise<DisputeRateReport> {
  const thisMonthStart = startOfMonth(0, now);
  const lastMonthStart = startOfMonth(-1, now);

  // "Payments last month" — captured orders, i.e. paid, in the previous
  // calendar month. Matches Visa/Mastercard's own definition of the
  // denominator (docs.stripe.com/disputes/monitoring-programs).
  const paymentsLastMonth = await db.order.count({
    where: {
      status: "paid",
      createdAt: { gte: lastMonthStart, lt: thisMonthStart },
    },
  });

  // "Disputes this month" — opened in the current calendar month, regardless
  // of when the original payment was captured (matches both networks' own
  // month-assignment rule: a dispute belongs to the month it was raised).
  const disputesThisMonth = await db.order.count({
    where: { disputeOpenedAt: { gte: thisMonthStart } },
  });

  // With zero payments last month there's no meaningful rate — report 0 rather
  // than dividing by zero (which would otherwise read as Infinity/NaN and false-
  // trigger the over-threshold tier on a brand-new or dormant account).
  const visaRatio = paymentsLastMonth > 0 ? disputesThisMonth / paymentsLastMonth : 0;
  const mastercardRatio = paymentsLastMonth > 0 ? disputesThisMonth / paymentsLastMonth : 0;

  const visaTier = tierFor(visaRatio, VISA_NON_COMPLIANT, VISA_EXCESSIVE);
  const mastercardTier = tierFor(mastercardRatio, MASTERCARD_ECM, MASTERCARD_HECM);

  return {
    paymentsLastMonth,
    disputesThisMonth,
    visaRatio,
    mastercardRatio,
    visaTier,
    mastercardTier,
    overallTier: worseOf(visaTier, mastercardTier),
  };
}
