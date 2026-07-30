"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, Trash } from "lucide-react";

export type ProductListing = {
  id: string;
  name: string;
  code: string;
  category: { name: string };
  brand: { name: string } | null;
  variantsCount: number;
};

export const columns: ColumnDef<ProductListing>[] = [
  {
    accessorKey: "code",
    header: "Code",
    cell: ({ row }) => <span className="font-medium text-gray-900 dark:text-gray-100">{row.original.code}</span>,
  },
  {
    accessorKey: "name",
    header: "Product Name",
  },
  {
    accessorKey: "category.name",
    header: "Category",
  },
  {
    accessorKey: "brand.name",
    header: "Brand",
    cell: ({ row }) => row.original.brand?.name || "-",
  },
  {
    accessorKey: "variantsCount",
    header: "Variants",
    cell: ({ row }) => (
      <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 dark:bg-blue-400/10 dark:text-blue-400 dark:ring-blue-400/30">
        {row.original.variantsCount}
      </span>
    ),
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
