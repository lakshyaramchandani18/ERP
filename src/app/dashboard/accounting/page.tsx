import React from "react";
import Link from "next/link";
import { getFinancialSummaryByPeriod } from "@/actions/accounting";
import { Button } from "@/components/ui/button";
import { AccountingPinLock } from "./components/AccountingPinLock";
import { AccountingPeriodClient } from "./components/AccountingPeriodClient";

export const dynamic = "force-dynamic";

export default async function AccountingDashboardPage() {
  const result = await getFinancialSummaryByPeriod("MONTHLY", "2026-07");
  const initialData = result.success ? result.data : null;

  return (
    <div className="p-8 pt-6 space-y-6">
      <AccountingPinLock>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              Financial & Accounting Hub
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Monthly, Quarterly & Yearly ERP performance analytics & financial statements
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Link href="/dashboard/accounting/pnl">
              <Button variant="outline" size="sm" className="text-xs">
                Profit & Loss
              </Button>
            </Link>
            <Link href="/dashboard/accounting/balance-sheet">
              <Button variant="outline" size="sm" className="text-xs">
                Balance Sheet
              </Button>
            </Link>
            <Link href="/dashboard/accounting/gst">
              <Button variant="outline" size="sm" className="text-xs">
                GST Report
              </Button>
            </Link>
            <Link href="/dashboard/accounting/ledger">
              <Button variant="outline" size="sm" className="text-xs">
                General Ledger
              </Button>
            </Link>
          </div>
        </div>

        {initialData ? (
          <AccountingPeriodClient initialData={initialData} />
        ) : (
          <div className="text-red-500 font-semibold p-8 text-center bg-red-50 rounded-2xl">
            Failed to load financial records. Please check database connection.
          </div>
        )}
      </AccountingPinLock>
    </div>
  );
}
