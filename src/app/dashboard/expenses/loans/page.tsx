import React from "react";
import { getLoans } from "@/actions/expenses";
import { ExpensesNav } from "../components/ExpensesNav";
import LoansClient from "./LoansClient";

export default async function LoansPage() {
  const loans = await getLoans();

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          Loan Manager
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Automated interest calculation & recurring EMI expense tracking for business and personal loans
        </p>
      </div>

      <ExpensesNav />

      <LoansClient initialLoans={loans} />
    </div>
  );
}
