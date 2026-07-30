import React from "react";
import { getExpenses, getExpenseCategories } from "@/actions/expenses";
import { ExpensesNav } from "../components/ExpensesNav";
import ManualExpensesClient from "../manual/ManualExpensesClient";

export default async function ExpensesListPage() {
  const expenses = await getExpenses();
  const categories = await getExpenseCategories();

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          All Expenses Tracker
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Complete log of all automated fixed expenses, manual entries, and loan EMIs
        </p>
      </div>

      <ExpensesNav />

      <ManualExpensesClient initialExpenses={expenses} categories={categories} />
    </div>
  );
}
