"use client";

// Disputes: current dispute rate against the card-network thresholds, and each
// dispute with an evidence checklist. Read-only; the API restricts it to Admin
// and Member.
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Alert,
  Badge,
  Button,
  Card,
  EmptyState,
  Field,
  Loading,
  PageHeader,
  PageShell,
  Stat,
  StatGrid,
  Table,
  inputClass,
  statusTone,
  tdClass,
} from "@/components/admin/ui";

type Evidence = { key: string; label: string; present: boolean; detail: string | null };
type Dispute = {
  orderId: string;
  disputeId: string | null;
  status: string | null;
  reason: string | null;
  amount: number | null;
  openedAt: string | null;
  closedAt: string | null;
  open: boolean;
  orderTotal: number;
  customer: string;
  email: string;
  country: string;
  evidence: Evidence[];
  missing: string[];
  evidenceComplete: boolean;
  stripeUrl: string | null;
};
type Report = {
  paymentsLastMonth: number;
  disputesThisMonth: number;
  visaRatio: number;
  mastercardRatio: number;
  visaTier: string;
  mastercardTier: string;
  overallTier: string;
};
type Payload = {
  report: Report;
  summary: { open: number; closed: number; openAmount: number };
  disputes: Dispute[];
  nextCursor: string | null;
};

const words = (v: string) => v.replace(/_/g, " ");
const pct = (r: number) => `${(r * 100).toFixed(2)}%`;
const TIER: Record<string, string> = { ok: "OK", approaching: "Approaching the limit", "over-threshold": "Over the limit" };

function EvidenceDetails({ d }: { d: Dispute }) {
  return (
    <details>
      <summary className={`cursor-pointer ${d.evidenceComplete ? "text-garden" : "font-medium text-redochre"}`}>
        {d.evidenceComplete ? "Complete" : `${d.missing.length} missing`}
      </summary>
      <ul className="mt-2 grid gap-1 pl-4">
        {d.evidence.map((e) => (
          <li key={e.key} className={e.present ? "list-disc text-garden" : "list-disc font-medium text-redochre"}>
            {e.present ? "Have" : "Missing"}: {e.label}
            {e.detail ? ` (${e.detail})` : ""}
          </li>
        ))}
      </ul>
      {d.stripeUrl && (
        <p className="mt-3">
          <a href={d.stripeUrl} target="_blank" rel="noopener noreferrer" className="text-garden underline underline-offset-4">
            Open in Stripe
          </a>
        </p>
      )}
    </details>
  );
}

export default function AdminDisputesPage() {
  const [data, setData] = useState<Payload | null>(null);
  const [rows, setRows] = useState<Dispute[]>([]);
  const [status, setStatus] = useState("all");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(
    async (cursor: string | null) => {
      setLoading(true);
      setError(null);
      const p = new URLSearchParams({ take: "50", status });
      if (cursor) p.set("cursor", cursor);
      const res = await fetch(`/api/admin/disputes?${p}`);
      setLoading(false);
      if (res.status === 403) return setError("Your account does not have access to disputes.");
      if (!res.ok) return setError("Failed to load disputes.");
      const json: Payload = await res.json();
      setData(json);
      setRows((prev) => (cursor ? [...prev, ...json.disputes] : json.disputes));
    },
    [status]
  );

  useEffect(() => {
    load(null);
  }, [load]);

  const r = data?.report;
  const rateText = r && (
    <>
      <strong>Dispute rate: {TIER[r.overallTier] ?? r.overallTier}.</strong> {r.disputesThisMonth} dispute(s) opened this month against{" "}
      {r.paymentsLastMonth} payment(s) last month. Visa {pct(r.visaRatio)} (limit 0.50%), Mastercard {pct(r.mastercardRatio)} (limit 1.50%).
    </>
  );

  return (
    <PageShell>
      <PageHeader
        eyebrow="Payments"
        title="Disputes"
        subtitle="Chargebacks and how ready we are to answer them. Respond to a dispute in Stripe; this page shows what evidence we hold."
      />

      {error && <Alert kind="error">{error}</Alert>}

      {data && r && (
        <div className="mb-8">
          {r.overallTier === "ok" ? (
            <Alert kind="success">{rateText}</Alert>
          ) : r.overallTier === "approaching" ? (
            <Card tone="champagne" className="mb-5 border-l-8 border-garden">
              <p className="mb-1 text-[12px] uppercase tracking-[0.28em]">Watch closely</p>
              <p className="text-[15px] leading-relaxed">{rateText}</p>
            </Card>
          ) : (
            <Card tone="redochre" className="mb-5">
              <p className="mb-1 text-[12px] uppercase tracking-[0.28em]">Action needed</p>
              <p className="text-[15px] leading-relaxed">{rateText}</p>
            </Card>
          )}
          <StatGrid>
            <Stat label="Open" value={data.summary.open} tone={data.summary.open > 0 ? "redochre" : "white"} />
            <Stat label="At stake" value={`$${data.summary.openAmount}`} tone="peach" />
            <Stat label="Closed" value={data.summary.closed} />
          </StatGrid>
        </div>
      )}

      <div className="mb-6 max-w-[12rem]">
        <Field label="Show">
          <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputClass}>
            <option value="all">All</option>
            <option value="open">Open</option>
            <option value="closed">Closed</option>
          </select>
        </Field>
      </div>

      {rows.length > 0 ? (
        <>
          <ul className="grid gap-3 md:hidden">
            {rows.map((d) => (
              <li key={d.orderId} className="border border-champagne bg-white p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Link href={`/admin/orders/${d.orderId}`} className="text-redochre underline underline-offset-4">
                    {d.orderId.slice(-8)}
                  </Link>
                  <span className="font-serif text-lg">{d.amount != null ? `$${d.amount}` : ""}</span>
                </div>
                <p className="mt-1 [overflow-wrap:anywhere] text-[13px] text-ink/75">
                  {d.customer} {d.email}
                  {d.openedAt ? ` · opened ${new Date(d.openedAt).toLocaleDateString()}` : ""}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Badge tone={statusTone(d.status ?? "")}>{words(d.status ?? "unknown")}</Badge>
                  <Badge tone={d.open ? "danger" : "muted"}>{d.open ? "open" : "closed"}</Badge>
                  {d.reason ? <span className="text-[13px] text-ink/70">{words(d.reason)}</span> : null}
                </div>
                <div className="mt-3">
                  <EvidenceDetails d={d} />
                </div>
              </li>
            ))}
          </ul>
          <div className="hidden md:block">
            <Table head={["Order", "Opened", "Customer", "Amount", "Status", "Evidence"]}>
              {rows.map((d) => (
                <tr key={d.orderId}>
                  <td className={tdClass}>
                    <Link href={`/admin/orders/${d.orderId}`} className="text-redochre underline underline-offset-4">
                      {d.orderId.slice(-8)}
                    </Link>
                  </td>
                  <td className={`${tdClass} whitespace-nowrap`}>{d.openedAt ? new Date(d.openedAt).toLocaleDateString() : ""}</td>
                  <td className={tdClass}>
                    {d.customer} <span className="text-ink/70">{d.email}</span>
                  </td>
                  <td className={tdClass}>{d.amount != null ? `$${d.amount}` : ""}</td>
                  <td className={tdClass}>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone={statusTone(d.status ?? "")}>{words(d.status ?? "unknown")}</Badge>
                      <Badge tone={d.open ? "danger" : "muted"}>{d.open ? "open" : "closed"}</Badge>
                    </div>
                    {d.reason ? <div className="mt-1 text-ink/70">{words(d.reason)}</div> : null}
                  </td>
                  <td className={`${tdClass} min-w-[14rem]`}>
                    <EvidenceDetails d={d} />
                  </td>
                </tr>
              ))}
            </Table>
          </div>
        </>
      ) : loading ? (
        <Loading />
      ) : (
        !error && <EmptyState title="No disputes." text="Good news: no one has disputed a payment. If that changes, the order appears here with a checklist of the evidence we hold." />
      )}

      {data?.nextCursor && (
        <div className="mt-6">
          <Button variant="secondary" onClick={() => load(data.nextCursor)} disabled={loading}>
            {loading ? "Loading…" : "Load more"}
          </Button>
        </div>
      )}
    </PageShell>
  );
}
