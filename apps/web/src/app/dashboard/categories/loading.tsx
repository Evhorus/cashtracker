import { PageHeaderSkeleton } from "@/features/dashboard/components/page-header-skeleton";
import { Skeleton } from "@/shared/components/ui/skeleton";

export default function CategoriesLoading() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton withDescription={false} />

      <div className="space-y-3">
        <Skeleton className="h-9 w-full md:hidden" />
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <Skeleton className="hidden h-9 w-64 shrink-0 md:block" />
          <Skeleton className="h-9 w-full sm:w-72" />
          <Skeleton className="hidden h-10 w-36 md:ml-auto md:block" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:hidden">
        {Array.from({ length: 5 }, (_, i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
      <Skeleton className="hidden h-96 rounded-xl md:block" />
    </div>
  );
}
