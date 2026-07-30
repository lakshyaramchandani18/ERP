import React from "react";
import { getExpenses, getExpenseCategories } from "@/actions/expenses";
import { ExpensesNav } from "../components/ExpensesNav";
import ManualExpensesClient from "./ManualExpensesClient";

export default async function ManualExpensesPage() {
  const expenses = await getExpenses();
  const categories = await getExpenseCategories();

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          Manual Expenses
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Record day-to-day operational expenses, transport, supplies, and miscellaneous spends
        </p>
      </div>

      <ExpensesNav />

      <ManualExpensesClient initialExpenses={expenses} categories={categories} />
    </div>
  );
}
