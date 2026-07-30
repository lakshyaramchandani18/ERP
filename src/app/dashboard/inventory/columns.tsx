"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Pencil, ArrowRightLeft } from "lucide-react";

export type Warehouse = {
  id: string;
  name: string;
  code: string;
  address: string | null;
  branch: { name: string } | null;
};

export const columns: ColumnDef<Warehouse>[] = [
  {
    accessorKey: "code",
    header: "Code",
    cell: ({ row }) => <span className="font-medium">{row.original.code}</span>,
  },
  {
    accessorKey: "name",
    header: "Warehouse Name",
  },
  {
    accessorKey: "branch.name",
    header: "Branch",
    cell: ({ row }) => row.original.branch?.name || "Main",
  },
  {
    accessorKey: "address",
    header: "Address",
    cell: ({ row }) => row.original.address || "-",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950">
            <ArrowRightLeft className="h-4 w-4 mr-2" /> Stock Transfer
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800">
            <Pencil className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
];
