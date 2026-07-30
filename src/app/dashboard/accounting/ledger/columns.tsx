"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

export type LedgerEntryListing = {
  id: string;
  date: Date;
  description: string;
  type: "CREDIT" | "DEBIT";
  amount: number;
  runningBalance: number;
};

export const columns: ColumnDef<LedgerEntryListing>[] = [
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => new Date(row.original.date).toLocaleString(),
  },
  {
    accessorKey: "description",
    header: "Description",
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      const isCredit = row.original.type === "CREDIT";
      return (
        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-semibold ${isCredit ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'}`}>
          {isCredit ? <ArrowUpRight className="mr-1 h-3 w-3" /> : <ArrowDownRight className="mr-1 h-3 w-3" />}
          {row.original.type}
        </span>
      );
    }
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => {
      const isCredit = row.original.type === "CREDIT";
      return (
        <span className={`font-bold ${isCredit ? 'text-green-600' : 'text-red-600'}`}>
          {isCredit ? '+' : '-'}₹{row.original.amount.toFixed(2)}
        </span>
      );
    }
  },
  {
    accessorKey: "runningBalance",
    header: "Running Balance",
    cell: ({ row }) => (
      <span className="font-medium text-gray-900 dark:text-gray-100">
        ₹{row.original.runningBalance.toFixed(2)}
      </span>
    ),
  },
];
