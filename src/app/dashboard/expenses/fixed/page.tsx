import React from "react";
import { getFixedExpenseTemplates, getExpenseCategories } from "@/actions/expenses";
import { ExpensesNav } from "../components/ExpensesNav";
import FixedExpensesClient from "./FixedExpensesClient";

export default async function FixedExpensesPage() {
  const templates = await getFixedExpenseTemplates();
  const categories = await getExpenseCategories();

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          Fixed Expenses
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Configure recurring monthly expenses for automated logging into the expense tracker
        </p>
      </div>

      <ExpensesNav />

      <FixedExpensesClient initialTemplates={templates} categories={categories} />
    </div>
  );
}
