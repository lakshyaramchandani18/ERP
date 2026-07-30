import prisma from "@/lib/prisma";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./columns";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default async function GRNPage() {
  const grns = await prisma.goodsReceivedNote.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      supplier: true,
      purchaseOrder: true,
    }
  });

  const formattedGRNs = grns.map((grn: any) => ({
    id: grn.id,
    grnNumber: grn.grnNumber,
    poNumber: grn.purchaseOrder?.poNumber || null,
    supplier: { name: grn.supplier.name },
    receivedDate: grn.receivedDate,
    status: grn.status,
  }));

  return (
    <div className="space-y-6 flex flex-col h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Goods Received Notes (GRN)</h1>
          <p className="text-sm text-muted-foreground">
            Track inward inventory from suppliers before verifying invoices.
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="mr-2 h-4 w-4" /> Receive Goods
        </Button>
      </div>

      <div className="flex-1 rounded-xl shadow-sm bg-white dark:bg-gray-950 p-6 border dark:border-gray-800">
        <DataTable columns={columns} data={formattedGRNs} />
      </div>
    </div>
  );
}
