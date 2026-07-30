"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Plus,
  Trash2,
  Lock,
  CalendarSync,
  CheckCircle2,
  Clock,
  Sparkles,
  Zap,
} from "lucide-react";
import {
  createFixedExpenseTemplate,
  deleteFixedExpenseTemplate,
  toggleFixedExpenseTemplateStatus,
} from "@/actions/expenses";

export default function FixedExpensesClient({
  initialTemplates,
  categories,
}: {
  initialTemplates: any[];
  categories: any[];
}) {
  const [templates, setTemplates] = useState(initialTemplates);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<{
    name: string;
    amount: string;
    categoryId: string;
    expenseType: "BUSINESS" | "PERSONAL";
    paymentMethod: string;
    dayOfMonth: string;
    notes: string;
  }>({
    name: "",
    amount: "",
    categoryId: "",
    expenseType: "BUSINESS",
    paymentMethod: "BANK",
    dayOfMonth: "1",
    notes: "",
  });

  const formatCurrency = (val: number) =>
    `₹${val.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await createFixedExpenseTemplate(formData);
    if (res.success) {
      const catObj = categories.find((c) => c.id === formData.categoryId);
      setTemplates([
        ...templates,
        { ...res.template, category: catObj, expenses: [] },
      ].sort((a, b) => a.dayOfMonth - b.dayOfMonth));
      setOpen(false);
      setFormData({
        name: "",
        amount: "",
        categoryId: "",
        expenseType: "BUSINESS",
        paymentMethod: "BANK",
        dayOfMonth: "1",
        notes: "",
      });
    } else {
      alert(res.error || "Failed to create fixed expense");
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this fixed expense template?")) return;
    const res = await deleteFixedExpenseTemplate(id);
    if (res.success) {
      setTemplates(templates.filter((t) => t.id !== id));
    } else {
      alert(res.error);
    }
  };

  const handleToggle = async (id: string, currentStatus: boolean) => {
    const res = await toggleFixedExpenseTemplateStatus(id, !currentStatus);
    if (res.success) {
      setTemplates(
        templates.map((t) => (t.id === id ? { ...t, isActive: !currentStatus } : t))
      );
    }
  };

  const totalFixedMonthly = templates
    .filter((t) => t.isActive)
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-6">
      {/* Banner / Info Header */}
      <div className="bg-gradient-to-r from-purple-950 via-purple-900 to-indigo-950 text-white rounded-2xl p-6 shadow-xl border border-purple-800/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-purple-500/10 blur-3xl rounded-full pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 bg-purple-500/20 text-purple-200 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md border border-purple-400/30">
              <Sparkles className="h-3.5 w-3.5" />
              <span>100% Fully Automated Recurring Engine</span>
            </div>
            <h2 className="text-2xl font-bold">Fixed & Recurring Expenses</h2>
            <p className="text-sm text-purple-200/80 max-w-2xl">
              Set up monthly recurring expenses like Rent, Salary, Bills & Maintenance once. The system automatically logs them on your chosen date every month—zero manual approval needed.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-xl p-4 text-center min-w-[200px]">
            <div className="text-xs font-medium text-purple-200 uppercase tracking-wider">
              Total Fixed Monthly
            </div>
            <div className="text-2xl font-black text-white mt-1">
              {formatCurrency(totalFixedMonthly)}
            </div>
            <div className="text-[10px] text-purple-300 mt-1">
              Auto-logged into Accounting
            </div>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            Active Fixed Expense Templates ({templates.length})
          </h3>
          <p className="text-xs text-muted-foreground">
            Manage your monthly automated billing schedule
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-500/20">
              <Plus className="mr-2 h-4 w-4" /> Create Fixed Expense
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2 text-purple-600 dark:text-purple-400">
                <CalendarSync className="h-5 w-5" />
                <span>Create Automated Fixed Expense</span>
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleCreate} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Expense Name <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="e.g., Shop Rent, Electricity Bill, Staff Salary"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Amount (₹) <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 50000"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Date of Every Month <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={formData.dayOfMonth}
                    onValueChange={(val) => setFormData({ ...formData, dayOfMonth: val || "1" })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Day" />
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
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Category
                  </label>
                  <Select
                    value={formData.categoryId}
                    onValueChange={(val) => setFormData({ ...formData, categoryId: val || "" })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name} ({c.type})
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
                    value={formData.expenseType}
                    onValueChange={(val: any) => setFormData({ ...formData, expenseType: (val as "BUSINESS" | "PERSONAL") || "BUSINESS" })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BUSINESS">Business Expense</SelectItem>
                      <SelectItem value="PERSONAL">Personal Expense</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Payment Method
                </label>
                <Select
                  value={formData.paymentMethod}
                  onValueChange={(val) => setFormData({ ...formData, paymentMethod: val || "BANK" })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Payment Method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BANK">Bank Transfer</SelectItem>
                    <SelectItem value="UPI">UPI</SelectItem>
                    <SelectItem value="CASH">Cash</SelectItem>
                    <SelectItem value="CREDIT_CARD">Credit Card</SelectItem>
                    <SelectItem value="DEBIT_CARD">Debit Card</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Notes / Description (Optional)
                </label>
                <Textarea
                  placeholder="e.g., Monthly shop rent paid to landlord"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                />
              </div>

              <div className="bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 rounded-xl p-3 text-xs text-purple-800 dark:text-purple-300 flex items-start space-x-2">
                <Zap className="h-4 w-4 text-purple-600 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Automated Guarantee:</strong> On the {formData.dayOfMonth}th of every month, ₹{formData.amount || "0"} will be automatically logged into your Expense Tracker & Accounting dashboard without requiring manual action.
                </span>
              </div>

              <Button
                type="submit"
                disabled={loading || !formData.name || !formData.amount}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              >
                {loading ? "Creating..." : "Save & Enable Auto-Generation"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Templates Table / Cards */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-gray-50 dark:bg-gray-900">
            <TableRow>
              <TableHead className="font-bold">Expense Name</TableHead>
              <TableHead className="font-bold">Schedule Date</TableHead>
              <TableHead className="font-bold">Category</TableHead>
              <TableHead className="font-bold">Type</TableHead>
              <TableHead className="font-bold">Payment Method</TableHead>
              <TableHead className="font-bold text-right">Monthly Amount</TableHead>
              <TableHead className="font-bold text-center">Status</TableHead>
              <TableHead className="font-bold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {templates.map((t) => (
              <TableRow key={t.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/50">
                <TableCell>
                  <div className="font-semibold text-gray-900 dark:text-gray-100 flex items-center space-x-2">
                    <Lock className="h-3.5 w-3.5 text-purple-500" />
                    <span>{t.name}</span>
                  </div>
                  {t.notes && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{t.notes}</p>}
                </TableCell>

                <TableCell>
                  <div className="inline-flex items-center space-x-1.5 bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 px-2.5 py-1 rounded-lg text-xs font-semibold border border-purple-200 dark:border-purple-800">
                    <Clock className="h-3 w-3" />
                    <span>
                      {t.dayOfMonth}
                      {t.dayOfMonth === 1 ? "st" : t.dayOfMonth === 2 ? "nd" : t.dayOfMonth === 3 ? "rd" : "th"} of month
                    </span>
                  </div>
                </TableCell>

                <TableCell className="text-sm">
                  {t.category?.name || "Fixed Expense"}
                </TableCell>

                <TableCell>
                  <span
                    className={`inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                      t.expenseType === "BUSINESS"
                        ? "bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
                        : "bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
                    }`}
                  >
                    {t.expenseType}
                  </span>
                </TableCell>

                <TableCell className="text-xs font-medium uppercase text-gray-600 dark:text-gray-400">
                  {t.paymentMethod}
                </TableCell>

                <TableCell className="text-right font-extrabold text-purple-600 dark:text-purple-400 text-base">
                  {formatCurrency(t.amount)}
                </TableCell>

                <TableCell className="text-center">
                  <button
                    onClick={() => handleToggle(t.id, t.isActive)}
                    className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all ${
                      t.isActive
                        ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-500 border border-gray-300 dark:border-gray-700"
                    }`}
                  >
                    <CheckCircle2 className="h-3 w-3" />
                    <span>{t.isActive ? "Active Auto" : "Paused"}</span>
                  </button>
                </TableCell>

                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(t.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}

            {templates.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <CalendarSync className="h-10 w-10 text-purple-400 opacity-60" />
                    <p className="font-semibold text-gray-700 dark:text-gray-300">
                      No fixed expenses created yet
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Click "Create Fixed Expense" to start auto-recurring rent, salaries, or bills.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
