import { Skeleton } from "@/components/ui/skeleton";

export default function PosLoading() {
  return (
    <div className="flex flex-col lg:flex-row h-screen gap-4 p-4 bg-gray-100 dark:bg-gray-900 animate-pulse">
      <div className="flex-1 flex flex-col space-y-4">
        <div className="bg-white dark:bg-gray-950 p-4 rounded-2xl border flex items-center justify-between">
          <Skeleton className="h-10 w-96 rounded-xl" />
          <Skeleton className="h-8 w-48 rounded-xl" />
        </div>

        <div className="bg-white dark:bg-gray-950 p-3 rounded-2xl border flex space-x-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-8 w-24 rounded-xl" />
          ))}
        </div>

        <div className="grid gap-3 grid-cols-3 md:grid-cols-4 lg:grid-cols-5 flex-1">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
            <div key={i} className="p-4 bg-white dark:bg-gray-950 border rounded-2xl space-y-3">
              <Skeleton className="h-4 w-20 rounded" />
              <Skeleton className="h-6 w-32 rounded-lg" />
              <Skeleton className="h-5 w-16 rounded text-right ml-auto" />
            </div>
          ))}
        </div>
      </div>

      <div className="w-full lg:w-[420px] bg-white dark:bg-gray-950 rounded-2xl border p-4 flex flex-col justify-between space-y-4">
        <Skeleton className="h-12 w-full rounded-xl" />
        <div className="space-y-3 flex-1">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-14 w-full rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-16 w-full rounded-xl" />
      </div>
    </div>
  );
}
