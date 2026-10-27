import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withRole } from "@/lib/auth";
import { auditEntry, userSnapshot } from "@/lib/audit";
import { withApiErrorHandling } from "@/lib/api-error";

const ROLES = ["ADMIN", "MEMBER", "VIEWER"] as const;

type RouteContext = { params: Promise<{ id: string }> };

export const PATCH = withApiErrorHandling(
  withRole<[RouteContext]>(["ADMIN"], async (req, currentUser, { params: paramsPromise }) => {
    const params = await paramsPromise;
    const body = await req.json().catch(() => null);
    const role = body?.role;
    if (!ROLES.includes(role)) {
      return NextResponse.json(
        { error: `Role must be one of: ${ROLES.join(", ")}` },
        { status: 400 }
      );
    }

    const target = await db.user.findUnique({ where: { id: params.id } });
    if (!target) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    if (target.id === currentUser.id && role !== "ADMIN") {
      // An Admin demoting themselves with no other Admin left would lock the
      // account out of user management entirely — block it here rather than
      // relying on the operator to remember not to.
      const otherAdmins = await db.user.count({ where: { role: "ADMIN", id: { not: target.id } } });
      if (otherAdmins === 0) {
        return NextResponse.json(
          { error: "Cannot remove the last Admin's own Admin role" },
          { status: 400 }
        );
      }
    }

    const [updated] = await db.$transaction([
      db.user.update({
        where: { id: params.id },
        data: { role },
        select: { id: true, email: true, role: true, createdAt: true },
      }),
      auditEntry(req, currentUser, {
        action: "user.role_change",
        entityType: "User",
        entityId: target.id,
        summary: `Changed ${target.email} from ${target.role} to ${role}`,
        before: userSnapshot(target),
        after: { ...userSnapshot(target), role },
      }),
    ]);
    return NextResponse.json({ user: updated });
  })
);

export const DELETE = withApiErrorHandling(
  withRole<[RouteContext]>(["ADMIN"], async (_req, currentUser, { params: paramsPromise }) => {
    const params = await paramsPromise;
    if (params.id === currentUser.id) {
      return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 });
    }

    const target = await db.user.findUnique({ where: { id: params.id } });
    if (!target) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await db.$transaction([
      db.user.delete({ where: { id: params.id } }),
      auditEntry(_req, currentUser, {
        action: "user.delete",
        entityType: "User",
        entityId: target.id,
        summary: `Deleted ${target.role} account ${target.email}`,
        before: userSnapshot(target),
      }),
    ]);
    return NextResponse.json({ ok: true });
  })
);
