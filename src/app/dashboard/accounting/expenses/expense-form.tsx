"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createExpense } from "@/actions/accounting";

export function ExpenseForm({ categories }: { categories: any[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [amount, setAmount] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [remarks, setRemarks] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !categoryName) return;

    setLoading(true);
    const res = await createExpense({
      amount,
      categoryName,
      paymentMethod,
      remarks,
    });
    setLoading(false);

    if (res.success) {
      alert("Expense logged successfully!");
      router.push("/dashboard/accounting/ledger");
    } else {
      alert("Failed to log expense: " + (res as any).error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Amount (₹)</Label>
          <Input 
            type="number" 
            placeholder="0.00" 
            value={amount}
            onChange={e => setAmount(e.target.value)}
            required 
            min="1"
          />
        </div>
        
        <div className="space-y-2">
          <Label>Category</Label>
          {/* Using a simple input for category to allow new ones easily, could be a combobox */}
          <Input 
            placeholder="e.g. Rent, Salary, Electricity" 
            value={categoryName}
            onChange={e => setCategoryName(e.target.value)}
            list="expense-categories"
            required
          />
          <datalist id="expense-categories">
            {categories.map((c: any) => (
              <option key={c.id} value={c.name} />
            ))}
          </datalist>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Payment Method</Label>
          <Select value={paymentMethod} onValueChange={(v) => setPaymentMethod(v || "CASH")}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CASH">Cash</SelectItem>
              <SelectItem value="BANK">Bank Transfer / UPI</SelectItem>
              <SelectItem value="CREDIT_CARD">Credit Card</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Remarks / Description</Label>
          <Input 
            placeholder="Optional notes about this expense"
            value={remarks}
            onChange={e => setRemarks(e.target.value)}
          />
        </div>
      </div>

      <Button type="submit" className="w-full bg-red-600 hover:bg-red-700" disabled={loading}>
        {loading ? "Logging Expense..." : "Log Expense (DEBIT)"}
      </Button>
    </form>
  );
}
