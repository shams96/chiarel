import { NextResponse } from "next/server";
import { withRole } from "@/lib/auth";
import { withApiErrorHandling } from "@/lib/api-error";

// Who is signed in, for the admin shell to draw role-appropriate navigation.
// Navigation is a convenience; every route still enforces its own role.
export const GET = withApiErrorHandling(
  withRole(["ADMIN", "MEMBER", "VIEWER"], async (_req, user) => {
    return NextResponse.json({ email: user.email, role: user.role });
  })
);
