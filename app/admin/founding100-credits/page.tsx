"use client";

// Founding 100 credit-back ledger. Real security boundary is
// /api/admin/founding100-credits (withRole — MEMBER can view, ADMIN can mark
// issued); this page renders the same for anyone who loads it. See
// claudedocs/specs/international-launch/ (N1/Founding 100 fold) for why this
// exists: the 25%-credit-back promise had no tracking anywhere before it.
import { useEffect, useState } from "react";

type CreditOrder = {
  id: string;
  createdAt: string;
  email: string;
  founding100Credit: number;
  founding100CreditIssuedAt: string | null;
  status: string;
};

export default function FoundingCreditsPage() {
  const [orders, setOrders] = useState<CreditOrder[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [issuingId, setIssuingId] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/admin/founding100-credits");
    if (res.status === 401) return setError("Not signed in.");
    if (res.status === 403) return setError("Your account does not have access.");
    if (!res.ok) return setError("Failed to load credits.");
    const json = await res.json();
    setOrders(json.orders);
    setError(null);
  }

  useEffect(() => {
    load();
  }, []);

  async function markIssued(orderId: string) {
    setIssuingId(orderId);
    setError(null);
    const res = await fetch("/api/admin/founding100-credits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId }),
    });
    const json = await res.json().catch(() => ({}));
    setIssuingId(null);
    if (!res.ok) {
      setError(json.error ?? "Failed to mark credit as issued");
      return;
    }
    load();
  }

  const owed = orders?.filter((o) => !o.founding100CreditIssuedAt) ?? [];
  const owedTotal = owed.reduce((sum, o) => sum + o.founding100Credit, 0);

  return (
    <div style={{ maxWidth: 820, margin: "40px auto", fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ fontSize: 20, marginBottom: 8 }}>Founding 100 credits</h1>
      <p style={{ fontSize: 13, color: "#555", marginBottom: 24 }}>
        {orders ? `${owed.length} credit(s) outstanding, $${owedTotal} owed` : "Loading…"}
      </p>

      {error && (
        <p style={{ color: "#b00020", fontSize: 13, marginBottom: 16 }} role="alert">
          {error}
        </p>
      )}

      {orders && (
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "1px solid #ccc" }}>
              <th style={{ padding: 8 }}>Order</th>
              <th style={{ padding: 8 }}>Email</th>
              <th style={{ padding: 8 }}>Placed</th>
              <th style={{ padding: 8 }}>Credit owed</th>
              <th style={{ padding: 8 }}>Status</th>
              <th style={{ padding: 8 }}></th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ padding: 8, fontFamily: "monospace" }}>{o.id.slice(0, 8)}</td>
                <td style={{ padding: 8 }}>{o.email}</td>
                <td style={{ padding: 8 }}>{new Date(o.createdAt).toLocaleDateString()}</td>
                <td style={{ padding: 8 }}>${o.founding100Credit}</td>
                <td style={{ padding: 8 }}>
                  {o.founding100CreditIssuedAt
                    ? `Issued ${new Date(o.founding100CreditIssuedAt).toLocaleDateString()}`
                    : "Owed"}
                </td>
                <td style={{ padding: 8 }}>
                  {!o.founding100CreditIssuedAt && (
                    <button
                      type="button"
                      disabled={issuingId === o.id}
                      onClick={() => markIssued(o.id)}
                    >
                      {issuingId === o.id ? "Marking…" : "Mark issued"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: 8, color: "#777" }}>
                  No Founding 100 orders yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
