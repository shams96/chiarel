import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { withRole } from "@/lib/auth";
import { withApiErrorHandling } from "@/lib/api-error";
import { auditEntry } from "@/lib/audit";

type RouteContext = { params: Promise<{ id: string }> };

// Set a temporary password for another user (a lost password). The user's
// sessions are revoked so the old credentials stop working immediately, and the
// user is expected to change it at /admin/account. Not available on yourself:
// that goes through the account page, which requires the current password.
// The password itself is never written to the audit entry.
export const POST = withApiErrorHandling(
  withRole<[RouteContext]>(["ADMIN"], async (req, actor, { params: paramsPromise }) => {
    const { id } = await paramsPromise;
    if (id === actor.id) {
      return NextResponse.json({ error: "Change your own password at /admin/account" }, { status: 400 });
    }
    const body = await req.json().catch(() => null);
    const password = typeof body?.password === "string" ? body.password : "";
    if (password.length < 12) {
      return NextResponse.json({ error: "Password must be at least 12 characters" }, { status: 400 });
    }
    if (Buffer.byteLength(password) > 72) {
      return NextResponse.json({ error: "Password must be at most 72 bytes" }, { status: 400 });
    }
    const target = await db.user.findUnique({ where: { id } });
    if (!target) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    await db.$transaction([
      db.user.update({ where: { id }, data: { passwordHash } }),
      db.session.deleteMany({ where: { userId: id } }),
      auditEntry(req, actor, {
        action: "user.password_reset",
        entityType: "User",
        entityId: id,
        summary: `Set a temporary password for ${target.email}; their sessions were signed out`,
      }),
    ]);
    return NextResponse.json({ ok: true });
  })
);
