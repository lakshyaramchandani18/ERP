"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Search, Filter, Receipt, Lock, Landmark, Sparkles } from "lucide-react";
import { createExpense, deleteExpense } from "@/actions/expenses";

export default function ManualExpensesClient({
  initialExpenses,
  categories,
}: {
  initialExpenses: any[];
  categories: any[];
}) {
  const [expenses, setExpenses] = useState(initialExpenses);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [catFilter, setCatFilter] = useState("ALL");

  const [formData, setFormData] = useState<{
    title: string;
    amount: string;
    date: string;
    categoryId: string;
    expenseType: "BUSINESS" | "PERSONAL";
    paymentMethod: string;
    vendor: string;
    remarks: string;
  }>({
    title: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    categoryId: "",
    expenseType: "BUSINESS",
    paymentMethod: "CASH",
    vendor: "",
    remarks: "",
  });

  const formatCurrency = (val: number) =>
    `₹${val.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await createExpense(formData);
    if (res.success) {
      const catObj = categories.find((c) => c.id === formData.categoryId);
      setExpenses(
        [
          { ...res.expense, category: catObj },
          ...expenses,
        ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      );
      setOpen(false);
      setFormData({
        title: "",
        amount: "",
        date: new Date().toISOString().split("T")[0],
        categoryId: "",
        expenseType: "BUSINESS",
        paymentMethod: "CASH",
        vendor: "",
        remarks: "",
      });
    } else {
      alert(res.error || "Failed to add expense");
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this expense entry?")) return;
    const res = await deleteExpense(id);
    if (res.success) {
      setExpenses(expenses.filter((e) => e.id !== id));
    } else {
      alert(res.error);
    }
  };

  // Quick preset buttons for instant manual logging
  const handleQuickPreset = (presetTitle: string, defaultCatName: string, defaultType: "BUSINESS" | "PERSONAL") => {
    const cat = categories.find((c) => c.name.toLowerCase().includes(defaultCatName.toLowerCase()));
    setFormData({
      ...formData,
      title: presetTitle,
      categoryId: cat ? cat.id : "",
      expenseType: defaultType,
    });
    setOpen(true);
  };

  const filteredExpenses = expenses.filter((e) => {
    const matchesSearch =
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      (e.vendor && e.vendor.toLowerCase().includes(search.toLowerCase())) ||
      (e.remarks && e.remarks.toLowerCase().includes(search.toLowerCase()));

    const matchesType = typeFilter === "ALL" || e.expenseType === typeFilter;
    const matchesCat = catFilter === "ALL" || e.categoryId === catFilter;

    return matchesSearch && matchesType && matchesCat;
  });

  return (
    <div className="space-y-6">
      {/* Quick Log Presets Bar */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 p-4 rounded-2xl border border-blue-100 dark:border-gray-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
            Quick Add Presets:
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuickPreset("Tea & Snacks", "Tea", "BUSINESS")}
            className="text-xs bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
          >
            ☕ Tea & Snacks
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuickPreset("Fuel / Travel", "Fuel", "BUSINESS")}
            className="text-xs bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
          >
            ⛽ Fuel & Transport
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuickPreset("Office Supplies", "Office", "BUSINESS")}
            className="text-xs bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
          >
            📦 Office Supplies
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuickPreset("College Fees / Education", "College", "PERSONAL")}
            className="text-xs bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
          >
            🎓 College Fees
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuickPreset("Home Grocery & Personal", "Home", "PERSONAL")}
            className="text-xs bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
          >
            🏠 Home Expenses
          </Button>
        </div>
      </div>

      {/* Filter and Add Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search expenses by title, vendor, or notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-white dark:bg-gray-950"
            />
          </div>

          <Select value={typeFilter} onValueChange={(val) => setTypeFilter(val || "ALL")}>
            <SelectTrigger className="w-[150px] bg-white dark:bg-gray-950">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Types</SelectItem>
              <SelectItem value="BUSINESS">Business Only</SelectItem>
              <SelectItem value="PERSONAL">Personal Only</SelectItem>
            </SelectContent>
          </Select>

          <Select value={catFilter} onValueChange={(val) => setCatFilter(val || "ALL")}>
            <SelectTrigger className="w-[180px] bg-white dark:bg-gray-950">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={
            <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20">
              <Plus className="mr-2 h-4 w-4" /> Add Manual Expense
            </Button>
          } />
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2 text-blue-600 dark:text-blue-400">
                <Receipt className="h-5 w-5" />
                <span>Log New Expense</span>
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleCreate} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Expense Name / Title <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="e.g. Tea & Snacks, Fuel, Office Stationary"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
                    placeholder="e.g. 250"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Date <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Payment Method
                  </label>
                  <Select
                    value={formData.paymentMethod}
                    onValueChange={(val) => setFormData({ ...formData, paymentMethod: val || "CASH" })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Payment Method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CASH">Cash</SelectItem>
                      <SelectItem value="UPI">UPI</SelectItem>
                      <SelectItem value="CREDIT_CARD">Credit Card</SelectItem>
                      <SelectItem value="DEBIT_CARD">Debit Card</SelectItem>
                      <SelectItem value="BANK">Bank Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Vendor (Optional)
                  </label>
                  <Input
                    placeholder="e.g., Local Vendor / Store"
                    value={formData.vendor}
                    onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Notes / Remarks (Optional)
                </label>
                <Textarea
                  placeholder="Additional context or reference..."
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  rows={2}
                />
              </div>

              <Button
                type="submit"
                disabled={loading || !formData.title || !formData.amount}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                {loading ? "Saving..." : "Save Expense"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Expenses Table */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-gray-50 dark:bg-gray-900">
            <TableRow>
              <TableHead className="font-bold">Date</TableHead>
              <TableHead className="font-bold">Expense Title</TableHead>
              <TableHead className="font-bold">Category</TableHead>
              <TableHead className="font-bold">Type</TableHead>
              <TableHead className="font-bold">Payment Method</TableHead>
              <TableHead className="font-bold">Vendor / Remarks</TableHead>
              <TableHead className="font-bold text-right">Amount</TableHead>
              <TableHead className="font-bold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredExpenses.map((expense) => (
              <TableRow key={expense.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/50">
                <TableCell className="text-xs font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap">
                  {new Date(expense.date).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </TableCell>

                <TableCell>
                  <div className="font-semibold text-gray-900 dark:text-gray-100 flex items-center space-x-2">
                    {expense.isFixed ? (
                      <span className="h-2 w-2 rounded-full bg-purple-500" title="Fixed / Recurring" />
                    ) : (
                      <span className="h-2 w-2 rounded-full bg-blue-500" title="Manual Expense" />
                    )}
                    <span>{expense.title}</span>
                  </div>
                  {expense.isFixed && (
                    <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400">
                      Auto Fixed / EMI
                    </span>
                  )}
                </TableCell>

                <TableCell className="text-sm">
                  {expense.category?.name || "General"}
                </TableCell>

                <TableCell>
                  <span
                    className={`inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                      expense.expenseType === "BUSINESS"
                        ? "bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
                        : "bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
                    }`}
                  >
                    {expense.expenseType}
                  </span>
                </TableCell>

                <TableCell className="text-xs font-medium uppercase text-gray-600 dark:text-gray-400 whitespace-nowrap">
                  {expense.paymentMethod}
                </TableCell>

                <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">
                  {expense.vendor && <span className="font-semibold text-gray-700 dark:text-gray-300">{expense.vendor}: </span>}
                  {expense.remarks || "-"}
                </TableCell>

                <TableCell className="text-right font-bold text-gray-900 dark:text-gray-100 text-base">
                  {formatCurrency(expense.amount)}
                </TableCell>

                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(expense.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}

            {filteredExpenses.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                  No expenses matching your criteria.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
