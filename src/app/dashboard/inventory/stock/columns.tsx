"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, Trash, Copy, Printer, History } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";

export type InventoryItem = {
  id: string;
  productId: string;
  name: string; // From Product
  sku: string;
  barcode: string | null;
  brand: string | null;
  category: string;
  color: string | null;
  size: string | null;
  hsnCode: string | null;
  mrp: number;
  sellingPrice: number | string;
  purchasePrice: number;
  stock: number;
  gstPercent: number;
  taxType: string;
  status: string;
  updatedAt: Date;
  variants: any[];
};

export const columns: ColumnDef<InventoryItem>[] = [
  {
    id: "expander",
    header: () => null,
    cell: ({ row }) => {
      return row.original.variants?.length > 1 ? (
        <button
          {...{
            onClick: row.getToggleExpandedHandler(),
            style: { cursor: 'pointer' },
          }}
          className="text-gray-500 hover:text-gray-700"
        >
          {row.getIsExpanded() ? '▼' : '▶'}
        </button>
      ) : null
    },
  },
  {
    accessorKey: "name",
    header: "Product Name",
    cell: ({ row }) => (
      <div>
        <div className="font-medium whitespace-nowrap">{row.original.name}</div>
        {row.original.variants?.length > 1 && (
          <div className="text-xs text-blue-600">{row.original.variants.length} Variants</div>
        )}
      </div>
    ),
  },
  {
    accessorKey: "sku",
    header: "SKU",
  },
  {
    accessorKey: "category",
    header: "Category",
  },
  {
    accessorKey: "brand",
    header: "Brand",
    cell: ({ row }) => row.original.brand || "-",
  },
  {
    accessorKey: "color",
    header: "Color",
    cell: ({ row }) => row.original.color || "-",
  },
  {
    accessorKey: "size",
    header: "Size",
    cell: ({ row }) => row.original.size || "-",
  },
  {
    accessorKey: "hsnCode",
    header: "HSN",
    cell: ({ row }) => row.original.hsnCode || "-",
  },
  {
    accessorKey: "purchasePrice",
    header: "Purchase (₹)",
    cell: ({ row }) => row.original.purchasePrice.toFixed(2),
  },
  {
    accessorKey: "mrp",
    header: "MRP (₹)",
    cell: ({ row }) => row.original.mrp.toFixed(2),
  },
  {
    accessorKey: "sellingPrice",
    header: "Selling (₹)",
    cell: ({ row }) => typeof row.original.sellingPrice === 'number' 
      ? row.original.sellingPrice.toFixed(2) 
      : row.original.sellingPrice,
  },
  {
    accessorKey: "stock",
    header: "Stock",
    cell: ({ row }) => {
      const qty = row.original.stock;
      return (
        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
          qty <= 0 ? 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/10' : 
          qty < 5 ? 'bg-yellow-50 text-yellow-800 ring-1 ring-inset ring-yellow-600/20' : 
          'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20'
        }`}>
          {qty}
        </span>
      );
    }
  },
  {
    accessorKey: "gstPercent",
    header: "GST",
    cell: ({ row }) => row.original.taxType === "NO_TAX" ? "N/A" : `${row.original.gstPercent}%`,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
        row.original.status === 'ACTIVE' ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-700'
      }`}>
        {row.original.status}
      </span>
    )
  },
  {
    accessorKey: "updatedAt",
    header: "Last Updated",
    cell: ({ row }) => format(new Date(row.original.updatedAt), 'dd MMM yyyy'),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" title="View" className="h-8 w-8 text-gray-500 hover:text-gray-900">
            <Eye className="h-4 w-4" />
          </Button>
          <Link href={`/dashboard/products/${row.original.productId}/edit`}>
            <Button variant="ghost" size="icon" title="Edit" className="h-8 w-8 text-blue-600 hover:text-blue-900">
              <Pencil className="h-4 w-4" />
            </Button>
          </Link>
          <Button variant="ghost" size="icon" title="Duplicate" className="h-8 w-8 text-gray-500 hover:text-gray-900">
            <Copy className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" title="Print Barcode" className="h-8 w-8 text-gray-500 hover:text-gray-900">
            <Printer className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" title="Stock History" className="h-8 w-8 text-gray-500 hover:text-gray-900">
            <History className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" title="Delete" onClick={async () => {
            if (confirm("Are you sure you want to delete this product?")) {
              const { deleteProductAction } = await import("@/actions/products");
              const res = await deleteProductAction(row.original.productId);
              if (res?.error) alert(res.error);
            }
          }} className="h-8 w-8 text-red-600 hover:text-red-900">
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
];
