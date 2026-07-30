import { getDashboardOverviewData } from "@/actions/dashboard";
import DashboardClient from "./DashboardClient";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const result = await getDashboardOverviewData();

  return (
    <div>
      <DashboardClient data={result.success ? result.data : null} />
    </div>
  );
}
