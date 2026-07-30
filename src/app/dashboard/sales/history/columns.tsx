"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { PrintInvoiceAction } from "./print-invoice-action";

export type SaleHistoryListing = {
  id: string;
  invoiceNumber: string;
  customer: { name: string } | null;
  saleDate: Date;
  grandTotal: number;
  paymentMethod: string;
};

export const columns: ColumnDef<SaleHistoryListing>[] = [
  {
    accessorKey: "invoiceNumber",
    header: "Invoice No.",
    cell: ({ row }) => <span className="font-medium text-gray-900 dark:text-gray-100">{row.original.invoiceNumber}</span>,
  },
  {
    accessorKey: "customer.name",
    header: "Customer",
    cell: ({ row }) => row.original.customer?.name || <span className="text-gray-400">Walk-in</span>,
  },
  {
    accessorKey: "saleDate",
    header: "Date",
    cell: ({ row }) => new Date(row.original.saleDate).toLocaleString(),
  },
  {
    accessorKey: "paymentMethod",
    header: "Payment",
    cell: ({ row }) => {
      return (
        <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
          {row.original.paymentMethod}
        </span>
      );
    }
  },
  {
    accessorKey: "grandTotal",
    header: "Total",
    cell: ({ row }) => <span className="font-bold text-green-600">₹{row.original.grandTotal.toFixed(2)}</span>,
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950">
            <Eye className="h-4 w-4" />
          </Button>
          <PrintInvoiceAction sale={row.original} />
        </div>
      );
    },
  },
];
