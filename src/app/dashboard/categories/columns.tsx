"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Trash, Power, PowerOff } from "lucide-react";
import { deleteCategory, toggleCategory } from "@/actions/master-data";
import { EditCategoryDialog } from "@/components/master-data/edit-category-dialog";

export type Category = {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: Date;
};

export const columns: ColumnDef<Category>[] = [
  {
    accessorKey: "name",
    header: "Category Name",
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => {
      const desc = row.original.description;
      return <div className="text-muted-foreground">{desc || "No description"}</div>;
    }
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => {
      return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          row.original.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {row.original.isActive ? 'Active' : 'Disabled'}
        </span>
      );
    }
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => {
      return new Date(row.original.createdAt).toLocaleDateString();
    }
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const category = row.original;

      const handleDelete = async () => {
        if (confirm("Are you sure you want to delete this category?")) {
          const res = await deleteCategory(category.id);
          if (res?.error) alert(res.error);
        }
      };

      const handleToggle = async () => {
        const res = await toggleCategory(category.id, !category.isActive);
        if (res?.error) alert(res.error);
      };

      return (
        <div className="flex items-center gap-2">
          <EditCategoryDialog category={category} />
          
          <Button variant="ghost" size="icon" onClick={handleToggle} className={`h-8 w-8 ${category.isActive ? 'text-orange-600 hover:text-orange-700 hover:bg-orange-50' : 'text-green-600 hover:text-green-700 hover:bg-green-50'}`}>
            {category.isActive ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
          </Button>

          <Button variant="ghost" size="icon" onClick={handleDelete} className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950">
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
];
