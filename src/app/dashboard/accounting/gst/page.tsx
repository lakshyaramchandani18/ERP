export const dynamic = "force-dynamic";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getFinancialSummary } from "@/actions/accounting";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Download, Calculator } from "lucide-react";

export default async function GSTReportPage() {
  const result = await getFinancialSummary();
  const data = result.success ? result.data : null;

  if (!data) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">GST Report</h1>
        <div className="text-red-500">Failed to load financial summary data.</div>
      </div>
    );
  }

  const formatCurrency = (val: number) => `₹${val.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  // For illustrative purposes, we assume an average 5% GST on total revenue (apparel mostly has 5%).
  const estimatedGSTCollected = data.totalRevenue * 0.05;
  const taxableValue = data.totalRevenue - estimatedGSTCollected;

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
            <h1 className="text-3xl font-bold tracking-tight">GST Summary</h1>
            <p className="text-muted-foreground">Estimated Tax Report</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Calculator className="h-4 w-4" /> Recalculate
          </Button>
          <Button className="gap-2">
            <Download className="h-4 w-4" /> Export CSV
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Sales GST Overview</CardTitle>
            <CardDescription>Estimated GSTR-1 Data based on collected revenue</CardDescription>
          </CardHeader>
          <CardContent>
            <Table className="border rounded-md">
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold text-foreground">Description</TableHead>
                  <TableHead className="text-right font-semibold text-foreground">Rate</TableHead>
                  <TableHead className="text-right font-semibold text-foreground">Taxable Value (₹)</TableHead>
                  <TableHead className="text-right font-semibold text-foreground">CGST (₹)</TableHead>
                  <TableHead className="text-right font-semibold text-foreground">SGST (₹)</TableHead>
                  <TableHead className="text-right font-semibold text-foreground">Total Tax (₹)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Retail Sales (Apparel)</TableCell>
                  <TableCell className="text-right">5%</TableCell>
                  <TableCell className="text-right">{formatCurrency(taxableValue)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(estimatedGSTCollected / 2)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(estimatedGSTCollected / 2)}</TableCell>
                  <TableCell className="text-right font-semibold text-amber-600">{formatCurrency(estimatedGSTCollected)}</TableCell>
                </TableRow>
                
                <TableRow className="bg-muted/20">
                  <TableCell colSpan={2} className="font-bold text-right">Total</TableCell>
                  <TableCell className="text-right font-bold">{formatCurrency(taxableValue)}</TableCell>
                  <TableCell className="text-right font-bold">{formatCurrency(estimatedGSTCollected / 2)}</TableCell>
                  <TableCell className="text-right font-bold">{formatCurrency(estimatedGSTCollected / 2)}</TableCell>
                  <TableCell className="text-right font-bold text-amber-600">{formatCurrency(estimatedGSTCollected)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
            
            <div className="mt-6 p-4 bg-muted/30 rounded-lg flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Estimated Output GST</h3>
                <p className="text-sm text-muted-foreground">Total tax collected from sales</p>
              </div>
              <div className="text-2xl font-bold text-amber-600">
                {formatCurrency(estimatedGSTCollected)}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
