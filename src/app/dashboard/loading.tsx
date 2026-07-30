import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="p-8 space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64 rounded-xl" />
          <Skeleton className="h-4 w-96 rounded-lg" />
        </div>
        <Skeleton className="h-10 w-32 rounded-xl" />
      </div>

      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-6 bg-white dark:bg-gray-900 border rounded-2xl space-y-3">
            <Skeleton className="h-5 w-24 rounded" />
            <Skeleton className="h-8 w-36 rounded-lg" />
            <Skeleton className="h-3 w-20 rounded" />
          </div>
        ))}
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <div className="p-6 bg-white dark:bg-gray-900 border rounded-2xl h-80 space-y-4">
          <Skeleton className="h-6 w-48 rounded" />
          <Skeleton className="h-full w-full rounded-xl" />
        </div>
        <div className="p-6 bg-white dark:bg-gray-900 border rounded-2xl h-80 space-y-4">
          <Skeleton className="h-6 w-48 rounded" />
          <Skeleton className="h-full w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
