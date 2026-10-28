"use client";

// Internal admin account page: change your own password. The API route is the
// enforcement boundary.
import { useState } from "react";
import { Alert, Button, Card, Field, LinkButton, PageHeader, PageShell, inputClass } from "@/components/admin/ui";

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
    <PageShell narrow>
      <PageHeader
        eyebrow="My account"
        title="Change password"
        subtitle="Choose something only you know, at least 12 characters. Your other signed-in devices are signed out when you save."
        actions={
          <LinkButton href="/admin/users" variant="ghost" small>
            Back to users
          </LinkButton>
        }
      />
      <Card tone="white">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <Field label="Current password">
            <input
              type="password"
              required
              autoComplete="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="New password (at least 12 characters)">
            <input
              type="password"
              required
              minLength={12}
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Confirm new password">
            <input
              type="password"
              required
              minLength={12}
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className={inputClass}
            />
          </Field>
          {error && <Alert kind="error">{error}</Alert>}
          {done && <Alert kind="success">Password changed. Your other signed-in sessions were signed out.</Alert>}
          <Button type="submit" disabled={submitting}>
            {submitting ? "Saving…" : "Change password"}
          </Button>
        </form>
      </Card>
    </PageShell>
  );
}
