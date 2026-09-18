import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { db } from "@/lib/db";
import { createSession, setSessionCookie } from "@/lib/auth";
import { withApiErrorHandling } from "@/lib/api-error";

// No self-service signup route exists anywhere in this admin surface — accounts
// are created by an Admin (app/api/admin/users) or the one-time seed bootstrap
// (prisma/seed.ts). An open signup endpoint on an internal admin system is
// unnecessary attack surface. See claudedocs/specs/admin-rbac/.
export const POST = withApiErrorHandling(async (req: NextRequest) => {
  const body = await req.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
  }

  const user = await db.user.findUnique({ where: { email } });

  // Deliberately identical response whether the email doesn't exist or the
  // password is wrong — distinguishing the two would let a caller enumerate
  // which admin emails are registered.
  const invalid = () => NextResponse.json({ error: "Invalid email or password" }, { status: 401 });

  if (!user) return invalid();
  const matches = await bcrypt.compare(password, user.passwordHash);
  if (!matches) return invalid();

  const signedSession = await createSession(user.id);
  const res = NextResponse.json({ email: user.email, role: user.role });
  setSessionCookie(res, signedSession);
  return res;
});
