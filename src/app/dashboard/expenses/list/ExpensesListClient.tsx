"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus } from "lucide-react";
import { createExpense, deleteExpense } from "@/actions/expenses";

export default function ExpensesListClient({ initialExpenses, categories }: { initialExpenses: any[], categories: any[] }) {
  const [expenses, setExpenses] = useState(initialExpenses);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<{
    title: string;
    categoryId: string;
    amount: string;
    date: string;
    paymentMethod: string;
    vendor: string;
    expenseType: "BUSINESS" | "PERSONAL";
  }>({
    title: "",
    categoryId: "",
    amount: "",
    date: new Date().toISOString().split('T')[0],
    paymentMethod: "CASH",
    vendor: "",
    expenseType: "BUSINESS"
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await createExpense(formData);
    if (res.success) {
      const newExpense = {
        ...res.expense,
        category: categories.find(c => c.id === formData.categoryId)
      };
      setExpenses([newExpense, ...expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      setOpen(false);
      setFormData({
        title: "", categoryId: "", amount: "", date: new Date().toISOString().split('T')[0],
        paymentMethod: "CASH", vendor: "", expenseType: "BUSINESS"
      });
    } else {
      alert(res.error);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this expense?")) return;
    const res = await deleteExpense(id);
    if (res.success) {
      setExpenses(expenses.filter((e) => e.id !== id));
    } else {
      alert(res.error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
            <Plus className="mr-2 h-4 w-4" /> New Expense
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Expense</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <Input value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Amount</label>
                <Input type="number" step="0.01" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Date</label>
                <Input type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Payment Method</label>
                <Select value={formData.paymentMethod} onValueChange={(val) => setFormData({...formData, paymentMethod: val || "CASH"})}>
                  <SelectTrigger><SelectValue placeholder="Method" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CASH">Cash</SelectItem>
                    <SelectItem value="BANK">Bank</SelectItem>
                    <SelectItem value="UPI">UPI</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Vendor (Optional)</label>
                <Input value={formData.vendor} onChange={(e) => setFormData({...formData, vendor: e.target.value})} />
              </div>
              <div className="space-y-2 col-span-2">
                <label className="text-sm font-medium">Expense Type</label>
                <Select value={formData.expenseType} onValueChange={(val: any) => setFormData({...formData, expenseType: (val as "BUSINESS" | "PERSONAL") || "BUSINESS"})}>
                  <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BUSINESS">Business</SelectItem>
                    <SelectItem value="PERSONAL">Personal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" disabled={loading || !formData.categoryId} className="col-span-2">
                {loading ? "Saving..." : "Save Expense"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenses.map((expense) => (
              <TableRow key={expense.id}>
                <TableCell>{new Date(expense.date).toLocaleDateString()}</TableCell>
                <TableCell className="font-medium">{expense.title}</TableCell>
                <TableCell>{expense.category?.name || "N/A"}</TableCell>
                <TableCell>{expense.expenseType}</TableCell>
                <TableCell>{expense.vendor || "-"}</TableCell>
                <TableCell className="text-right font-bold">₹{expense.amount.toLocaleString()}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(expense.id)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {expenses.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center">No expenses found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
