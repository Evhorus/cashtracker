import { Card, CardContent } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";

// Matches ExpenseCard's single-row height to avoid CLS on mount.
export const ExpenseCardSkeleton = () => {
  return (
    <Card size="sm" className="overflow-hidden">
      <CardContent className="flex items-center gap-3">
        <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-4 w-32 md:w-48" />
          <Skeleton className="h-3 w-20" />
        </div>
        <Skeleton className="h-4 w-16 shrink-0" />
        <Skeleton className="h-8 w-8 shrink-0 rounded-md md:hidden" />
      </CardContent>
    </Card>
  );
};

const ExpensesTableSkeleton = () => {
  return (
    <div className="hidden overflow-hidden rounded-2xl border border-border/60 bg-card/30 md:block">
      <div className="flex items-center gap-4 border-b border-border/60 bg-card/60 px-5 py-3">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="ml-auto h-3 w-14" />
        <Skeleton className="h-3 w-14" />
        <Skeleton className="h-3 w-10" />
      </div>
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="flex items-center gap-3 border-b border-border/60 px-5 py-3.5 last:border-b-0"
        >
          <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="ml-auto h-4 w-24" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-8 w-16 rounded-md" />
        </div>
      ))}
    </div>
  );
};

export const ExpensesListSkeleton = () => {
  return (
    <>
      <div className="space-y-2 md:hidden">
        {[1, 2, 3, 4, 5].map((i) => (
          <ExpenseCardSkeleton key={i} />
        ))}
      </div>
      <ExpensesTableSkeleton />
    </>
  );
};
