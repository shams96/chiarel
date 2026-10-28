"use client";

// Founding 100 credit-back ledger. Real security boundary is
// /api/admin/founding100-credits (withRole — MEMBER can view, ADMIN can mark
// issued); this page renders the same for anyone who loads it. See
// claudedocs/specs/international-launch/ (N1/Founding 100 fold) for why this
// exists: the 25%-credit-back promise had no tracking anywhere before it.
import { useEffect, useState } from "react";
import { Alert, Badge, Button, EmptyState, Loading, PageHeader, PageShell, Stat, StatGrid, Table, tdClass } from "@/components/admin/ui";

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
    <PageShell>
      <PageHeader
        eyebrow="Founding 100"
        title="Founding 100 credits"
        subtitle={orders ? `${owed.length} credit(s) outstanding, $${owedTotal} owed` : "Loading…"}
      />

      {error && <Alert kind="error">{error}</Alert>}

      {orders && (
        <div className="mb-8">
          <StatGrid>
            <Stat label="Outstanding" value={owed.length} tone={owed.length > 0 ? "redochre" : "white"} sub="credits still to issue" />
            <Stat label="Owed" value={`$${owedTotal}`} tone="peach" sub="to Founding 100 customers" />
            <Stat label="Issued" value={orders.length - owed.length} tone="garden" sub="credits already issued" />
          </StatGrid>
        </div>
      )}

      {orders === null && !error && <Loading />}

      {orders && orders.length > 0 && (
        <>
          <ul className="grid gap-3 md:hidden">
            {orders.map((o) => (
              <li key={o.id} className="border border-champagne bg-white p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[13px]">{o.id.slice(0, 8)}</span>
                  <span className="font-serif text-lg">${o.founding100Credit}</span>
                </div>
                <p className="mt-1 [overflow-wrap:anywhere] text-[13px] text-ink/75">
                  {o.email} · placed {new Date(o.createdAt).toLocaleDateString()}
                </p>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                  {o.founding100CreditIssuedAt ? (
                    <Badge tone="ok">{`Issued ${new Date(o.founding100CreditIssuedAt).toLocaleDateString()}`}</Badge>
                  ) : (
                    <Badge tone="warn">Owed</Badge>
                  )}
                  {!o.founding100CreditIssuedAt && (
                    <Button variant="champagne" small disabled={issuingId === o.id} onClick={() => markIssued(o.id)}>
                      {issuingId === o.id ? "Marking…" : "Mark issued"}
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
          <div className="hidden md:block">
            <Table head={["Order", "Email", "Placed", "Credit owed", "Status", ""]}>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td className={`${tdClass} font-mono text-[13px]`}>{o.id.slice(0, 8)}</td>
                  <td className={tdClass}>{o.email}</td>
                  <td className={`${tdClass} whitespace-nowrap`}>{new Date(o.createdAt).toLocaleDateString()}</td>
                  <td className={tdClass}>${o.founding100Credit}</td>
                  <td className={tdClass}>
                    {o.founding100CreditIssuedAt ? (
                      <Badge tone="ok">{`Issued ${new Date(o.founding100CreditIssuedAt).toLocaleDateString()}`}</Badge>
                    ) : (
                      <Badge tone="warn">Owed</Badge>
                    )}
                  </td>
                  <td className={`${tdClass} text-right`}>
                    {!o.founding100CreditIssuedAt && (
                      <Button variant="champagne" small disabled={issuingId === o.id} onClick={() => markIssued(o.id)}>
                        {issuingId === o.id ? "Marking…" : "Mark issued"}
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </Table>
          </div>
        </>
      )}

      {orders && orders.length === 0 && (
        <EmptyState title="No Founding 100 orders yet." text="When a Founding 100 order is placed, the credit we owe the customer appears here until you mark it issued." />
      )}
    </PageShell>
  );
}
