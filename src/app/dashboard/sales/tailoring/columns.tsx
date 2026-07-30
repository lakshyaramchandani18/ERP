"use client";

import { ColumnDef } from "@tanstack/react-table";
// No Badge import needed
import { updateTailoringStatus } from "@/actions/tailoring";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

export type TailoringListing = {
  id: string;
  orderNumber: string;
  customer: { name: string, mobile: string } | null;
  orderDate: Date;
  deliveryDate: Date;
  status: string;
  fabricDetails: string | null;
  estimatedCost: number;
};

// Component for the status cell so it can manage its own loading state
const StatusCell = ({ row }: { row: any }) => {
  const order = row.original;
  const [status, setStatus] = useState(order.status);
  const [loading, setLoading] = useState(false);

  const handleStatusChange = async (newStatus: string) => {
    setStatus(newStatus);
    setLoading(true);
    await updateTailoringStatus(order.id, newStatus);
    setLoading(false);
  };

  return (
    <Select value={status} onValueChange={(v) => handleStatusChange(v || "MEASURED")} disabled={loading}>
      <SelectTrigger className="w-[140px] h-8 text-xs">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="MEASURED">Measured</SelectItem>
        <SelectItem value="CUTTING">Cutting</SelectItem>
        <SelectItem value="STITCHING">Stitching</SelectItem>
        <SelectItem value="FITTING">Fitting</SelectItem>
        <SelectItem value="READY">Ready</SelectItem>
        <SelectItem value="DELIVERED">Delivered</SelectItem>
      </SelectContent>
    </Select>
  );
};

export const columns: ColumnDef<TailoringListing>[] = [
  {
    accessorKey: "orderNumber",
    header: "Order No.",
    cell: ({ row }) => <span className="font-medium text-gray-900 dark:text-gray-100">{row.original.orderNumber}</span>,
  },
  {
    accessorKey: "customer.name",
    header: "Customer",
    cell: ({ row }) => (
      <div>
        <p className="font-medium">{row.original.customer?.name}</p>
        <p className="text-xs text-gray-500">{row.original.customer?.mobile}</p>
      </div>
    ),
  },
  {
    accessorKey: "fabricDetails",
    header: "Details / Fabric",
    cell: ({ row }) => <span className="text-gray-600 line-clamp-2 max-w-[200px] text-sm">{row.original.fabricDetails || "N/A"}</span>,
  },
  {
    accessorKey: "orderDate",
    header: "Order Date",
    cell: ({ row }) => new Date(row.original.orderDate).toLocaleDateString(),
  },
  {
    accessorKey: "deliveryDate",
    header: "Due Date",
    cell: ({ row }) => {
      const isPastDue = new Date(row.original.deliveryDate) < new Date() && row.original.status !== "DELIVERED";
      return (
        <span className={isPastDue ? "text-red-600 font-bold" : "text-gray-900"}>
          {new Date(row.original.deliveryDate).toLocaleDateString()}
        </span>
      );
    }
  },
  {
    accessorKey: "estimatedCost",
    header: "Total Est.",
    cell: ({ row }) => <span className="font-semibold text-green-600">₹{row.original.estimatedCost}</span>,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusCell row={row} />,
  }
];
