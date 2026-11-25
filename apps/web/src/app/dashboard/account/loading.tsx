import { PageHeaderSkeleton } from "@/features/dashboard/components/page-header-skeleton";
import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";

export default function AccountLoading() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton actions="none" />

      <div className="space-y-6">
        <Skeleton className="h-9 w-full md:hidden" />

        <div className="hidden flex-wrap items-center gap-1.5 rounded-2xl border border-border/60 bg-card/50 p-2.5 md:flex">
          {["w-20", "w-28", "w-24", "w-36", "w-28", "w-32"].map((w, i) => (
            <Skeleton key={i} className={`h-10 ${w} rounded-full`} />
          ))}
        </div>

        <Card>
          <CardHeader className="space-y-1.5">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent className="gap-y-4">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-32" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
