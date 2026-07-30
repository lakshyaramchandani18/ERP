import prisma from "@/lib/prisma";
import { getUdhaarEntries, getUdhaarDashboardStats } from "@/actions/udhaar";
import UdhaarClient from "./UdhaarClient";

export const dynamic = "force-dynamic";

export default async function UdhaarPage() {
  const entriesRes = await getUdhaarEntries();
  const statsRes = await getUdhaarDashboardStats();
  const customers = await prisma.customer.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="p-8 pt-6">
      <UdhaarClient
        entries={entriesRes.entries || []}
        customers={customers}
        stats={statsRes.stats}
      />
    </div>
  );
}
