"use client";

// Disputes: current dispute rate against the card-network thresholds, and each
// dispute with an evidence checklist. Read-only; the API restricts it to Admin
// and Member.
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

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

const pct = (r: number) => `${(r * 100).toFixed(2)}%`;
const TIER: Record<string, string> = { ok: "OK", approaching: "Approaching the limit", "over-threshold": "Over the limit" };
const cell = { padding: 8 } as const;

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
  return (
    <div style={{ maxWidth: 960, margin: "40px auto", padding: "0 16px", fontFamily: "system-ui, sans-serif", fontSize: 13 }}>
      <h1 style={{ fontSize: 20, marginBottom: 16 }}>Disputes</h1>
      {error && (
        <p style={{ color: "#b00020" }} role="alert">
          {error}
        </p>
      )}

      {data && r && (
        <>
          <p style={r.overallTier === "ok" ? undefined : { background: "#fff4d6", padding: 8 }}>
            <strong>Dispute rate: {TIER[r.overallTier] ?? r.overallTier}.</strong> {r.disputesThisMonth} dispute(s) opened this month against{" "}
            {r.paymentsLastMonth} payment(s) last month. Visa {pct(r.visaRatio)} (limit 0.50%), Mastercard {pct(r.mastercardRatio)} (limit 1.50%).
          </p>
          <p>
            Open: <strong>{data.summary.open}</strong> (${data.summary.openAmount} at stake) · Closed: <strong>{data.summary.closed}</strong>
          </p>
        </>
      )}

      <label style={{ display: "inline-block", margin: "8px 0 16px" }}>
        Show{" "}
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="all">All</option>
          <option value="open">Open</option>
          <option value="closed">Closed</option>
        </select>
      </label>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ textAlign: "left", borderBottom: "1px solid #ccc" }}>
            <th style={cell}>Order</th>
            <th style={cell}>Opened</th>
            <th style={cell}>Customer</th>
            <th style={cell}>Amount</th>
            <th style={cell}>Status</th>
            <th style={cell}>Evidence</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((d) => (
            <tr key={d.orderId} style={{ borderBottom: "1px solid #eee", verticalAlign: "top" }}>
              <td style={cell}>
                <Link href={`/admin/orders/${d.orderId}`}>{d.orderId.slice(-8)}</Link>
              </td>
              <td style={{ ...cell, whiteSpace: "nowrap" }}>{d.openedAt ? new Date(d.openedAt).toLocaleDateString() : ""}</td>
              <td style={cell}>
                {d.customer} <span style={{ color: "#666" }}>{d.email}</span>
              </td>
              <td style={cell}>{d.amount != null ? `$${d.amount}` : ""}</td>
              <td style={cell}>
                {d.status ?? "unknown"}
                {d.reason ? <div style={{ color: "#666" }}>{d.reason}</div> : null}
                <div style={{ color: d.open ? "#b00020" : "#666" }}>{d.open ? "open" : "closed"}</div>
              </td>
              <td style={cell}>
                <details>
                  <summary style={{ color: d.evidenceComplete ? undefined : "#b00020" }}>
                    {d.evidenceComplete ? "Complete" : `${d.missing.length} missing`}
                  </summary>
                  <ul style={{ margin: "4px 0 0", paddingLeft: 16 }}>
                    {d.evidence.map((e) => (
                      <li key={e.key} style={{ color: e.present ? undefined : "#b00020" }}>
                        {e.present ? "Have" : "Missing"}: {e.label}
                        {e.detail ? ` (${e.detail})` : ""}
                      </li>
                    ))}
                  </ul>
                  {d.stripeUrl && (
                    <p style={{ margin: "4px 0 0" }}>
                      <a href={d.stripeUrl} target="_blank" rel="noopener noreferrer">
                        Open in Stripe
                      </a>
                    </p>
                  )}
                </details>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {!loading && rows.length === 0 && !error && <p>No disputes.</p>}
      {data?.nextCursor && (
        <button type="button" onClick={() => load(data.nextCursor)} disabled={loading} style={{ marginTop: 16 }}>
          {loading ? "Loading…" : "Load more"}
        </button>
      )}
    </div>
  );
}
