import { Skeleton } from "@/components/ui/skeleton";

export default function SuppliersLoading() {
  return (
    <div className="p-8 space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-64 rounded-xl" />
        <Skeleton className="h-10 w-36 rounded-xl" />
      </div>

      <div className="grid gap-4 grid-cols-2 md:grid-cols-4 lg:grid-cols-7">
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <div key={i} className="p-4 bg-white dark:bg-gray-900 border rounded-2xl space-y-2">
            <Skeleton className="h-4 w-20 rounded" />
            <Skeleton className="h-7 w-24 rounded-lg" />
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-950 border rounded-2xl p-6 h-96 space-y-4">
        <Skeleton className="h-10 w-full rounded-xl" />
        <Skeleton className="h-full w-full rounded-xl" />
      </div>
    </div>
  );
}
