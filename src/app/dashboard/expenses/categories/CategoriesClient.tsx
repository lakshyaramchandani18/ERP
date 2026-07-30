"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Tags } from "lucide-react";
import { createExpenseCategory, deleteExpenseCategory } from "@/actions/expenses";

export default function CategoriesClient({ initialCategories }: { initialCategories: any[] }) {
  const [categories, setCategories] = useState(initialCategories);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState<"BUSINESS" | "PERSONAL">("BUSINESS");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await createExpenseCategory(name, type);
    if (res.success) {
      setCategories([...categories, { ...res.category, _count: { expenses: 0, fixedTemplates: 0 } }]);
      setOpen(false);
      setName("");
      setType("BUSINESS");
    } else {
      alert(res.error);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this expense category?")) return;
    const res = await deleteExpenseCategory(id);
    if (res.success) {
      setCategories(categories.filter((c) => c.id !== id));
    } else {
      alert(res.error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            Expense Categories ({categories.length})
          </h3>
          <p className="text-xs text-muted-foreground">
            Classify expenses for business financial statements or personal tracking
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20">
              <Plus className="mr-2 h-4 w-4" /> Add Category
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Tags className="h-5 w-5 text-blue-600" />
                <span>Create Expense Category</span>
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleCreate} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Category Name <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="e.g., Marketing, Shop Maintenance, Staff Bonus"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Category Classification
                </label>
                <Select value={type} onValueChange={(val: any) => setType(val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BUSINESS">Business Expense (Affects P&L)</SelectItem>
                    <SelectItem value="PERSONAL">Personal Expense (Tracked Separately)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" disabled={loading || !name} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                {loading ? "Creating..." : "Save Category"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-gray-50 dark:bg-gray-900">
            <TableRow>
              <TableHead className="font-bold">Category Name</TableHead>
              <TableHead className="font-bold">Classification</TableHead>
              <TableHead className="font-bold text-center">Linked Expenses</TableHead>
              <TableHead className="font-bold text-center">Fixed Templates</TableHead>
              <TableHead className="font-bold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((cat) => (
              <TableRow key={cat.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/50">
                <TableCell className="font-semibold text-gray-900 dark:text-gray-100">
                  {cat.name}
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-block text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full ${
                      cat.type === "BUSINESS"
                        ? "bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
                        : "bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
                    }`}
                  >
                    {cat.type}
                  </span>
                </TableCell>
                <TableCell className="text-center font-medium">
                  {cat._count?.expenses || 0}
                </TableCell>
                <TableCell className="text-center font-medium">
                  {cat._count?.fixedTemplates || 0}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(cat.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
