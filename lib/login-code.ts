import { createHmac, randomInt, timingSafeEqual } from "crypto";
import { db } from "@/lib/db";
import { customerSecret } from "@/lib/customer-session";

// One-time email sign-in codes (claudedocs/specs/customer-accounts/). Six digits
// from the OS CSPRNG, stored only as a keyed hash, ten minutes to live, five
// guesses and then burned, one live code per address.

export const CODE_TTL_MS = 10 * 60 * 1000;
export const MAX_ATTEMPTS = 5;

/** Trim + lower-case; null when it cannot be an address. */
export function normaliseEmail(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const email = raw.trim().toLowerCase();
  if (email.length < 3 || email.length > 254) return null;
  // % is a SQL LIKE wildcard; nobody has it in an address, so refuse it outright.
  if (email.includes("%")) return null;
  if (!/^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[^\s@<>()[\]\\,;:"]{2,}$/.test(email)) return null;
  return email;
}

const keyed = (label: string, value: string) =>
  createHmac("sha256", customerSecret()).update(`${label}.${value}`).digest("hex");

export const hashEmail = (email: string) => keyed("login-email", email);
const hashCode = (emailHash: string, code: string) => keyed("login-code", `${emailHash}.${code}`);

export const MAX_LIVE_CODES = 5; // > 1 + the 3 starts one IP may make, so a single source cannot push the owner code out

/**
 * Creates a fresh code for the address and returns the clear code to email. Older
 * codes that are still live are NOT deleted (a stranger asking for codes must not
 * be able to invalidate the one the real owner is about to type): up to five live
 * codes per address coexist, each with its own five-attempt budget. Only expired or
 * spent rows are cleared, and when a fourth live code is requested the oldest goes.
 */
export async function issueLoginCode(email: string): Promise<string> {
  const emailHash = hashEmail(email);
  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  const now = new Date();
  await db.loginCode.deleteMany({
    where: { emailHash, OR: [{ expiresAt: { lte: now } }, { consumedAt: { not: null } }] },
  });
  const live = await db.loginCode.findMany({ where: { emailHash }, orderBy: { createdAt: "asc" } });
  const surplus = live.slice(0, Math.max(0, live.length - (MAX_LIVE_CODES - 1)));
  if (surplus.length) await db.loginCode.deleteMany({ where: { id: { in: surplus.map((r) => r.id) } } });
  await db.loginCode.create({
    data: { emailHash, codeHash: hashCode(emailHash, code), expiresAt: new Date(Date.now() + CODE_TTL_MS) },
  });
  return code;
}

/**
 * True only for one of the address's live (unexpired, unspent) codes, within five
 * attempts of that code. Every other outcome (none, expired, wrong, spent, burned)
 * is the same `false`, so the caller cannot leak which one it was. A correct code
 * is spent atomically, so two parallel submissions cannot both succeed; on success
 * the address's other codes are dropped.
 */
export async function verifyLoginCode(email: string, code: string): Promise<boolean> {
  if (!/^\d{6}$/.test(code)) return false;
  const emailHash = hashEmail(email);
  const now = new Date();
  await db.loginCode.deleteMany({
    where: { emailHash, OR: [{ expiresAt: { lte: now } }, { consumedAt: { not: null } }] },
  });
  const rows = await db.loginCode.findMany({ where: { emailHash }, orderBy: { createdAt: "asc" } });
  const given = Buffer.from(hashCode(emailHash, code));
  let matched: string | null = null;
  for (const row of rows) {
    // Count the attempt before comparing, so a parallel burst cannot out-guess the cap.
    const bumped = await db.loginCode.update({ where: { id: row.id }, data: { attempts: { increment: 1 } } });
    if (bumped.attempts > MAX_ATTEMPTS) {
      await db.loginCode.deleteMany({ where: { id: { in: [row.id] } } });
      continue;
    }
    const stored = Buffer.from(row.codeHash);
    if (given.length === stored.length && timingSafeEqual(given, stored)) {
      matched = row.id;
    } else if (bumped.attempts >= MAX_ATTEMPTS) {
      await db.loginCode.deleteMany({ where: { id: { in: [row.id] } } });
    }
  }
  if (!matched) return false;
  const spent = await db.loginCode.updateMany({ where: { id: matched, consumedAt: null }, data: { consumedAt: new Date() } });
  if (spent.count !== 1) return false;
  await db.loginCode.deleteMany({ where: { emailHash } });
  return true;
}
