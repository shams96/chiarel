"use client";

// Admin-only user management. Fetching/mutations hit /api/admin/users, which is
// the real security boundary (withRole(["ADMIN"], ...)) — this page renders the
// same for anyone who loads it, but a Member/Viewer's requests will 401/403 from
// the API regardless of what this page shows. See claudedocs/specs/admin-rbac/.
import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Card,
  EmptyState,
  Field,
  Loading,
  LinkButton,
  PageHeader,
  PageShell,
  SectionTitle,
  Table,
  inputClass,
  tdClass,
} from "@/components/admin/ui";

type Role = "ADMIN" | "MEMBER" | "VIEWER";
type AdminUser = { id: string; email: string; role: Role; createdAt: string };

const ROLES: Role[] = ["ADMIN", "MEMBER", "VIEWER"];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
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

  async function handleSignOutEverywhere(id: string, email: string) {
    if (!window.confirm(`Sign ${email} out everywhere?`)) return;
    setError(null);
    setNotice(null);
    const res = await fetch(`/api/admin/users/${id}/sessions`, { method: "DELETE" });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(json.error ?? "Failed to sign the user out");
      return;
    }
    setNotice(`${email} was signed out everywhere.`);
  }

  async function handleTempPassword(id: string, email: string) {
    const password = window.prompt(
      `Temporary password for ${email} (12+ characters). They sign in with it and change it at /admin/account.`
    );
    if (!password) return;
    setError(null);
    setNotice(null);
    const res = await fetch(`/api/admin/users/${id}/password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(json.error ?? "Failed to set the password");
      return;
    }
    setNotice(`Temporary password set for ${email}; their sessions were signed out.`);
  }

  return (
    <PageShell>
      <PageHeader
        eyebrow="People"
        title="Admin users"
        subtitle="Who can sign in to this console, and what they can do. Admins manage people and prices, Members run day-to-day operations, Viewers can look but not change."
        actions={
          <LinkButton href="/admin/account" variant="secondary">
            Change my password
          </LinkButton>
        }
      />

      {error && <Alert kind="error">{error}</Alert>}
      {notice && <Alert kind="success">{notice}</Alert>}

      {users === null && !error && <Loading />}
      {users && users.length === 0 && (
        <EmptyState title="No users yet" text="Create the first account with the form below." />
      )}
      {users && users.length > 0 && (
        <Table head={["Email", "Role", "Actions"]}>
          {users.map((u) => (
            <tr key={u.id}>
              <td className={`${tdClass} min-w-[12rem] break-words font-medium`}>{u.email}</td>
              <td className={tdClass}>
                <select
                  value={u.role}
                  aria-label={`Role for ${u.email}`}
                  onChange={(e) => handleRoleChange(u.id, e.target.value as Role)}
                  className={`${inputClass} !w-auto min-w-[9rem]`}
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </td>
              <td className={tdClass}>
                <div className="flex min-w-[33rem] flex-wrap gap-2">
                  <Button variant="secondary" small onClick={() => handleTempPassword(u.id, u.email)}>
                    Set temp password
                  </Button>
                  <Button variant="secondary" small onClick={() => handleSignOutEverywhere(u.id, u.email)}>
                    Sign out everywhere
                  </Button>
                  <Button variant="danger" small onClick={() => handleDelete(u.id)}>
                    Delete
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </Table>
      )}

      <SectionTitle hint="Passwords need at least 12 characters. They can change it themselves afterwards.">
        Create user
      </SectionTitle>
      <Card tone="peach">
        <form onSubmit={handleCreate} className="grid items-end gap-4 md:grid-cols-[2fr_2fr_1fr_auto]">
          <Field label="Email">
            <input
              type="email"
              required
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Password">
            <input
              type="password"
              required
              minLength={12}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Role">
            <select value={newRole} onChange={(e) => setNewRole(e.target.value as Role)} className={inputClass}>
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </Field>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Creating…" : "Create"}
          </Button>
        </form>
      </Card>
    </PageShell>
  );
}
