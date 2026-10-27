// Human wording for audit entries that carry no summary of their own.
const LABELS: Record<string, string> = {
  "auth.login": "Signed in",
  "auth.login_failed": "Failed sign-in attempt",
  "auth.logout": "Signed out",
  "auth.password_changed": "Changed own password",
};

export function auditLabel(entry: { action: string; summary: string | null }): string {
  return entry.summary ?? LABELS[entry.action] ?? entry.action;
}
