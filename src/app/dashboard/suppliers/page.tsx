import prisma from "@/lib/prisma";
import { getSupplierDashboardStats } from "@/actions/suppliers";
import SuppliersListClient from "./SuppliersListClient";

export const dynamic = "force-dynamic";

export default async function SuppliersPage() {
  const suppliers = await prisma.supplier.findMany({
    orderBy: { name: "asc" },
  });

  const statsRes = await getSupplierDashboardStats();

  return (
    <div className="p-8 pt-6">
      <SuppliersListClient
        suppliers={suppliers}
        stats={statsRes.stats}
      />
    </div>
  );
}
