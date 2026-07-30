"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Landmark,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  Sparkles,
  Calculator,
  Percent,
  Calendar,
  Zap,
  Lock,
} from "lucide-react";
import { createLoan, deleteLoan } from "@/actions/expenses";

export default function LoansClient({ initialLoans }: { initialLoans: any[] }) {
  const [loans, setLoans] = useState(initialLoans);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState<{
    name: string;
    amount: string;
    interestRate: string;
    durationMonths: string;
    startDate: string;
    dueDate: string;
    expenseType: "BUSINESS" | "PERSONAL";
    paymentMethod: string;
    notes: string;
  }>({
    name: "",
    amount: "500000",
    interestRate: "12",
    durationMonths: "60",
    startDate: new Date().toISOString().split("T")[0],
    dueDate: "1",
    expenseType: "BUSINESS",
    paymentMethod: "BANK",
    notes: "",
  });

  const [calc, setCalc] = useState({
    emi: 0,
    totalInterest: 0,
    totalPayable: 0,
  });

  // Auto-calculate EMI, Total Interest, and Total Payable in real time
  useEffect(() => {
    const P = parseFloat(form.amount) || 0;
    const R = parseFloat(form.interestRate) || 0;
    const N = parseInt(form.durationMonths) || 0;

    if (P > 0 && N > 0) {
      if (R === 0) {
        const emiVal = P / N;
        setCalc({
          emi: Math.round(emiVal * 100) / 100,
          totalInterest: 0,
          totalPayable: P,
        });
      } else {
        const r = R / (12 * 100);
        const emiVal = (P * r * Math.pow(1 + r, N)) / (Math.pow(1 + r, N) - 1);
        const totalInterestVal = emiVal * N - P;
        setCalc({
          emi: Math.round(emiVal * 100) / 100,
          totalInterest: Math.round(totalInterestVal * 100) / 100,
          totalPayable: Math.round((P + totalInterestVal) * 100) / 100,
        });
      }
    } else {
      setCalc({ emi: 0, totalInterest: 0, totalPayable: 0 });
    }
  }, [form.amount, form.interestRate, form.durationMonths]);

  const formatCurrency = (val: number) =>
    `₹${val.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  const handleCreateLoan = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await createLoan(form);
    if (res.success) {
      setLoans([{ ...res.loan, emis: [] }, ...loans]);
      setOpen(false);
      setForm({
        name: "",
        amount: "500000",
        interestRate: "12",
        durationMonths: "60",
        startDate: new Date().toISOString().split("T")[0],
        dueDate: "1",
        expenseType: "BUSINESS",
        paymentMethod: "BANK",
        notes: "",
      });
    } else {
      alert(res.error || "Failed to create loan");
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this loan and its EMI schedule?")) return;
    const res = await deleteLoan(id);
    if (res.success) {
      setLoans(loans.filter((l) => l.id !== id));
    } else {
      alert(res.error);
    }
  };

  const totalActiveLoansAmount = loans
    .filter((l) => l.status === "ACTIVE")
    .reduce((sum, l) => sum + l.amount, 0);

  const totalActiveLoansRemaining = loans
    .filter((l) => l.status === "ACTIVE")
    .reduce((sum, l) => sum + l.remainingBalance, 0);

  const totalMonthlyEmiCommitment = loans
    .filter((l) => l.status === "ACTIVE")
    .reduce((sum, l) => sum + l.emiAmount, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner & EMI Summary */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white rounded-2xl p-6 shadow-xl border border-blue-800/40 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 bg-blue-500/20 text-blue-200 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md border border-blue-400/30">
              <Landmark className="h-3.5 w-3.5" />
              <span>Automated Loan & EMI Fixed Expense Engine</span>
            </div>
            <h2 className="text-2xl font-bold">Loan Manager & Interest Calculator</h2>
            <p className="text-sm text-blue-200/80 max-w-2xl">
              Track business & personal loans. Every EMI is automatically converted into a recurring fixed expense and logged into your accounting on the selected due date every month until loan completion.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-xl p-3.5 text-center min-w-[130px]">
              <div className="text-[11px] font-medium text-blue-200 uppercase tracking-wider">
                Total Loans Principal
              </div>
              <div className="text-xl font-black text-white mt-0.5">
                {formatCurrency(totalActiveLoansAmount)}
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-xl p-3.5 text-center min-w-[130px]">
              <div className="text-[11px] font-medium text-blue-200 uppercase tracking-wider">
                Remaining Balance
              </div>
              <div className="text-xl font-black text-blue-300 mt-0.5">
                {formatCurrency(totalActiveLoansRemaining)}
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-xl p-3.5 text-center col-span-2 sm:col-span-1 min-w-[130px]">
              <div className="text-[11px] font-medium text-blue-200 uppercase tracking-wider">
                Monthly EMI Total
              </div>
              <div className="text-xl font-black text-emerald-400 mt-0.5">
                {formatCurrency(totalMonthlyEmiCommitment)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            Active & Closed Loans ({loans.length})
          </h3>
          <p className="text-xs text-muted-foreground">
            Automatic monthly EMI fixed expense generation
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20">
              <Plus className="mr-2 h-4 w-4" /> Add New Loan
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2 text-blue-600 dark:text-blue-400">
                <Calculator className="h-5 w-5" />
                <span>Loan Calculator & Auto-EMI Generator</span>
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleCreateLoan} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Loan Name / Purpose <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="e.g., Shop Expansion Loan, Vehicle Loan, Equipment Finance"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Loan Amount (₹) <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="number"
                    step="1000"
                    placeholder="e.g. 500000"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Interest Rate (% p.a.) <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 12"
                    value={form.interestRate}
                    onChange={(e) => setForm({ ...form, interestRate: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Duration (Months) <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="number"
                    placeholder="e.g. 60"
                    value={form.durationMonths}
                    onChange={(e) => setForm({ ...form, durationMonths: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Automatic Calculation Preview Box */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 border border-blue-200 dark:border-gray-700 rounded-xl p-4 grid grid-cols-3 gap-3 text-center">
                <div>
                  <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Calculated Monthly EMI
                  </span>
                  <div className="text-xl font-black text-blue-600 dark:text-blue-400 mt-1">
                    {formatCurrency(calc.emi)}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Total Interest
                  </span>
                  <div className="text-xl font-black text-amber-600 dark:text-amber-400 mt-1">
                    {formatCurrency(calc.totalInterest)}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Total Amount Payable
                  </span>
                  <div className="text-xl font-black text-gray-900 dark:text-gray-100 mt-1">
                    {formatCurrency(calc.totalPayable)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    EMI Date of Month <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={form.dueDate}
                    onValueChange={(val) => setForm({ ...form, dueDate: val || "1" })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="EMI Day" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                        <SelectItem key={day} value={String(day)}>
                          {day}
                          {day === 1 ? "st" : day === 2 ? "nd" : day === 3 ? "rd" : "th"} of every month
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Expense Type
                  </label>
                  <Select
                    value={form.expenseType}
                    onValueChange={(val: any) => setForm({ ...form, expenseType: (val as "BUSINESS" | "PERSONAL") || "BUSINESS" })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Expense Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BUSINESS">Business Loan</SelectItem>
                      <SelectItem value="PERSONAL">Personal Loan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Start Date
                  </label>
                  <Input
                    type="date"
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Payment Method
                </label>
                <Select
                  value={form.paymentMethod}
                  onValueChange={(val) => setForm({ ...form, paymentMethod: val || "BANK" })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Payment Method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BANK">Bank Auto-debit / Transfer</SelectItem>
                    <SelectItem value="UPI">UPI</SelectItem>
                    <SelectItem value="CASH">Cash</SelectItem>
                    <SelectItem value="CREDIT_CARD">Credit Card</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl p-3 text-xs text-blue-800 dark:text-blue-300 flex items-start space-x-2">
                <Zap className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Zero Manual Action:</strong> On the {form.dueDate}th of every month, {formatCurrency(calc.emi)} will be automatically added to the Expense Tracker and Accounting module for {form.durationMonths || 0} months without needing any approval or confirmation.
                </span>
              </div>

              <Button
                type="submit"
                disabled={loading || !form.name || calc.emi <= 0}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                {loading ? "Creating Loan..." : "Save Loan & Activate Auto-EMI"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Loans Grid */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {loans.map((loan) => {
          const paidEmisCount = loan.emis?.length || 0;
          const totalEmis = loan.durationMonths;
          const progressPercent = Math.min(100, Math.round((paidEmisCount / totalEmis) * 100));

          return (
            <Card
              key={loan.id}
              className={`relative overflow-hidden border transition-all duration-200 hover:shadow-lg ${
                loan.status === "CLOSED"
                  ? "border-emerald-200 dark:border-emerald-800/50 bg-emerald-50/20 dark:bg-emerald-950/10"
                  : "border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950"
              }`}
            >
              <div
                className={`h-1.5 w-full ${
                  loan.status === "CLOSED" ? "bg-emerald-500" : "bg-blue-600"
                }`}
              />

              <CardHeader className="pb-3 pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Landmark
                      className={`h-5 w-5 ${
                        loan.status === "CLOSED"
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-blue-600 dark:text-blue-400"
                      }`}
                    />
                    <CardTitle className="text-base font-bold text-gray-900 dark:text-gray-100 line-clamp-1">
                      {loan.name}
                    </CardTitle>
                  </div>
                  <span
                    className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider ${
                      loan.status === "CLOSED"
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border border-emerald-200"
                        : "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-200"
                    }`}
                  >
                    {loan.status === "CLOSED" && <CheckCircle2 className="h-3 w-3 mr-0.5" />}
                    <span>{loan.status}</span>
                  </span>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Metrics Breakdown */}
                <div className="bg-gray-50 dark:bg-gray-900/70 rounded-xl p-3 space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Principal Loan Amount:</span>
                    <span className="font-bold text-gray-900 dark:text-gray-100">
                      {formatCurrency(loan.amount)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Interest Rate & Duration:</span>
                    <span className="font-semibold text-gray-700 dark:text-gray-300">
                      {loan.interestRate}% ({loan.durationMonths} M)
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Monthly Automated EMI:</span>
                    <span className="font-extrabold text-blue-600 dark:text-blue-400 text-sm">
                      {formatCurrency(loan.emiAmount)} / month
                    </span>
                  </div>

                  <div className="flex justify-between items-center pt-1 border-t border-gray-200 dark:border-gray-800">
                    <span className="text-muted-foreground">Remaining Balance:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(loan.remainingBalance)}
                    </span>
                  </div>
                </div>

                {/* Auto Schedule Indicator */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-1.5 text-purple-700 dark:text-purple-300 font-semibold bg-purple-50 dark:bg-purple-950/60 px-2.5 py-1 rounded-lg border border-purple-200 dark:border-purple-800">
                    <Clock className="h-3.5 w-3.5" />
                    <span>Auto-debited on {loan.dueDate}th</span>
                  </div>
                  <span
                    className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                      loan.expenseType === "BUSINESS"
                        ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
                        : "bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
                    }`}
                  >
                    {loan.expenseType}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-gray-600 dark:text-gray-400">
                      EMI Progress ({paidEmisCount} of {totalEmis} paid)
                    </span>
                    <span className="font-bold text-gray-900 dark:text-gray-100">
                      {progressPercent}%
                    </span>
                  </div>
                  <Progress value={progressPercent} className="h-2" />
                </div>

                {/* Delete button */}
                <div className="pt-2 flex justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(loan.id)}
                    className="text-xs text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete Loan
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {loans.length === 0 && (
          <div className="col-span-full text-center py-16 text-muted-foreground border border-dashed rounded-2xl">
            <div className="flex flex-col items-center justify-center space-y-3">
              <Landmark className="h-12 w-12 text-blue-500 opacity-50" />
              <p className="font-bold text-base text-gray-800 dark:text-gray-200">
                No active loans tracked yet
              </p>
              <p className="text-xs text-muted-foreground max-w-sm">
                Click "Add New Loan" to calculate EMIs and enable zero-click monthly automated expense entries.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
