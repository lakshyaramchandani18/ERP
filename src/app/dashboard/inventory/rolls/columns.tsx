"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Scissors, Eye } from "lucide-react";

export type FabricRoll = {
  id: string;
  rollNumber: string;
  productName: string;
  originalMeters: number;
  remainingMeters: number;
  status: string;
};

export const columns: ColumnDef<FabricRoll>[] = [
  {
    accessorKey: "rollNumber",
    header: "Roll Number",
    cell: ({ row }) => <span className="font-medium">{row.original.rollNumber}</span>,
  },
  {
    accessorKey: "productName",
    header: "Fabric / Variant",
  },
  {
    accessorKey: "originalMeters",
    header: "Original (m)",
  },
  {
    accessorKey: "remainingMeters",
    header: "Remaining (m)",
    cell: ({ row }) => {
      const remaining = row.original.remainingMeters;
      const original = row.original.originalMeters;
      const percentage = (remaining / original) * 100;
      
      let colorClass = "text-green-600";
      if (percentage < 20) colorClass = "text-red-600 font-bold";
      else if (percentage < 50) colorClass = "text-yellow-600";
      
      return <span className={colorClass}>{remaining.toFixed(2)} m</span>;
    }
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      const bg = status === "IN_STOCK" ? "bg-green-50 text-green-700 ring-green-600/20" : "bg-gray-50 text-gray-600 ring-gray-500/10";
      return (
        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${bg}`}>
          {status.replace("_", " ")}
        </span>
      );
    }
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:text-purple-400 dark:hover:bg-purple-950">
            <Scissors className="h-4 w-4 mr-2" /> Cut
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800">
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
];
