import prisma from "@/lib/prisma";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./columns";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export default async function InventoryPage() {
  const warehouses = await prisma.warehouse.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      branch: true,
    }
  });

  const formattedWarehouses = warehouses.map((w: any) => ({
    id: w.id,
    name: w.name,
    code: w.code,
    address: w.address,
    branch: w.branch ? { name: w.branch.name } : null,
  }));

  return (
    <div className="space-y-6 flex flex-col h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Warehouses & Inventory</h1>
          <p className="text-sm text-muted-foreground">
            Manage your storage locations and initiate stock transfers.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/inventory/rolls">
            <Button variant="outline">
              View Fabric Rolls
            </Button>
          </Link>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="mr-2 h-4 w-4" /> Add Warehouse
          </Button>
        </div>
      </div>

      <div className="flex-1 rounded-xl shadow-sm bg-white dark:bg-gray-950 p-6 border dark:border-gray-800">
        <DataTable columns={columns} data={formattedWarehouses} />
      </div>
    </div>
  );
}
