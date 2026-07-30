import { getTailoringOrders } from "@/actions/tailoring";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./columns";
import { Button } from "@/components/ui/button";
import { Scissors } from "lucide-react";
import Link from "next/link";

export default async function TailoringDashboardPage() {
  const { data: orders } = await getTailoringOrders();

  return (
    <div className="space-y-6 flex flex-col h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tailoring & Alterations</h1>
          <p className="text-sm text-muted-foreground">
            Manage custom clothing orders and track them through the stitching pipeline.
          </p>
        </div>
        <Link href="/dashboard/sales/tailoring/new">
          <Button className="bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-600/20">
            <Scissors className="mr-2 h-4 w-4" /> New Order
          </Button>
        </Link>
      </div>

      <div className="flex-1 rounded-xl shadow-sm bg-white dark:bg-gray-950 p-6 border dark:border-gray-800">
        <DataTable columns={columns} data={orders || []} />
      </div>
    </div>
  );
}
