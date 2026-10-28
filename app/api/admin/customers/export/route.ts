import { NextResponse } from "next/server";
import { withRole } from "@/lib/auth";
import { withApiErrorHandling } from "@/lib/api-error";
import { auditEntry } from "@/lib/audit";
import { EXPORT_HEADER, MAX_EXPORT, customerCsvRow, queryCustomers } from "@/lib/admin-customers";

// CSV of customers (Admin and Member). It is a list of people and what they
// spent, so the export is recorded in the audit log BEFORE the file is
// returned: no record, no file.
export const GET = withApiErrorHandling(
  withRole(["ADMIN", "MEMBER"], async (req, user) => {
    const rows = await queryCustomers({ sort: "last", offset: 0, take: MAX_EXPORT });

    await auditEntry(req, user, {
      action: "customers.export",
      entityType: "Customer",
      summary: `Exported ${rows.length} customer(s) to CSV`,
      after: { count: rows.length },
    });

    const csv = [EXPORT_HEADER, ...rows.map(customerCsvRow)].join("\r\n") + "\r\n";
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="customers-${new Date().toISOString().slice(0, 10)}.csv"`,
        "Cache-Control": "no-store",
      },
    });
  })
);
