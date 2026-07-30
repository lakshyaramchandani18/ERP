import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getFinancialSummary } from "@/actions/accounting";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Printer } from "lucide-react";

export default async function BalanceSheetPage() {
  const result = await getFinancialSummary();
  const data = result.success ? result.data : null;

  if (!data) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Balance Sheet</h1>
        <div className="text-red-500">Failed to load financial summary data.</div>
      </div>
    );
  }

  const formatCurrency = (val: number) => `₹${val.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  // For this basic view, Total Assets = Inventory + Receivables (plus Cash/Bank if we had it)
  // Let's assume a basic Cash balance that equates assets and liabilities/equity for illustration if needed.
  // We'll just list what we have.
  const totalAssets = data.inventoryValue + data.accountsReceivable;
  const retainedEarnings = data.netProfit;

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/accounting">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Balance Sheet</h1>
            <p className="text-muted-foreground">As of current date</p>
          </div>
        </div>
        <Button variant="secondary" className="gap-2">
          <Printer className="h-4 w-4" /> Print Report
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* ASSETS */}
        <Card>
          <CardHeader>
            <CardTitle>Assets</CardTitle>
            <CardDescription>What the business owns</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Current Assets</TableHead>
                  <TableHead className="text-right">Amount (₹)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="pl-8 text-muted-foreground">Inventory Value</TableCell>
                  <TableCell className="text-right">{formatCurrency(data.inventoryValue)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="pl-8 text-muted-foreground">Accounts Receivable</TableCell>
                  <TableCell className="text-right">{formatCurrency(data.accountsReceivable)}</TableCell>
                </TableRow>
                <TableRow className="bg-muted/20">
                  <TableCell className="font-bold">Total Assets</TableCell>
                  <TableCell className="text-right font-bold text-emerald-600">{formatCurrency(totalAssets)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* LIABILITIES & EQUITY */}
        <Card>
          <CardHeader>
            <CardTitle>Liabilities & Equity</CardTitle>
            <CardDescription>What the business owes and owner's equity</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Equity</TableHead>
                  <TableHead className="text-right">Amount (₹)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="pl-8 text-muted-foreground">Retained Earnings (Net Profit)</TableCell>
                  <TableCell className="text-right">{formatCurrency(retainedEarnings)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="pl-8 text-muted-foreground">Other Equity/Capital</TableCell>
                  <TableCell className="text-right text-muted-foreground italic">Pending Sync</TableCell>
                </TableRow>
                <TableRow className="bg-muted/20">
                  <TableCell className="font-bold">Total Equity & Liabilities</TableCell>
                  <TableCell className="text-right font-bold text-blue-600">{formatCurrency(retainedEarnings)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
