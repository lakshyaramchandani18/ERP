import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getFinancialSummary } from "@/actions/accounting";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Printer } from "lucide-react";

export default async function PnLStatementPage() {
  const result = await getFinancialSummary();
  const data = result.success ? result.data : null;

  if (!data) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Profit & Loss Statement</h1>
        <div className="text-red-500">Failed to load financial summary data.</div>
      </div>
    );
  }

  const formatCurrency = (val: number) => `₹${val.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

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
            <h1 className="text-3xl font-bold tracking-tight">Profit & Loss Statement</h1>
            <p className="text-muted-foreground">For the current accounting period</p>
          </div>
        </div>
        <Button variant="secondary" className="gap-2">
          <Printer className="h-4 w-4" /> Print Report
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Income Statement</CardTitle>
          <CardDescription>A comprehensive view of your revenues and expenses</CardDescription>
        </CardHeader>
        <CardContent>
          <Table className="border rounded-md">
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold text-foreground">Particulars</TableHead>
                <TableHead className="text-right font-semibold text-foreground">Amount (₹)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* REVENUE */}
              <TableRow>
                <TableCell className="font-semibold">Revenue from Sales</TableCell>
                <TableCell className="text-right">{formatCurrency(data.totalRevenue)}</TableCell>
              </TableRow>
              
              <TableRow>
                <TableCell className="pl-8 text-muted-foreground">Less: Cost of Goods Sold (COGS)</TableCell>
                <TableCell className="text-right text-muted-foreground">({formatCurrency(data.totalCogs)})</TableCell>
              </TableRow>
              
              <TableRow className="bg-muted/20">
                <TableCell className="font-bold">Gross Profit</TableCell>
                <TableCell className="text-right font-bold text-blue-600">{formatCurrency(data.grossProfit)}</TableCell>
              </TableRow>

              {/* EXPENSES */}
              <TableRow>
                <TableCell className="font-semibold pt-6">Operating Expenses</TableCell>
                <TableCell className="text-right"></TableCell>
              </TableRow>
              
              <TableRow>
                <TableCell className="pl-8 text-muted-foreground">Total Business Expenses</TableCell>
                <TableCell className="text-right text-muted-foreground">({formatCurrency(data.operatingExpenses)})</TableCell>
              </TableRow>
              
              {/* NET PROFIT */}
              <TableRow className="bg-emerald-50 dark:bg-emerald-950/20">
                <TableCell className="font-bold text-lg pt-6 pb-6">Net Profit</TableCell>
                <TableCell className="text-right font-bold text-lg text-emerald-600 pt-6 pb-6">
                  {formatCurrency(data.netProfit)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
          
          <div className="mt-6 flex justify-end gap-8 text-sm">
            <div className="text-right">
              <p className="text-muted-foreground">Gross Profit Margin</p>
              <p className="font-semibold">{data.grossProfitMargin.toFixed(2)}%</p>
            </div>
            <div className="text-right">
              <p className="text-muted-foreground">Net Profit Margin</p>
              <p className="font-semibold text-emerald-600">{data.netProfitMargin.toFixed(2)}%</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
