import { PageHeaderSkeleton } from "@/features/dashboard/components/page-header-skeleton";
import { EnvelopesResultsSkeleton } from "@/features/envelopes/components/envelopes-list-skeleton";
import { Skeleton } from "@/shared/components/ui/skeleton";

export default function EnvelopesLoading() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton withDescription={false} actions="none" />

      <div className="space-y-3">
        <Skeleton className="h-9 w-full md:hidden" />
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <Skeleton className="hidden h-9 w-64 shrink-0 md:block" />
          <Skeleton className="h-9 w-full sm:w-48" />
          <Skeleton className="hidden h-10 w-36 md:ml-auto md:block" />
        </div>
      </div>

      <EnvelopesResultsSkeleton />
    </div>
  );
}
