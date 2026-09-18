import { createHmac, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import type { Role, User } from "@prisma/client";
import { db } from "@/lib/db";

const SESSION_COOKIE = "chiarel_admin_session";
const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours — internal tool, short-lived by design

function getSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    throw new Error("ADMIN_SESSION_SECRET is not set");
  }
  return secret;
}

// The cookie only ever carries a session id (a DB lookup key) plus an HMAC
// signature over that id — never the role or user id in a client-readable form.
// The signature isn't for confidentiality (the id alone doesn't grant access
// without a matching, unexpired Session row) but stops a client from presenting
// an arbitrary guessed/crafted id as if it were one we issued.
function sign(sessionId: string): string {
  const mac = createHmac("sha256", getSecret()).update(sessionId).digest("base64url");
  return `${sessionId}.${mac}`;
}

function verify(cookieValue: string): string | null {
  const [sessionId, mac] = cookieValue.split(".");
  if (!sessionId || !mac) return null;
  const expected = createHmac("sha256", getSecret()).update(sessionId).digest("base64url");
  const a = Buffer.from(mac);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  return sessionId;
}

export async function createSession(userId: string): Promise<string> {
  const session = await db.session.create({
    data: { userId, expiresAt: new Date(Date.now() + SESSION_TTL_MS) },
  });
  return sign(session.id);
}

export async function destroySessionById(sessionId: string): Promise<void> {
  await db.session.delete({ where: { id: sessionId } }).catch(() => {
    // Already gone (expired cleanup, double logout) — not an error the caller needs.
  });
}

export function setSessionCookie(res: NextResponse, signedValue: string): void {
  res.cookies.set(SESSION_COOKIE, signedValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  });
}

export function clearSessionCookie(res: NextResponse): void {
  res.cookies.set(SESSION_COOKIE, "", { path: "/", maxAge: 0 });
}

export function getSessionIdFromRequest(req: NextRequest): string | null {
  const raw = req.cookies.get(SESSION_COOKIE)?.value;
  if (!raw) return null;
  return verify(raw);
}

// Returns the authenticated User for this request, or null if there's no
// session, the session is unknown, or it has expired. An expired session is
// opportunistically deleted rather than left to accumulate.
export async function getSessionUser(req: NextRequest): Promise<User | null> {
  const sessionId = getSessionIdFromRequest(req);
  if (!sessionId) return null;

  const session = await db.session.findUnique({
    where: { id: sessionId },
    include: { user: true },
  });
  if (!session) return null;

  if (session.expiresAt < new Date()) {
    await destroySessionById(session.id);
    return null;
  }

  return session.user;
}

type RouteHandler<Args extends unknown[]> = (
  req: NextRequest,
  user: User,
  ...rest: Args
) => Promise<NextResponse>;

// The enforcement mechanism: every internal route wraps its handler in
// withRole(allowed, handler). `allowed` is a required, explicit array — there is
// no variant that skips it, so a route missing this wrapper is visibly absent in
// review rather than silently unprotected. See claudedocs/specs/admin-rbac/.
export function withRole<Args extends unknown[]>(allowed: Role[], handler: RouteHandler<Args>) {
  return async (req: NextRequest, ...rest: Args): Promise<NextResponse> => {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!allowed.includes(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return handler(req, user, ...rest);
  };
}
