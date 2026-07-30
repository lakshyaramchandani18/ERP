import prisma from "@/lib/prisma";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./columns";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import Link from "next/link";

export default async function SalesHistoryPage() {
  const sales = await prisma.saleOrder.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      customer: true,
      items: {
        include: {
          variant: {
            include: {
              product: true,
              color: true,
              size: true
            }
          }
        }
      }
    }
  });

  const formattedSales = sales.map((sale: any) => ({
    id: sale.id,
    invoiceNumber: sale.invoiceNumber,
    customer: sale.customer ? { name: sale.customer.name, mobile: sale.customer.mobile, address: sale.customer.address } : null,
    saleDate: sale.saleDate,
    grandTotal: sale.grandTotal,
    paymentMethod: sale.paymentMethod,
    items: sale.items,
    subTotal: sale.subTotal,
    totalTax: sale.totalTax,
    totalDiscount: sale.totalDiscount,
    paymentStatus: sale.paymentStatus,
  }));

  return (
    <div className="space-y-6 flex flex-col h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Sales History</h1>
          <p className="text-sm text-muted-foreground">
            View all generated invoices and past transactions.
          </p>
        </div>
        <Link href="/dashboard/sales/pos">
          <Button className="bg-green-600 hover:bg-green-700 text-white shadow-md shadow-green-600/20">
            <ShoppingCart className="mr-2 h-4 w-4" /> Open POS
          </Button>
        </Link>
      </div>

      <div className="flex-1 rounded-xl shadow-sm bg-white dark:bg-gray-950 p-6 border dark:border-gray-800">
        <DataTable columns={columns} data={formattedSales} />
      </div>
    </div>
  );
}
