import { DashboardSummarySkeleton } from "@/features/dashboard/components/dashboard-summary-skeleton";
import { Skeleton } from "@/shared/components/ui/skeleton";

export default function DashboardLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-4 w-52" />
        <Skeleton className="mt-0.5 h-9 w-56" />
      </div>

      <DashboardSummarySkeleton />
    </div>
  );
}
