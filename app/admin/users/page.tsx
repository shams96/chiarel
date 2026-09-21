"use client";

// Admin-only user management. Fetching/mutations hit /api/admin/users, which is
// the real security boundary (withRole(["ADMIN"], ...)) — this page renders the
// same for anyone who loads it, but a Member/Viewer's requests will 401/403 from
// the API regardless of what this page shows. See claudedocs/specs/admin-rbac/.
import { useEffect, useState } from "react";

type Role = "ADMIN" | "MEMBER" | "VIEWER";
type AdminUser = { id: string; email: string; role: Role; createdAt: string };

const ROLES: Role[] = ["ADMIN", "MEMBER", "VIEWER"];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<Role>("VIEWER");
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    const res = await fetch("/api/admin/users");
    if (res.status === 401) {
      setError("Not signed in.");
      return;
    }
    if (res.status === 403) {
      setError("Your account does not have Admin access.");
      return;
    }
    if (!res.ok) {
      setError("Failed to load users.");
      return;
    }
    const json = await res.json();
    setUsers(json.users);
    setError(null);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: newEmail, password: newPassword, role: newRole }),
    });
    const json = await res.json().catch(() => ({}));
    setSubmitting(false);
    if (!res.ok) {
      setError(json.error ?? "Failed to create user");
      return;
    }
    setNewEmail("");
    setNewPassword("");
    setNewRole("VIEWER");
    load();
  }

  async function handleRoleChange(id: string, role: Role) {
    setError(null);
    const res = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(json.error ?? "Failed to update role");
      return;
    }
    load();
  }

  async function handleDelete(id: string) {
    setError(null);
    const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(json.error ?? "Failed to delete user");
      return;
    }
    load();
  }

  return (
    <div style={{ maxWidth: 720, margin: "40px auto", fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ fontSize: 20, marginBottom: 24 }}>Admin users</h1>

      {error && (
        <p style={{ color: "#b00020", fontSize: 13, marginBottom: 16 }} role="alert">
          {error}
        </p>
      )}

      {users && (
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, marginBottom: 32 }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "1px solid #ccc" }}>
              <th style={{ padding: 8 }}>Email</th>
              <th style={{ padding: 8 }}>Role</th>
              <th style={{ padding: 8 }}></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ padding: 8 }}>{u.email}</td>
                <td style={{ padding: 8 }}>
                  <select
                    value={u.role}
                    onChange={(e) => handleRoleChange(u.id, e.target.value as Role)}
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </td>
                <td style={{ padding: 8 }}>
                  <button type="button" onClick={() => handleDelete(u.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h2 style={{ fontSize: 16, marginBottom: 12 }}>Create user</h2>
      <form onSubmit={handleCreate} style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
        <label style={{ fontSize: 12 }}>
          Email
          <input
            type="email"
            required
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            style={{ display: "block", padding: 6 }}
          />
        </label>
        <label style={{ fontSize: 12 }}>
          Password
          <input
            type="password"
            required
            minLength={12}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            style={{ display: "block", padding: 6 }}
          />
        </label>
        <label style={{ fontSize: 12 }}>
          Role
          <select value={newRole} onChange={(e) => setNewRole(e.target.value as Role)}>
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" disabled={submitting} style={{ padding: 8 }}>
          {submitting ? "Creating…" : "Create"}
        </button>
      </form>
    </div>
  );
}
