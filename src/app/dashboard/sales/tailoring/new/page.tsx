import { getCustomers } from "@/actions/customers";
import { NewTailoringForm } from "./new-tailoring-form";

export default async function NewTailoringPage() {
  const { data: customers } = await getCustomers();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">New Tailoring Order</h1>
        <p className="text-sm text-muted-foreground">
          Log a custom stitching or alteration job with specific measurements.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-950 p-6 rounded-xl border dark:border-gray-800 shadow-sm">
        <NewTailoringForm customers={customers || []} />
      </div>
    </div>
  );
}
