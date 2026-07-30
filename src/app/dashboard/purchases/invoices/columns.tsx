"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Eye, ReceiptText } from "lucide-react";

export type PurchaseInvoiceListing = {
  id: string;
  invoiceNumber: string;
  supplier: { name: string };
  invoiceDate: Date;
  dueDate: Date | null;
  grandTotal: number;
  paymentStatus: string;
};

export const columns: ColumnDef<PurchaseInvoiceListing>[] = [
  {
    accessorKey: "invoiceNumber",
    header: "Invoice Number",
    cell: ({ row }) => <span className="font-medium text-gray-900 dark:text-gray-100">{row.original.invoiceNumber}</span>,
  },
  {
    accessorKey: "supplier.name",
    header: "Supplier",
  },
  {
    accessorKey: "invoiceDate",
    header: "Date",
    cell: ({ row }) => new Date(row.original.invoiceDate).toLocaleDateString(),
  },
  {
    accessorKey: "dueDate",
    header: "Due Date",
    cell: ({ row }) => row.original.dueDate ? new Date(row.original.dueDate).toLocaleDateString() : "-",
  },
  {
    accessorKey: "grandTotal",
    header: "Total Amount",
    cell: ({ row }) => <span className="font-medium">₹{row.original.grandTotal.toFixed(2)}</span>,
  },
  {
    accessorKey: "paymentStatus",
    header: "Payment Status",
    cell: ({ row }) => {
      const status = row.original.paymentStatus;
      let colorClass = "bg-gray-50 text-gray-700 ring-gray-600/20";
      
      if (status === "PAID") colorClass = "bg-green-50 text-green-700 ring-green-600/20";
      if (status === "PARTIAL") colorClass = "bg-yellow-50 text-yellow-700 ring-yellow-600/20";
      if (status === "UNPAID") colorClass = "bg-red-50 text-red-700 ring-red-600/20";
      
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
          <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800">
            <ReceiptText className="h-4 w-4 mr-2" /> Pay
          </Button>
        </div>
      );
    },
  },
];
