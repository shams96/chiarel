"use client";

// Audit log viewer (Admin only; the API enforces it). Read-only.
import { useCallback, useEffect, useState } from "react";
import { auditLabel } from "@/components/admin/auditLabel";

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
    <div style={{ maxWidth: 960, margin: "40px auto", padding: "0 16px", fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ fontSize: 20, marginBottom: 16 }}>Audit log</h1>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16, fontSize: 13 }}>
        {FILTERS.map((f) => (
          <button
            key={f.label}
            type="button"
            onClick={() => setAction(f.value)}
            aria-pressed={action === f.value}
            style={{ fontWeight: action === f.value ? 700 : 400 }}
          >
            {f.label}
          </button>
        ))}
        <input
          type="search"
          placeholder="Filter by person (email)"
          value={actor}
          onChange={(e) => setActor(e.target.value)}
          aria-label="Filter by person"
          style={{ padding: 4, marginLeft: "auto" }}
        />
      </div>
      {error && (
        <p style={{ color: "#b00020", fontSize: 13 }} role="alert">
          {error}
        </p>
      )}
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr style={{ textAlign: "left", borderBottom: "1px solid #ccc" }}>
            <th style={{ padding: 8 }}>When</th>
            <th style={{ padding: 8 }}>Who</th>
            <th style={{ padding: 8 }}>What</th>
            <th style={{ padding: 8 }}>IP</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((e) => (
            <tr key={e.id} style={{ borderBottom: "1px solid #eee", verticalAlign: "top" }}>
              <td style={{ padding: 8, whiteSpace: "nowrap" }}>{new Date(e.createdAt).toLocaleString()}</td>
              <td style={{ padding: 8 }}>{e.actorEmail}</td>
              <td style={{ padding: 8 }}>
                {auditLabel(e)}
                <div style={{ color: "#666", fontSize: 11 }}>{e.action}</div>
                {(e.before != null || e.after != null) && (
                  <details style={{ marginTop: 4 }}>
                    <summary>Details</summary>
                    <pre style={{ fontSize: 11, whiteSpace: "pre-wrap" }}>
                      {JSON.stringify({ before: e.before, after: e.after }, null, 2)}
                    </pre>
                  </details>
                )}
              </td>
              <td style={{ padding: 8 }}>{e.ip ?? ""}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {!loading && entries.length === 0 && !error && <p style={{ fontSize: 13 }}>No entries match.</p>}
      {cursor && (
        <button type="button" onClick={() => load(cursor)} disabled={loading} style={{ marginTop: 16 }}>
          {loading ? "Loading…" : "Load older"}
        </button>
      )}
    </div>
  );
}
