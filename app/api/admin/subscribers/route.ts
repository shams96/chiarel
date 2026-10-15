import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withRole } from "@/lib/auth";
import { withApiErrorHandling } from "@/lib/api-error";
import { csvCell } from "@/lib/subscribers";

// CSV export of the newsletter list (Admin only). Unsubscribed rows are
// included with their date so the suppression list travels with the export.
export const GET = withApiErrorHandling(
  withRole(["ADMIN"], async () => {
    const rows = await db.emailSubscriber.findMany({ orderBy: { createdAt: "asc" } });
    const lines = [
      "email,source,consent_at,consent_text_version,created_at,unsubscribed_at",
      ...rows.map((r) =>
        [
          r.email,
          r.source,
          r.consentAt.toISOString(),
          r.consentTextVersion,
          r.createdAt.toISOString(),
          r.unsubscribedAt?.toISOString() ?? "",
        ]
          .map(csvCell)
          .join(",")
      ),
    ];
    return new NextResponse(lines.join("\n") + "\n", {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="chiarel-subscribers.csv"',
        "Cache-Control": "no-store",
      },
    });
  })
);
