import prisma from "@/lib/prisma";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./columns";
import { Button } from "@/components/ui/button";
import { Plus, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function FabricRollsPage() {
  const rolls = await prisma.fabricRoll.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      variant: {
        include: {
          product: true,
        }
      }
    }
  });

  const formattedRolls = rolls.map((r: any) => ({
    id: r.id,
    rollNumber: r.rollNumber,
    productName: `${r.variant.product.name} (${r.variant.sku})`,
    originalMeters: r.originalMeters,
    remainingMeters: r.remainingMeters,
    status: r.status,
  }));

  return (
    <div className="space-y-6 flex flex-col h-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/inventory">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Fabric Rolls Management</h1>
            <p className="text-sm text-muted-foreground">
              Track remaining meters for each fabric roll precisely.
            </p>
          </div>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="mr-2 h-4 w-4" /> Register New Roll
        </Button>
      </div>

      <div className="flex-1 rounded-xl shadow-sm bg-white dark:bg-gray-950 p-6 border dark:border-gray-800">
        <DataTable columns={columns} data={formattedRolls} />
      </div>
    </div>
  );
}
