import prisma from "@/lib/prisma";
import { getPurchaseReturns } from "@/actions/purchase-returns";
import PurchaseReturnsClient from "./PurchaseReturnsClient";

export const dynamic = "force-dynamic";

export default async function PurchaseReturnsPage() {
  const returnsRes = await getPurchaseReturns();
  const suppliers = await prisma.supplier.findMany({ orderBy: { name: "asc" } });
  const variants = await prisma.productVariant.findMany({
    include: {
      product: true,
      color: true,
      size: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-8 pt-6">
      <PurchaseReturnsClient
        returns={returnsRes.returns || []}
        suppliers={suppliers}
        variants={variants}
      />
    </div>
  );
}
