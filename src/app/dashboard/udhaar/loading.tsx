import { Skeleton } from "@/components/ui/skeleton";

export default function UdhaarLoading() {
  return (
    <div className="p-8 space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-64 rounded-xl" />
        <Skeleton className="h-10 w-36 rounded-xl" />
      </div>

      <div className="bg-white dark:bg-gray-950 border rounded-2xl p-6 h-96 space-y-4">
        <Skeleton className="h-10 w-full rounded-xl" />
        <Skeleton className="h-full w-full rounded-xl" />
      </div>
    </div>
  );
}
