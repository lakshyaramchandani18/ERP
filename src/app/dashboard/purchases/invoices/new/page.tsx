import prisma from "@/lib/prisma";
import { PurchaseInvoiceClient } from "./purchase-invoice-client";

export default async function NewPurchaseInvoicePage() {
  const suppliers = await prisma.supplier.findMany({
    orderBy: { name: "asc" }
  });

  const variants = await prisma.productVariant.findMany({
    include: {
      product: true,
      color: true,
      size: true,
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">New Purchase Invoice</h1>
      </div>
      <PurchaseInvoiceClient suppliers={suppliers} variants={variants} />
    </div>
  );
}
