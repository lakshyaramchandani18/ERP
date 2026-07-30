"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  IndianRupee,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Package,
  Activity,
  DollarSign,
  Calendar,
  Download,
  FileSpreadsheet,
  FileText,
  Building2,
  Lock,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Sparkles,
  PieChart as PieIcon,
  BarChart3,
  LineChart as LineIcon,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { getFinancialSummaryByPeriod } from "@/actions/accounting";

const CHART_COLORS = [
  "#2563eb",
  "#10b981",
  "#f59e0b",
  "#ec4899",
  "#8b5cf6",
  "#06b6d4",
  "#f97316",
];

export function AccountingPeriodClient({ initialData }: { initialData: any }) {
  const [data, setData] = useState(initialData);
  const [periodType, setPeriodType] = useState<"MONTHLY" | "QUARTERLY" | "YEARLY">("MONTHLY");
  const [targetKey, setTargetKey] = useState("2026-07");
  const [loading, setLoading] = useState(false);

  const formatCurrency = (val: number) =>
    `₹${val.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  const handlePeriodChange = async (type: "MONTHLY" | "QUARTERLY" | "YEARLY", key: string) => {
    setPeriodType(type);
    setTargetKey(key);
    setLoading(true);
    const res = await getFinancialSummaryByPeriod(type, key);
    if (res.success && res.data) {
      setData(res.data);
    }
    setLoading(false);
  };

  const kpis = data.kpis;

  // Render KPI Card with Comparative Period Indicator
  const renderKpiCard = (
    title: string,
    keyObj: any,
    icon: any,
    iconBg: string,
    isCurrency = true,
    subtext = ""
  ) => {
    const Icon = icon;
    const isUp = keyObj.trend === "UP";
    const isDown = keyObj.trend === "DOWN";
    const isGood = keyObj.isPositive;

    return (
      <div className="bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 line-clamp-1">
            {title}
          </span>
          <div className={`h-9 w-9 ${iconBg} rounded-xl flex items-center justify-center`}>
            <Icon className="h-4 w-4" />
          </div>
        </div>

        <div className="mt-3">
          <div className="text-2xl font-black tracking-tight text-gray-900 dark:text-gray-100">
            {isCurrency ? formatCurrency(keyObj.currentVal) : `${keyObj.currentVal.toFixed(2)}%`}
          </div>

          {/* Comparative Badge */}
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100 dark:border-gray-800/80 text-xs">
            <div className="flex items-center space-x-1">
              <span
                className={`inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                  isGood
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                    : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                }`}
              >
                {isUp ? (
                  <ArrowUpRight className="h-3 w-3 mr-0.5" />
                ) : isDown ? (
                  <ArrowDownRight className="h-3 w-3 mr-0.5" />
                ) : (
                  <Minus className="h-3 w-3 mr-0.5" />
                )}
                {keyObj.percentChange > 0 ? `+${keyObj.percentChange}%` : `${keyObj.percentChange}%`}
              </span>
            </div>

            <span className="text-[10px] text-muted-foreground truncate" title={`Vs ${data.prevPeriodLabel}`}>
              Prev: {isCurrency ? formatCurrency(keyObj.prevVal) : `${keyObj.prevVal.toFixed(1)}%`}
            </span>
          </div>
        </div>
      </div>
    );
  };

  // Export handlers
  const handleExportCSV = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      `Financial Report for ${data.periodLabel}\n` +
      `KPI,Current Value,Previous Value (${data.prevPeriodLabel}),Change (%)\n` +
      Object.entries(kpis)
        .map(([key, val]: [string, any]) => `${key},${val.currentVal},${val.prevVal},${val.percentChange}%`)
        .join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Financial_Report_${data.periodLabel.replace(/\s+/g, "_")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Period Selection Controls Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 shadow-xl border border-gray-800 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-2 bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md border border-blue-400/30">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Monthly • Quarterly • Yearly ERP Accounting</span>
          </div>
          <h2 className="text-2xl font-bold">Business Financial Performance</h2>
          <p className="text-xs text-slate-300">
            Viewing performance for <strong className="text-white">{data.periodLabel}</strong> (compared against {data.prevPeriodLabel})
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-3 bg-white/10 backdrop-blur-md p-2 rounded-xl border border-white/15">
          {/* Period Type Toggle */}
          <div className="flex bg-black/40 p-1 rounded-lg">
            <button
              onClick={() => {
                const key = periodType === "MONTHLY" ? "2026-07" : "2026-07";
                handlePeriodChange("MONTHLY", "2026-07");
              }}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                periodType === "MONTHLY"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => handlePeriodChange("QUARTERLY", "Q3-2026")}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                periodType === "QUARTERLY"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              Quarterly
            </button>
            <button
              onClick={() => handlePeriodChange("YEARLY", "2026")}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                periodType === "YEARLY"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              Yearly
            </button>
          </div>

          {/* Specific Selector */}
          {periodType === "MONTHLY" && (
            <Select value={targetKey} onValueChange={(val) => handlePeriodChange("MONTHLY", val || "2026-07")}>
              <SelectTrigger className="w-[140px] bg-slate-900/90 border-slate-700 text-xs text-white">
                <SelectValue placeholder="Select Month" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2026-07">July 2026</SelectItem>
                <SelectItem value="2026-06">June 2026</SelectItem>
                <SelectItem value="2026-05">May 2026</SelectItem>
                <SelectItem value="2026-04">April 2026</SelectItem>
                <SelectItem value="2026-03">March 2026</SelectItem>
              </SelectContent>
            </Select>
          )}

          {periodType === "QUARTERLY" && (
            <Select value={targetKey} onValueChange={(val) => handlePeriodChange("QUARTERLY", val || "Q3-2026")}>
              <SelectTrigger className="w-[140px] bg-slate-900/90 border-slate-700 text-xs text-white">
                <SelectValue placeholder="Select Quarter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Q3-2026">Q3 2026</SelectItem>
                <SelectItem value="Q2-2026">Q2 2026</SelectItem>
                <SelectItem value="Q1-2026">Q1 2026</SelectItem>
                <SelectItem value="Q4-2025">Q4 2025</SelectItem>
              </SelectContent>
            </Select>
          )}

          {periodType === "YEARLY" && (
            <Select value={targetKey} onValueChange={(val) => handlePeriodChange("YEARLY", val || "2026")}>
              <SelectTrigger className="w-[120px] bg-slate-900/90 border-slate-700 text-xs text-white">
                <SelectValue placeholder="Select Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2026">Year 2026</SelectItem>
                <SelectItem value="2025">Year 2025</SelectItem>
                <SelectItem value="2024">Year 2024</SelectItem>
              </SelectContent>
            </Select>
          )}

          {/* Export Controls */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="border-slate-700 text-xs bg-slate-800 text-white hover:bg-slate-700"
          >
            <FileSpreadsheet className="mr-1.5 h-3.5 w-3.5 text-emerald-400" /> Export CSV
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 flex items-center space-x-2">
            <Activity className="h-4 w-4 text-blue-600" />
            <span>Retail Financial Metrics ({data.periodLabel})</span>
          </h3>
          <span className="text-xs text-muted-foreground">
            Auto-compared against {data.prevPeriodLabel}
          </span>
        </div>

        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {renderKpiCard("Total Revenue", kpis.totalRevenue, IndianRupee, "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400")}
          {renderKpiCard("Net Sales", kpis.netSales, TrendingUp, "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400")}
          {renderKpiCard("Gross Profit", kpis.grossProfit, TrendingUp, "bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400")}
          {renderKpiCard("Net Profit", kpis.netProfit, PiggyBank, "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400")}
          {renderKpiCard("Inventory Value", kpis.inventoryValue, Package, "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400")}
          
          {renderKpiCard("Operating Expenses", kpis.operatingExpenses, TrendingDown, "bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400")}
          {renderKpiCard("Cash Flow", kpis.cashFlow, Activity, "bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400")}
          
          {renderKpiCard("Customer Udhaar", kpis.customerUdhaar, DollarSign, "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400")}
          {renderKpiCard("Supplier Payables", kpis.supplierOutstanding, Building2, "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400")}
        </div>
      </div>

      {/* BI Analytics & Interactive Charts Section */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Revenue vs Expenses vs Net Profit Trend Chart */}
        <Card className="border-gray-200 dark:border-gray-800 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base font-bold flex items-center space-x-2">
                <LineIcon className="h-4 w-4 text-blue-600" />
                <span>Revenue, Expenses & Profit Trend</span>
              </CardTitle>
              <p className="text-xs text-muted-foreground">Overall profitability trajectory</p>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.trendDatasets} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.15} />
                  <XAxis dataKey="label" stroke="#888888" fontSize={11} />
                  <YAxis stroke="#888888" fontSize={11} tickFormatter={(val) => `₹${val / 1000}k`} />
                  <Tooltip formatter={(val: any) => [`₹${Number(val).toLocaleString()}`, ""]} />
                  <Legend verticalAlign="top" height={36} />
                  <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#2563eb" fill="url(#colorRev)" />
                  <Area type="monotone" dataKey="netProfit" name="Net Profit" stroke="#10b981" fill="url(#colorNet)" />
                  <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#f43f5e" fillOpacity={0.1} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Sales vs Purchases Comparison */}
        <Card className="border-gray-200 dark:border-gray-800 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base font-bold flex items-center space-x-2">
                <BarChart3 className="h-4 w-4 text-purple-600" />
                <span>Sales vs Purchases Breakdown</span>
              </CardTitle>
              <p className="text-xs text-muted-foreground">Inflow sales revenue vs inventory purchases</p>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.trendDatasets} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.15} />
                  <XAxis dataKey="label" stroke="#888888" fontSize={11} />
                  <YAxis stroke="#888888" fontSize={11} tickFormatter={(val) => `₹${val / 1000}k`} />
                  <Tooltip formatter={(val: any) => [`₹${Number(val).toLocaleString()}`, ""]} />
                  <Legend verticalAlign="top" height={36} />
                  <Bar dataKey="revenue" name="Sales Revenue" fill="#2563eb" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="purchases" name="Purchases Spent" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Category Expenses Breakdown Pie */}
        <Card className="border-gray-200 dark:border-gray-800 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold flex items-center space-x-2">
              <PieIcon className="h-4 w-4 text-emerald-600" />
              <span>Expense Category Distribution</span>
            </CardTitle>
            <p className="text-xs text-muted-foreground">Expense breakdown for {data.periodLabel}</p>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-[260px] w-full flex items-center justify-center">
              {data.categoryBreakdown?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.categoryBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {data.categoryBreakdown.map((_: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(val: any) => [`₹${Number(val).toLocaleString()}`, "Expense"]} />
                    <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: "11px" }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-xs text-muted-foreground">No expenses recorded for this period</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Selling Products & Categories */}
        <Card className="border-gray-200 dark:border-gray-800 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold flex items-center space-x-2">
              <Sparkles className="h-4 w-4 text-amber-500" />
              <span>Top Revenue Drivers ({data.periodLabel})</span>
            </CardTitle>
            <p className="text-xs text-muted-foreground">Best performing products by gross revenue</p>
          </CardHeader>
          <CardContent className="pt-2 space-y-3">
            {data.topSellingProducts?.map((item: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-xs">
                <div className="flex items-center space-x-3">
                  <div className="h-7 w-7 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 flex items-center justify-center font-extrabold text-xs">
                    #{idx + 1}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-gray-100">{item.name}</h4>
                    <p className="text-[10px] text-muted-foreground">{item.qty} units sold</p>
                  </div>
                </div>
                <div className="font-extrabold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(item.revenue)}
                </div>
              </div>
            ))}
            {(!data.topSellingProducts || data.topSellingProducts.length === 0) && (
              <div className="text-center py-10 text-xs text-muted-foreground">
                No product sales logged in this period.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function PercentIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="19" x2="5" y1="5" y2="19" />
      <circle cx="6.5" cy="6.5" r="2.5" />
      <circle cx="17.5" cy="17.5" r="2.5" />
    </svg>
  );
}
