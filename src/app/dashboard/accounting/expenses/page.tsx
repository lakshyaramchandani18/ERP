import { getExpenseCategories } from "@/actions/accounting";
import { ExpenseForm } from "./expense-form";

export default async function ExpensesPage() {
  const categories = await getExpenseCategories();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Log Expenses</h1>
        <p className="text-sm text-muted-foreground">
          Record day-to-day operational expenses like rent, salaries, or supplies.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-950 p-6 rounded-xl border dark:border-gray-800 shadow-sm max-w-2xl">
        <ExpenseForm categories={categories || []} />
      </div>
    </div>
  );
}
