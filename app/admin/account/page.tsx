"use client";

// Internal admin account page: change your own password. Plain styling to match
// the other admin pages; the API route is the enforcement boundary.
import { useState } from "react";

const field = { display: "block", width: "100%", padding: 8, marginTop: 4 } as const;

export default function AdminAccountPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setDone(false);
    if (newPassword !== confirm) {
      setError("The new passwords do not match");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/auth/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const json = await res.json().catch(() => ({}));
      if (res.status === 401) {
        setError("Not signed in. Sign in again at /admin/login.");
      } else if (!res.ok) {
        setError(json.error ?? "Could not change the password");
      } else {
        setDone(true);
        setCurrentPassword("");
        setNewPassword("");
        setConfirm("");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    }
    setSubmitting(false);
  }

  return (
    <div style={{ maxWidth: 360, margin: "80px auto", fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ fontSize: 20, marginBottom: 8 }}>Change password</h1>
      <p style={{ fontSize: 13, marginBottom: 24 }}>
        <a href="/admin/users">Back to users</a>
      </p>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <label style={{ fontSize: 13 }}>
          Current password
          <input
            type="password"
            required
            autoComplete="current-password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            style={field}
          />
        </label>
        <label style={{ fontSize: 13 }}>
          New password (at least 12 characters)
          <input
            type="password"
            required
            minLength={12}
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            style={field}
          />
        </label>
        <label style={{ fontSize: 13 }}>
          Confirm new password
          <input
            type="password"
            required
            minLength={12}
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            style={field}
          />
        </label>
        {error && (
          <p style={{ color: "#b00020", fontSize: 13 }} role="alert">
            {error}
          </p>
        )}
        {done && (
          <p style={{ fontSize: 13 }} role="status">
            Password changed. Your other signed-in sessions were signed out.
          </p>
        )}
        <button
          type="submit"
          disabled={submitting}
          style={{ padding: 10, marginTop: 8, cursor: submitting ? "wait" : "pointer" }}
        >
          {submitting ? "Saving…" : "Change password"}
        </button>
      </form>
    </div>
  );
}
