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
  if (!/^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[^\s@<>()[\]\\,;:"]{2,}$/.test(email)) return null;
  return email;
}

const keyed = (label: string, value: string) =>
  createHmac("sha256", customerSecret()).update(`${label}.${value}`).digest("hex");

export const hashEmail = (email: string) => keyed("login-email", email);
const hashCode = (emailHash: string, code: string) => keyed("login-code", `${emailHash}.${code}`);

/** Creates a fresh code for the address, killing any older one. Returns the clear code to email. */
export async function issueLoginCode(email: string): Promise<string> {
  const emailHash = hashEmail(email);
  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  await db.loginCode.deleteMany({ where: { emailHash } });
  await db.loginCode.create({
    data: { emailHash, codeHash: hashCode(emailHash, code), expiresAt: new Date(Date.now() + CODE_TTL_MS) },
  });
  return code;
}

/**
 * True only for the current, unexpired, unspent code, within five attempts. Every
 * other outcome (no code, expired, wrong, spent, burned) is the same `false`, so
 * the caller cannot leak which one it was. A correct code is spent atomically, so
 * two parallel submissions cannot both succeed.
 */
export async function verifyLoginCode(email: string, code: string): Promise<boolean> {
  if (!/^\d{6}$/.test(code)) return false;
  const emailHash = hashEmail(email);
  const row = await db.loginCode.findFirst({
    where: { emailHash, consumedAt: null },
    orderBy: { createdAt: "desc" },
  });
  if (!row) return false;
  if (row.expiresAt.getTime() <= Date.now()) {
    await db.loginCode.deleteMany({ where: { emailHash } });
    return false;
  }
  // Count the attempt before comparing, so a parallel burst cannot out-guess the cap.
  const bumped = await db.loginCode.update({ where: { id: row.id }, data: { attempts: { increment: 1 } } });
  if (bumped.attempts > MAX_ATTEMPTS) {
    await db.loginCode.deleteMany({ where: { emailHash } });
    return false;
  }
  const given = Buffer.from(hashCode(emailHash, code));
  const stored = Buffer.from(row.codeHash);
  const match = given.length === stored.length && timingSafeEqual(given, stored);
  if (!match) {
    if (bumped.attempts >= MAX_ATTEMPTS) await db.loginCode.deleteMany({ where: { emailHash } });
    return false;
  }
  const spent = await db.loginCode.updateMany({ where: { id: row.id, consumedAt: null }, data: { consumedAt: new Date() } });
  return spent.count === 1;
}
