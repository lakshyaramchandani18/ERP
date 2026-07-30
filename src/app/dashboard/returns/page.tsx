import prisma from "@/lib/prisma";
import { getSaleReturns } from "@/actions/returns";
import { getPurchaseReturns } from "@/actions/purchase-returns";
import ReturnsHubClient from "./ReturnsHubClient";

export const dynamic = "force-dynamic";

export default async function ReturnsHubPage() {
  const purchaseReturnsRes = await getPurchaseReturns();
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
      <ReturnsHubClient
        purchaseReturns={purchaseReturnsRes.returns || []}
        suppliers={suppliers}
        variants={variants}
      />
    </div>
  );
}
