import React from "react";
import Link from "next/link";
import { getExpenseDashboardSummary } from "@/actions/expenses";
import { ExpensesNav } from "./components/ExpensesNav";
import { ExpensesChart } from "./components/ExpensesChart";
import { CategoryPieChart } from "./components/CategoryPieChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DollarSign,
  Calendar,
  Wallet,
  TrendingDown,
  Building2,
  User,
  Lock,
  Zap,
  CalendarClock,
  Plus,
  ArrowRight,
  Receipt,
  Landmark,
  CalendarSync,
} from "lucide-react";

export default async function ExpensesDashboardPage() {
  const summary = await getExpenseDashboardSummary();

  const formatCurrency = (val: number) =>
    `₹${val.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      {/* Module Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Expense Management
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Automated tracking for business, personal, fixed expenses & loan EMIs
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Link href="/dashboard/expenses/fixed">
            <Button variant="outline" className="border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950">
              <CalendarSync className="mr-2 h-4 w-4" /> Fixed Expenses
            </Button>
          </Link>
          <Link href="/dashboard/expenses/loans">
            <Button variant="outline" className="border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950">
              <Landmark className="mr-2 h-4 w-4" /> Loan Manager
            </Button>
          </Link>
          <Link href="/dashboard/expenses/manual">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20">
              <Plus className="mr-2 h-4 w-4" /> Add Expense
            </Button>
          </Link>
        </div>
      </div>

      {/* Sub Navigation */}
      <ExpensesNav />

      {/* Top Summary Metric Cards Grid (8 Cards as requested) */}
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
        {/* Today's Expenses */}
        <div className="bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Today's Expenses
            </span>
            <div className="h-10 w-10 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-xl flex items-center justify-center">
              <Calendar className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-extrabold text-gray-900 dark:text-gray-100">
              {formatCurrency(summary.todayExpenses)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Logged today</p>
          </div>
        </div>

        {/* This Month's Expenses */}
        <div className="bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              This Month
            </span>
            <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center">
              <Wallet className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-extrabold text-gray-900 dark:text-gray-100">
              {formatCurrency(summary.thisMonthExpenses)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Current billing cycle</p>
          </div>
        </div>

        {/* This Year's Expenses */}
        <div className="bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              This Year
            </span>
            <div className="h-10 w-10 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-extrabold text-gray-900 dark:text-gray-100">
              {formatCurrency(summary.thisYearExpenses)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Cumulative year to date</p>
          </div>
        </div>

        {/* Total Business Expenses */}
        <div className="bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Business Expenses
            </span>
            <div className="h-10 w-10 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center">
              <Building2 className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">
              {formatCurrency(summary.totalBusinessExpenses)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Impacts P&L & Net Profit</p>
          </div>
        </div>

        {/* Total Personal Expenses */}
        <div className="bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Personal Expenses
            </span>
            <div className="h-10 w-10 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-xl flex items-center justify-center">
              <User className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-extrabold text-rose-600 dark:text-rose-400">
              {formatCurrency(summary.totalPersonalExpenses)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Tracked separately</p>
          </div>
        </div>

        {/* Fixed Expenses */}
        <div className="bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Fixed Expenses (Month)
            </span>
            <div className="h-10 w-10 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl flex items-center justify-center">
              <Lock className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-extrabold text-purple-600 dark:text-purple-400">
              {formatCurrency(summary.fixedExpensesTotal)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Rent, Salaries & EMIs</p>
          </div>
        </div>

        {/* Variable Expenses */}
        <div className="bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Variable Expenses
            </span>
            <div className="h-10 w-10 bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 rounded-xl flex items-center justify-center">
              <Zap className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-extrabold text-teal-600 dark:text-teal-400">
              {formatCurrency(summary.variableExpensesTotal)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Day-to-day operational spend</p>
          </div>
        </div>

        {/* Upcoming Fixed Expenses */}
        <div className="bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Upcoming Fixed (Month)
            </span>
            <div className="h-10 w-10 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 rounded-xl flex items-center justify-center">
              <CalendarClock className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-extrabold text-cyan-600 dark:text-cyan-400">
              {formatCurrency(summary.upcomingFixedTotal)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Due later this month</p>
          </div>
        </div>
      </div>

      {/* Analytics Section: Trend Chart + Category Breakdown */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-7">
        <Card className="lg:col-span-4 border-gray-200 dark:border-gray-800 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base font-bold">Expense Analytics & Trend</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Breakdown by business vs personal vs fixed expenses
              </p>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <ExpensesChart data={summary.trendData} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 border-gray-200 dark:border-gray-800 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base font-bold">Category-wise Breakdown</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Proportion of expenses across categories
              </p>
            </div>
            <Link href="/dashboard/expenses/categories">
              <Button variant="ghost" size="sm" className="text-xs text-blue-600 dark:text-blue-400">
                Manage <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="pt-2">
            <CategoryPieChart data={summary.categoryData} />
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Fixed Expenses & Recent Expenses */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Upcoming Fixed Expenses List */}
        <Card className="border-gray-200 dark:border-gray-800 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div className="flex items-center space-x-2">
              <CalendarClock className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
              <div>
                <CardTitle className="text-base font-bold">Automated Upcoming Fixed Expenses</CardTitle>
                <p className="text-xs text-muted-foreground">Will be auto-added on due date</p>
              </div>
            </div>
            <Link href="/dashboard/expenses/fixed">
              <Button variant="outline" size="sm" className="text-xs">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {summary.upcomingFixedList.slice(0, 5).map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:border-cyan-300 dark:hover:border-cyan-800 transition-all"
                >
                  <div className="flex items-center space-x-3">
                    <div className="h-9 w-9 rounded-lg bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 flex items-center justify-center font-bold text-xs">
                      {item.dueDate}th
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 line-clamp-1">
                        {item.name}
                      </h4>
                      <p className="text-xs text-muted-foreground">{item.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-cyan-600 dark:text-cyan-400">
                      {formatCurrency(item.amount)}
                    </div>
                    <span className="inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-50 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800">
                      Auto-due Day {item.dueDate}
                    </span>
                  </div>
                </div>
              ))}
              {summary.upcomingFixedList.length === 0 && (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  🎉 All fixed expenses for this month have been auto-generated!
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Expenses List */}
        <Card className="border-gray-200 dark:border-gray-800 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div className="flex items-center space-x-2">
              <Receipt className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <div>
                <CardTitle className="text-base font-bold">Recent Expenses</CardTitle>
                <p className="text-xs text-muted-foreground">Latest transactions logged in system</p>
              </div>
            </div>
            <Link href="/dashboard/expenses/manual">
              <Button variant="outline" size="sm" className="text-xs">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {summary.recentExpenses.map((expense) => (
                <div
                  key={expense.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-800 transition-all"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`h-9 w-9 rounded-lg flex items-center justify-center font-bold text-xs ${
                        expense.isFixed
                          ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
                          : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                      }`}
                    >
                      {expense.isFixed ? <Lock className="h-4 w-4" /> : <Receipt className="h-4 w-4" />}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 line-clamp-1">
                        {expense.title}
                      </h4>
                      <div className="flex items-center space-x-2 mt-0.5 text-xs text-muted-foreground">
                        <span>{expense.category?.name || "General"}</span>
                        <span>•</span>
                        <span>{new Date(expense.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-gray-900 dark:text-gray-100">
                      {formatCurrency(expense.amount)}
                    </div>
                    <span
                      className={`inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                        expense.expenseType === "BUSINESS"
                          ? "bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
                          : "bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
                      }`}
                    >
                      {expense.expenseType}
                    </span>
                  </div>
                </div>
              ))}
              {summary.recentExpenses.length === 0 && (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  No expenses recorded yet.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
