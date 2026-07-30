import prisma from "@/lib/prisma";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./columns";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

import { AddBrandDialog } from "@/components/master-data/add-brand-dialog";

export default async function BrandsPage() {
  const brands = await prisma.brand.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6 flex flex-col h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Brands</h1>
          <p className="text-sm text-muted-foreground">
            Manage your product brands.
          </p>
        </div>
        <AddBrandDialog />
      </div>

      <div className="flex-1 rounded-xl shadow-sm bg-white dark:bg-gray-950 p-6 border dark:border-gray-800">
        <DataTable columns={columns} data={brands} />
      </div>
    </div>
  );
}
