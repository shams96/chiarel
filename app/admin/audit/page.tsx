"use client";

// Audit log viewer (Admin only; the API enforces it). Read-only.
import { useCallback, useEffect, useState } from "react";
import { auditLabel } from "@/components/admin/auditLabel";
import {
  Alert,
  Button,
  EmptyState,
  PageHeader,
  PageShell,
  Table,
  inputClass,
  tdClass,
} from "@/components/admin/ui";

type Entry = {
  id: string;
  createdAt: string;
  actorEmail: string;
  action: string;
  entityType: string;
  entityId: string | null;
  summary: string | null;
  before: unknown;
  after: unknown;
  ip: string | null;
};

const FILTERS: { label: string; value: string }[] = [
  { label: "All", value: "" },
  { label: "Sign-ins", value: "auth." },
  { label: "Users", value: "user." },
  { label: "Founding 100", value: "founding100." },
];

export default function AdminAuditPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [action, setAction] = useState("");
  const [actor, setActor] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(
    async (after: string | null) => {
      setLoading(true);
      setError(null);
      const p = new URLSearchParams({ take: "50" });
      if (action) p.set("action", action);
      if (actor.trim()) p.set("actor", actor.trim());
      if (after) p.set("cursor", after);
      const res = await fetch(`/api/admin/audit?${p}`);
      setLoading(false);
      if (res.status === 403) return setError("Your account does not have Admin access.");
      if (!res.ok) return setError("Failed to load the audit log.");
      const json = await res.json();
      setEntries((prev) => (after ? [...prev, ...json.entries] : json.entries));
      setCursor(json.nextCursor);
    },
    [action, actor]
  );

  useEffect(() => {
    load(null);
  }, [load]);

  return (
    <PageShell>
      <PageHeader
        eyebrow="Accountability"
        title="Audit log"
        subtitle="A permanent record of who did what, and when. Entries can be read here but never edited or removed. Passwords are never recorded."
      />

      <div className="mb-5 flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => (
          <Button
            key={f.label}
            small
            variant={action === f.value ? "primary" : "secondary"}
            onClick={() => setAction(f.value)}
            aria-pressed={action === f.value}
          >
            {f.label}
          </Button>
        ))}
        <input
          type="search"
          placeholder="Filter by person (email)"
          value={actor}
          onChange={(e) => setActor(e.target.value)}
          aria-label="Filter by person"
          className={`${inputClass} !w-full sm:ml-auto sm:!w-72`}
        />
      </div>

      {error && <Alert kind="error">{error}</Alert>}

      {entries.length > 0 && (
        <Table head={["When", "Who", "What", "IP"]}>
          {entries.map((e) => (
            <tr key={e.id}>
              <td className={`${tdClass} whitespace-nowrap text-ink/80`}>{new Date(e.createdAt).toLocaleString()}</td>
              <td className={`${tdClass} min-w-[12rem] break-words`}>{e.actorEmail}</td>
              <td className={`${tdClass} min-w-[16rem] break-words`}>
                <span className="font-medium">{auditLabel(e)}</span>
                <div className="mt-0.5 break-words text-[12px] uppercase tracking-[0.14em] text-ink/70">{e.action}</div>
                {(e.before != null || e.after != null) && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-[12px] uppercase tracking-[0.2em] text-ochre underline underline-offset-4">
                      Details
                    </summary>
                    <pre className="mt-2 max-w-full overflow-x-auto whitespace-pre-wrap break-words border border-champagne bg-peachdust/40 p-3 text-[12px] leading-relaxed text-ink">
                      {JSON.stringify({ before: e.before, after: e.after }, null, 2)}
                    </pre>
                  </details>
                )}
              </td>
              <td className={`${tdClass} whitespace-nowrap text-ink/80`}>{e.ip ?? ""}</td>
            </tr>
          ))}
        </Table>
      )}
      {!loading && entries.length === 0 && !error && (
        <EmptyState title="No entries match" text="Try a different filter, or clear the person search." />
      )}
      {cursor && (
        <div className="mt-6">
          <Button variant="secondary" onClick={() => load(cursor)} disabled={loading}>
            {loading ? "Loading…" : "Load older"}
          </Button>
        </div>
      )}
    </PageShell>
  );
}
