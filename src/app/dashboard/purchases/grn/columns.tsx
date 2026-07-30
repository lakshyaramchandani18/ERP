"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Eye, FileCheck } from "lucide-react";

export type GRNListing = {
  id: string;
  grnNumber: string;
  poNumber: string | null;
  supplier: { name: string };
  receivedDate: Date;
  status: string;
};

export const columns: ColumnDef<GRNListing>[] = [
  {
    accessorKey: "grnNumber",
    header: "GRN Number",
    cell: ({ row }) => <span className="font-medium text-gray-900 dark:text-gray-100">{row.original.grnNumber}</span>,
  },
  {
    accessorKey: "poNumber",
    header: "Linked PO",
    cell: ({ row }) => row.original.poNumber ? <span className="text-blue-600 dark:text-blue-400">{row.original.poNumber}</span> : "-",
  },
  {
    accessorKey: "supplier.name",
    header: "Supplier",
  },
  {
    accessorKey: "receivedDate",
    header: "Received Date",
    cell: ({ row }) => new Date(row.original.receivedDate).toLocaleDateString(),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      let colorClass = "bg-gray-50 text-gray-700 ring-gray-600/20";
      
      if (status === "VERIFIED") colorClass = "bg-green-50 text-green-700 ring-green-600/20";
      if (status === "RECEIVED") colorClass = "bg-blue-50 text-blue-700 ring-blue-600/20";
      
      return (
        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${colorClass}`}>
          {status}
        </span>
      );
    }
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950">
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-950">
            <FileCheck className="h-4 w-4 mr-2" /> Verify
          </Button>
        </div>
      );
    },
  },
];
