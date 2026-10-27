import { NextResponse } from "next/server";
import { withRole } from "@/lib/auth";
import { withApiErrorHandling } from "@/lib/api-error";
import { getDashboard } from "@/lib/admin-dashboard";

// Headline numbers for the admin landing page. Aggregates only, no personal
// data, so every signed-in role may read it.
export const GET = withApiErrorHandling(
  withRole(["ADMIN", "MEMBER", "VIEWER"], async () => {
    return NextResponse.json(await getDashboard());
  })
);
