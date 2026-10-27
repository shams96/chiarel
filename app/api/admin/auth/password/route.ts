import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { getSessionIdFromRequest, withRole } from "@/lib/auth";
import { withApiErrorHandling } from "@/lib/api-error";
import { isRateLimited } from "@/lib/rate-limit";
import { auditEntry } from "@/lib/audit";

const MIN_LENGTH = 12;
const MAX_BYTES = 72;
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;

// Any signed-in user can change their own password, and only their own: the
// target is always the session's user, never an id from the request. The
// current password is required so a stolen session cookie alone cannot take
// the account over, and every other session is revoked on success. See
// claudedocs/specs/admin-password/.
export const POST = withApiErrorHandling(
  withRole(["ADMIN", "MEMBER", "VIEWER"], async (req: NextRequest, user) => {
    if (isRateLimited(`admin-password:${user.id}`, MAX_ATTEMPTS, WINDOW_MS)) {
      return NextResponse.json(
        { error: "Too many attempts. Please try again in a few minutes." },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => null);
    const currentPassword = typeof body?.currentPassword === "string" ? body.currentPassword : "";
    const newPassword = typeof body?.newPassword === "string" ? body.newPassword : "";

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Current and new password are required" },
        { status: 400 }
      );
    }
    if (newPassword.length < MIN_LENGTH) {
      return NextResponse.json(
        { error: `New password must be at least ${MIN_LENGTH} characters` },
        { status: 400 }
      );
    }
    // bcrypt only reads the first 72 bytes; a longer password would be silently
    // truncated, so refuse it rather than let two different passwords collide.
    if (Buffer.byteLength(newPassword) > MAX_BYTES || Buffer.byteLength(currentPassword) > 1024) {
      return NextResponse.json(
        { error: `New password must be at most ${MAX_BYTES} bytes` },
        { status: 400 }
      );
    }
    if (!(await bcrypt.compare(currentPassword, user.passwordHash))) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
    }
    if (newPassword === currentPassword) {
      return NextResponse.json(
        { error: "New password must differ from the current one" },
        { status: 400 }
      );
    }

    const currentSessionId = getSessionIdFromRequest(req);
    const passwordHash = await bcrypt.hash(newPassword, 12);
    await db.$transaction([
      db.user.update({ where: { id: user.id }, data: { passwordHash } }),
      db.session.deleteMany({
        where: { userId: user.id, ...(currentSessionId ? { id: { not: currentSessionId } } : {}) },
      }),
      auditEntry(req, user, {
        action: "auth.password_changed",
        entityType: "User",
        entityId: user.id,
        summary: "Changed own password; other sessions signed out",
      }),
    ]);

    return NextResponse.json({ ok: true });
  })
);
