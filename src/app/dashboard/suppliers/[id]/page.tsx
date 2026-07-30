import { getSupplierDetails } from "@/actions/suppliers";
import SupplierAccountClient from "./SupplierAccountClient";

export const dynamic = "force-dynamic";

export default async function SupplierDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const res = await getSupplierDetails(resolvedParams.id);

  if (!res.success || !res.supplier) {
    return (
      <div className="p-8 text-center text-red-500 font-semibold bg-red-50 rounded-2xl m-6">
        Supplier account not found.
      </div>
    );
  }

  return (
    <div className="p-8 pt-6">
      <SupplierAccountClient
        supplier={res.supplier}
        upcomingBills={res.upcomingBills || []}
        overdueBills={res.overdueBills || []}
        ledger={res.ledger || []}
      />
    </div>
  );
}
