import { createHmac, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import type { Customer } from "@prisma/client";
import { db } from "@/lib/db";

// Storefront customer session (claudedocs/specs/customer-accounts/). A different
// cookie, table and HMAC secret from the admin session in lib/auth.ts, so neither
// cookie can authenticate the other's routes. The cookie carries only a session
// id plus a signature; the DB row decides whether it is still valid.

export const CUSTOMER_COOKIE = "chiarel_session";
export const CUSTOMER_SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days, sliding
// A session row is only rewritten once it is a day old, so a busy page does not
// write on every request.
const TOUCH_AFTER_MS = 24 * 60 * 60 * 1000;

/**
 * CUSTOMER_SESSION_SECRET when set. If it is not, a key is derived from
 * ADMIN_SESSION_SECRET under a different label, so the customer key is still not
 * the admin key. Set CUSTOMER_SESSION_SECRET in production so rotating one does
 * not rotate the other.
 */
export function customerSecret(): string {
  const own = process.env.CUSTOMER_SESSION_SECRET;
  if (own) return own;
  const admin = process.env.ADMIN_SESSION_SECRET;
  if (!admin) throw new Error("CUSTOMER_SESSION_SECRET is not set");
  return createHmac("sha256", admin).update("chiarel-customer-session-v1").digest("hex");
}

function mac(sessionId: string): string {
  return createHmac("sha256", customerSecret()).update(`cs.${sessionId}`).digest("base64url");
}

function sign(sessionId: string): string {
  return `${sessionId}.${mac(sessionId)}`;
}

function verify(value: string): string | null {
  const [sessionId, given] = value.split(".");
  if (!sessionId || !given) return null;
  const expected = Buffer.from(mac(sessionId));
  const actual = Buffer.from(given);
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null;
  return sessionId;
}

/** A new session id on every sign-in (no session fixation). Returns the signed cookie value. */
export async function createCustomerSession(customerId: string, userAgent?: string | null): Promise<string> {
  const session = await db.customerSession.create({
    data: {
      customerId,
      expiresAt: new Date(Date.now() + CUSTOMER_SESSION_TTL_MS),
      userAgent: userAgent ? userAgent.slice(0, 200) : null,
    },
  });
  return sign(session.id);
}

export function setCustomerCookie(res: NextResponse, signedValue: string): void {
  res.cookies.set(CUSTOMER_COOKIE, signedValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: CUSTOMER_SESSION_TTL_MS / 1000,
  });
}

export function clearCustomerCookie(res: NextResponse): void {
  res.cookies.set(CUSTOMER_COOKIE, "", { path: "/", maxAge: 0 });
}

export type CustomerAuth = { customer: Customer; sessionId: string; refreshed: boolean };

/**
 * Resolves a raw cookie value to its customer, or null (no cookie, bad
 * signature, unknown or expired session, deleted customer). Slides the expiry
 * forward when the session is more than a day old; `refreshed` tells the caller
 * to re-issue the cookie so its own max-age slides too.
 */
export async function resolveCustomerSession(raw: string | undefined | null): Promise<CustomerAuth | null> {
  if (!raw) return null;
  const sessionId = verify(raw);
  if (!sessionId) return null;
  const session = await db.customerSession.findUnique({ where: { id: sessionId }, include: { customer: true } });
  if (!session) return null;
  const now = Date.now();
  if (session.expiresAt.getTime() <= now) {
    await db.customerSession.delete({ where: { id: session.id } }).catch(() => {});
    return null;
  }
  if (session.customer.deletedAt) return null;
  let refreshed = false;
  if (now - session.lastSeenAt.getTime() > TOUCH_AFTER_MS) {
    await db.customerSession.update({
      where: { id: session.id },
      data: { lastSeenAt: new Date(now), expiresAt: new Date(now + CUSTOMER_SESSION_TTL_MS) },
    });
    refreshed = true;
  }
  return { customer: session.customer, sessionId: session.id, refreshed };
}

export function getCustomerSession(req: NextRequest): Promise<CustomerAuth | null> {
  return resolveCustomerSession(req.cookies.get(CUSTOMER_COOKIE)?.value);
}

export async function destroyCustomerSession(sessionId: string): Promise<void> {
  await db.customerSession.delete({ where: { id: sessionId } }).catch(() => {});
}
