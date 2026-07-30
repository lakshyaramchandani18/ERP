"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  ShoppingBag,
  TrendingUp,
  Package,
  Users,
  Building2,
  Receipt,
  DollarSign,
  AlertTriangle,
  ArrowRight,
  Bell,
  Sparkles,
  Layers,
  BarChart3,
  Calendar,
  CheckCircle2,
  PieChart as PieIcon,
  CreditCard,
  TrendingDown,
  Percent,
  Wallet,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#14b8a6", "#ec4899"];

export default function DashboardClient({ data }: { data: any }) {
  const router = useRouter();

  if (!data) {
    return (
      <div className="p-8 text-center text-red-500 font-semibold bg-red-50 rounded-2xl m-6">
        Failed to load dashboard metrics. Please refresh the page.
      </div>
    );
  }

  const {
    sales = {},
    profit = {},
    inventory = {},
    customers = {},
    suppliers = {},
    receivables = {},
    expenses = {},
    notifications = [],
    charts = {},
  } = data;

  const formatCurrency = (val: number) =>
    `₹${(val || 0).toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  return (
    <div className="space-y-8 p-8 pt-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 shadow-2xl border border-gray-800 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center space-x-2 bg-blue-500/20 text-blue-300 px-3.5 py-1 rounded-full text-xs font-semibold border border-blue-400/30 mb-2.5">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Vijay Collection Production ERP</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">ERP Executive Dashboard</h1>
          <p className="text-xs text-slate-300 mt-1">
            Real-time analytics across Sales, Profitability, Inventory, CRM, Suppliers, Receivables & Expenses
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link href="/dashboard/sales/pos">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs h-10 px-5 shadow-lg shadow-blue-500/25 rounded-xl">
              <ShoppingBag className="mr-1.5 h-4 w-4" /> POS Billing
            </Button>
          </Link>
          <Link href="/dashboard/suppliers">
            <Button variant="outline" className="border-slate-700 hover:bg-slate-800 text-white font-bold text-xs h-10 px-4 rounded-xl">
              <Building2 className="mr-1.5 h-4 w-4 text-amber-400" /> Supplier Hub
            </Button>
          </Link>
          <Link href="/dashboard/accounting">
            <Button variant="outline" className="border-slate-700 hover:bg-slate-800 text-white font-bold text-xs h-10 px-4 rounded-xl">
              <TrendingUp className="mr-1.5 h-4 w-4 text-emerald-400" /> Accounting
            </Button>
          </Link>
        </div>
      </div>

      {/* SECTION 10: ACTIONABLE NOTIFICATIONS PANEL */}
      {notifications && notifications.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm font-extrabold text-gray-900 dark:text-gray-100">
              <Bell className="h-4 w-4 text-amber-500 animate-bounce" />
              <span>Actionable Notifications ({notifications.length})</span>
            </div>
            <span className="text-xs text-muted-foreground">Click notification to open module</span>
          </div>

          <div className="grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {notifications.map((n: any) => (
              <div
                key={n.id}
                onClick={() => router.push(n.link)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all hover:scale-[1.02] shadow-sm flex items-start justify-between group ${
                  n.severity === "high"
                    ? "bg-rose-50/90 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200"
                    : n.severity === "medium"
                    ? "bg-amber-50/90 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200"
                    : "bg-blue-50/90 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200"
                }`}
              >
                <div className="space-y-1">
                  <div className="font-extrabold text-xs flex items-center space-x-1.5">
                    <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
                    <span>{n.title}</span>
                  </div>
                  <p className="text-[11px] opacity-90 leading-tight">{n.message}</p>
                </div>
                <ArrowRight className="h-4 w-4 ml-2 flex-shrink-0 opacity-60 group-hover:translate-x-1 group-hover:opacity-100 transition-all" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 8: DASHBOARD KPI SECTIONS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* 1. Sales KPIs */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 font-semibold mb-2">
            <ShoppingBag className="h-4 w-4" />
            <h3 className="text-sm">Sales Overview</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-end">
              <span className="text-xs text-gray-500 font-medium">Today</span>
              <span className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(sales.todaySalesAmount)}</span>
            </div>
            <div className="flex justify-between items-end">
              <span className="text-xs text-gray-500 font-medium">This Month</span>
              <span className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(sales.monthlySalesAmount)}</span>
            </div>
            <div className="flex justify-between items-end">
              <span className="text-xs text-gray-500 font-medium">This Year</span>
              <span className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(sales.yearlySalesAmount)}</span>
            </div>
          </div>
        </div>

        {/* 2. Profit & Expenses KPIs */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 font-semibold mb-2">
            <TrendingUp className="h-4 w-4" />
            <h3 className="text-sm">Profit & Expenses</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-end">
              <span className="text-xs text-gray-500 font-medium">Gross Profit</span>
              <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(profit.monthlyGrossProfit)}</span>
            </div>
            <div className="flex justify-between items-end">
              <span className="text-xs text-gray-500 font-medium">Net Profit</span>
              <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(profit.monthlyNetProfit)}</span>
            </div>
            <div className="flex justify-between items-end">
              <span className="text-xs text-gray-500 font-medium">Monthly Expenses</span>
              <span className="text-lg font-bold text-rose-600 dark:text-rose-400">{formatCurrency(expenses.monthlyExpensesAmount)}</span>
            </div>
          </div>
        </div>

        {/* 3. Inventory KPIs */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 text-purple-600 dark:text-purple-400 font-semibold mb-2">
            <Package className="h-4 w-4" />
            <h3 className="text-sm">Inventory Tracking</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-end">
              <span className="text-xs text-gray-500 font-medium">Inventory Value</span>
              <span className="text-lg font-bold text-purple-600 dark:text-purple-400">{formatCurrency(inventory.inventoryValue)}</span>
            </div>
            <div className="flex justify-between items-end">
              <span className="text-xs text-amber-600 font-medium">Low Stock</span>
              <span className="text-lg font-bold text-amber-600">{inventory.lowStockProducts || 0}</span>
            </div>
            <div className="flex justify-between items-end">
              <span className="text-xs text-rose-600 font-medium">Out of Stock</span>
              <span className="text-lg font-bold text-rose-600">{inventory.outOfStockProducts || 0}</span>
            </div>
          </div>
        </div>

        {/* 4. CRM & Finance KPIs */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 text-amber-600 dark:text-amber-400 font-semibold mb-2">
            <Users className="h-4 w-4" />
            <h3 className="text-sm">CRM & Suppliers</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-end">
              <span className="text-xs text-gray-500 font-medium">Customers (Return)</span>
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                {customers.totalCustomers || 0} ({customers.repeatCustomerRate || 0}%)
              </span>
            </div>
            <div className="flex justify-between items-end">
              <span className="text-xs text-gray-500 font-medium">Supplier Payables</span>
              <span className="text-lg font-bold text-rose-600">{formatCurrency(suppliers.totalPayables)}</span>
            </div>
            <div className="flex justify-between items-end">
              <span className="text-xs text-gray-500 font-medium">Receivables (Udhaar)</span>
              <span className="text-lg font-bold text-blue-600">{formatCurrency(receivables.totalCustomerUdhaar)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 9: 4 INTERACTIVE DASHBOARD CHARTS */}
      <div className="space-y-6 pt-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center space-x-2">
          <BarChart3 className="h-5 w-5 text-blue-600" />
          <span>Business Analytics</span>
        </h2>

        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
          {/* Chart 1: Daily Sales Trend */}
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Daily Sales Trend (Last 7 Days)</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={charts.dailySales}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Area type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" name="Daily Revenue (₹)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Revenue vs Expenses */}
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Revenue vs Expenses</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={charts.revenueVsExpensesTrend}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />
                  <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" name="Revenue (₹)" />
                  <Area type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorExp)" name="Expenses (₹)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 3: Inventory Value Breakdown */}
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Inventory Value Breakdown</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.inventoryValueTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                  <XAxis dataKey="category" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="value" fill="#8b5cf6" radius={[6, 6, 0, 0]} name="Valuation (₹)" barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 4: Monthly Expense Breakdown */}
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Expense Breakdown</h3>
            <div className="h-64">
              {charts.expenseCategoryBreakdown && charts.expenseCategoryBreakdown.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={charts.expenseCategoryBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} stroke="none">
                      {charts.expenseCategoryBreakdown.map((_: any, idx: number) => (
                        <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-gray-500">
                  No expenses logged yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
