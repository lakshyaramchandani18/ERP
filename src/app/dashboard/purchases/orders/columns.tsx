"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Eye, FileDown } from "lucide-react";

export type PurchaseOrderListing = {
  id: string;
  poNumber: string;
  supplier: { name: string };
  expectedDate: Date | null;
  totalAmount: number;
  status: string;
};

export const columns: ColumnDef<PurchaseOrderListing>[] = [
  {
    accessorKey: "poNumber",
    header: "PO Number",
    cell: ({ row }) => <span className="font-medium">{row.original.poNumber}</span>,
  },
  {
    accessorKey: "supplier.name",
    header: "Supplier",
  },
  {
    accessorKey: "expectedDate",
    header: "Expected Delivery",
    cell: ({ row }) => row.original.expectedDate ? new Date(row.original.expectedDate).toLocaleDateString() : "-",
  },
  {
    accessorKey: "totalAmount",
    header: "Total Amount",
    cell: ({ row }) => <span className="font-medium">₹{row.original.totalAmount.toFixed(2)}</span>,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      let colorClass = "bg-gray-50 text-gray-700 ring-gray-600/20";
      
      if (status === "APPROVED") colorClass = "bg-blue-50 text-blue-700 ring-blue-600/20";
      if (status === "PARTIAL") colorClass = "bg-yellow-50 text-yellow-700 ring-yellow-600/20";
      if (status === "COMPLETED") colorClass = "bg-green-50 text-green-700 ring-green-600/20";
      if (status === "REJECTED") colorClass = "bg-red-50 text-red-700 ring-red-600/20";
      
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
          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800">
            <FileDown className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
];
