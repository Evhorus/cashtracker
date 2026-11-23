import { Skeleton } from "@/shared/components/ui/skeleton";

export function DashboardSummarySkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start gap-4">
        <Skeleton className="h-44 w-full rounded-2xl md:w-[calc(50%-0.5rem)]" />
        <div className="flex w-full flex-col gap-4 md:w-[calc(50%-0.5rem)]">
          <Skeleton className="h-[68px] rounded-xl" />
          <Skeleton className="h-[68px] rounded-xl" />
        </div>
      </div>
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
        <Skeleton className="h-52 rounded-2xl" />
        <Skeleton className="h-52 rounded-2xl" />
      </div>
    </div>
  );
}
