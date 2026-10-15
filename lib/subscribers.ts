import { createHmac, timingSafeEqual } from "crypto";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeEmail(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const email = raw.trim().toLowerCase();
  if (email.length > 254 || !EMAIL_RE.test(email)) return null;
  return email;
}

export function normalizeSource(raw: unknown): string {
  return typeof raw === "string" && /^[a-z0-9_-]{1,40}$/.test(raw) ? raw : "unknown";
}

function secret(): string | null {
  return process.env.UNSUBSCRIBE_SECRET || process.env.ADMIN_SESSION_SECRET || null;
}

/** HMAC over the normalized email; null when no secret is configured. */
export function unsubscribeToken(email: string): string | null {
  const s = secret();
  return s ? createHmac("sha256", s).update(`unsubscribe:${email}`).digest("base64url") : null;
}

export function verifyUnsubscribeToken(email: string, token: string): boolean {
  const expected = unsubscribeToken(email);
  if (!expected) return false;
  const a = Buffer.from(token);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function unsubscribeUrl(baseUrl: string, email: string): string | null {
  const t = unsubscribeToken(email);
  return t ? `${baseUrl}/api/unsubscribe?e=${encodeURIComponent(email)}&t=${t}` : null;
}

/** Prisma "table/column does not exist" — the migration has not been applied yet. */
export function isMissingTableError(err: unknown): boolean {
  const code = (err as { code?: string } | null)?.code;
  return code === "P2021" || code === "P2022";
}

/** Neutralise spreadsheet formula injection in exported cells. */
export function csvCell(v: string): string {
  const safe = /^[=+\-@\t\r]/.test(v) ? `'${v}` : v;
  return `"${safe.replace(/"/g, '""')}"`;
}
