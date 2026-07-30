"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Eye, FileText } from "lucide-react";

export type ExpenseListing = {
  id: string;
  date: Date;
  category: { name: string };
  amount: number;
  paymentMethod: string;
  remarks: string | null;
};

export const columns: ColumnDef<ExpenseListing>[] = [
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => new Date(row.original.date).toLocaleDateString(),
  },
  {
    accessorKey: "category.name",
    header: "Category",
    cell: ({ row }) => <span className="font-medium text-gray-900 dark:text-gray-100">{row.original.category.name}</span>,
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => <span className="font-bold text-red-600 dark:text-red-400">₹{row.original.amount.toFixed(2)}</span>,
  },
  {
    accessorKey: "paymentMethod",
    header: "Payment Method",
    cell: ({ row }) => (
      <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
        {row.original.paymentMethod}
      </span>
    ),
  },
  {
    accessorKey: "remarks",
    header: "Remarks",
    cell: ({ row }) => <span className="text-muted-foreground text-sm truncate max-w-[200px] inline-block">{row.original.remarks || "-"}</span>,
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950">
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800">
            <FileText className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
];
