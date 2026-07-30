import prisma from "@/lib/prisma";
import CollegeClient from "./CollegeClient";

export default async function CollegeFeesPage() {
  const fees = await prisma.collegeFee.findMany({
    orderBy: { dueDate: "asc" },
  });

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">College Fees Tracker</h2>
      </div>
      <CollegeClient initialFees={fees} />
    </div>
  );
}
