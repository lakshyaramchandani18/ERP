import React from "react";
import { getExpenseCategories } from "@/actions/expenses";
import { ExpensesNav } from "../components/ExpensesNav";
import CategoriesClient from "./CategoriesClient";

export default async function CategoriesPage() {
  const categories = await getExpenseCategories();

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          Expense Categories
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Organize your business and personal expenses into structured accounting categories
        </p>
      </div>

      <ExpensesNav />

      <CategoriesClient initialCategories={categories} />
    </div>
  );
}
