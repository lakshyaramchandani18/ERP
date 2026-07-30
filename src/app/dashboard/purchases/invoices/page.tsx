import prisma from "@/lib/prisma";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./columns";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export default async function PurchaseInvoicesPage() {
  const invoices = await prisma.purchaseInvoice.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      supplier: true,
    }
  });

  const formattedInvoices = invoices.map((inv: any) => ({
    id: inv.id,
    invoiceNumber: inv.invoiceNumber,
    supplier: { name: inv.supplier.name },
    invoiceDate: inv.invoiceDate,
    dueDate: inv.dueDate,
    grandTotal: inv.grandTotal,
    paymentStatus: inv.paymentStatus,
  }));

  return (
    <div className="space-y-6 flex flex-col h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Purchase Invoices</h1>
          <p className="text-sm text-muted-foreground">
            Manage supplier bills and track payment status.
          </p>
        </div>
        <Link href="/dashboard/purchases/invoices/new">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="mr-2 h-4 w-4" /> Add Invoice
          </Button>
        </Link>
      </div>

      <div className="flex-1 rounded-xl shadow-sm bg-white dark:bg-gray-950 p-6 border dark:border-gray-800">
        <DataTable columns={columns} data={formattedInvoices} />
      </div>
    </div>
  );
}
