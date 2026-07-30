"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, Trash } from "lucide-react";

export type Supplier = {
  id: string;
  name: string;
  phone: string | null;
  gstin: string | null;
  outstanding: number;
};

export const columns: ColumnDef<Supplier>[] = [
  {
    accessorKey: "name",
    header: "Supplier Name",
  },
  {
    accessorKey: "phone",
    header: "Phone",
    cell: ({ row }) => row.original.phone || "-",
  },
  {
    accessorKey: "gstin",
    header: "GSTIN",
    cell: ({ row }) => row.original.gstin || "-",
  },
  {
    accessorKey: "outstanding",
    header: "Outstanding Balance",
    cell: ({ row }) => {
      const amount = row.original.outstanding;
      return (
        <span className={amount > 0 ? "text-red-600 font-medium" : "text-green-600 font-medium"}>
          ₹{amount.toFixed(2)}
        </span>
      );
    }
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800">
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950">
            <Pencil className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
];
