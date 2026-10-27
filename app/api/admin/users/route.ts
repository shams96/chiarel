import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { withRole } from "@/lib/auth";
import { auditEntry, userSnapshot } from "@/lib/audit";
import { withApiErrorHandling } from "@/lib/api-error";

const ROLES = ["ADMIN", "MEMBER", "VIEWER"] as const;

export const GET = withApiErrorHandling(
  withRole(["ADMIN"], async () => {
    const users = await db.user.findMany({
      select: { id: true, email: true, role: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json({ users });
  })
);

export const POST = withApiErrorHandling(
  withRole(["ADMIN"], async (req: NextRequest, actor) => {
    const body = await req.json().catch(() => null);
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body?.password === "string" ? body.password : "";
    const role = body?.role;

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }
    if (!ROLES.includes(role)) {
      return NextResponse.json(
        { error: `Role must be one of: ${ROLES.join(", ")}` },
        { status: 400 }
      );
    }
    if (password.length < 12) {
      return NextResponse.json(
        { error: "Password must be at least 12 characters" },
        { status: 400 }
      );
    }

    // bcrypt only reads the first 72 bytes; refuse longer rather than truncate silently.
    if (Buffer.byteLength(password) > 72) {
      return NextResponse.json({ error: "Password must be at most 72 bytes" }, { status: 400 });
    }

    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "A user with this email already exists" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await db.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: { email, passwordHash, role },
        select: { id: true, email: true, role: true, createdAt: true },
      });
      await auditEntry(
        req,
        { id: actor.id, email: actor.email },
        {
          action: "user.create",
          entityType: "User",
          entityId: created.id,
          summary: `Created ${created.role} account ${created.email}`,
          after: userSnapshot(created),
        },
        tx
      );
      return created;
    });

    return NextResponse.json({ user }, { status: 201 });
  })
);
