import { getLedgerEntries } from "@/actions/accounting";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./columns";

export default async function LedgerPage() {
  const { data: entries } = await getLedgerEntries();
  
  // Calculate running balance (assuming entries are sorted DESC by date)
  // To calculate running balance, we iterate from oldest to newest (end of array to start)
  let currentBalance = 0;
  
  const rawEntries = entries || [];
  const reversedEntries = [...rawEntries].reverse();
  
  const computedEntries = reversedEntries.map((entry: any) => {
    if (entry.type === "CREDIT") {
      currentBalance += entry.amount;
    } else if (entry.type === "DEBIT") {
      currentBalance -= entry.amount;
    }
    return {
      ...entry,
      description: entry.remarks || (entry.type === "CREDIT" ? "Sales / Receipt" : "Purchase / Expense"),
      runningBalance: currentBalance
    };
  });
  
  // Reverse back to newest first for display
  const formattedEntries = computedEntries.reverse();

  return (
    <div className="space-y-6 flex flex-col h-full">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">General Ledger</h1>
        <p className="text-sm text-muted-foreground">
          View all financial transactions, income, and expenses across the business.
        </p>
      </div>

      <div className="flex-1 rounded-xl shadow-sm bg-white dark:bg-gray-950 p-6 border dark:border-gray-800">
        <DataTable columns={columns} data={formattedEntries} />
      </div>
    </div>
  );
}
