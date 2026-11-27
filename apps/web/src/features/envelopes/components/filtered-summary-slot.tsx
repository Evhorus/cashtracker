"use client";

import type { ReactNode } from "react";

import { useFilterPending } from "@/shared/components/common/filter-pending";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { cn } from "@/shared/lib/utils";

function useHasOptimisticFilter() {
  const { isPending, effectiveSearchParams } = useFilterPending();
  const hasOptimisticFilter = Boolean(
    effectiveSearchParams.get("methods") ||
    effectiveSearchParams.get("search") ||
    effectiveSearchParams.get("startDate") ||
    effectiveSearchParams.get("endDate"),
  );
  return { isPending, hasOptimisticFilter };
}

export function FilteredSummaryLineSkeleton() {
  return (
    <div className="flex h-14 items-center justify-between gap-3 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2">
      <div className="space-y-1.5">
        <Skeleton className="h-3 w-14" />
        <Skeleton className="h-4 w-28" />
      </div>
      <div className="space-y-1.5 text-right">
        <Skeleton className="ml-auto h-4 w-20" />
        <Skeleton className="ml-auto h-3 w-14" />
      </div>
    </div>
  );
}

export function FilteredSummaryHalfSkeleton() {
  return (
    <div className="flex flex-col justify-center gap-1.5 border-l border-primary/30 bg-primary/10 px-3 py-3 md:px-4 md:py-5">
      <Skeleton className="h-3 w-14" />
      <Skeleton className="h-4 w-24" />
      <Skeleton className="mt-0.5 h-5 w-24 md:mt-1 md:h-6" />
      <Skeleton className="h-3 w-16" />
    </div>
  );
}

export function FilteredSummaryLineSlot({ children }: { children: ReactNode }) {
  const { isPending, hasOptimisticFilter } = useHasOptimisticFilter();
  if (!hasOptimisticFilter) return null;
  if (isPending) return <FilteredSummaryLineSkeleton />;
  return <>{children}</>;
}

export function UnlimitedSummaryGrid({
  totalSlot,
  filteredSlot,
}: {
  totalSlot: ReactNode;
  filteredSlot: ReactNode;
}) {
  const { isPending, hasOptimisticFilter } = useHasOptimisticFilter();
  return (
    <div
      className={cn(
        "grid min-h-24 overflow-hidden rounded-lg bg-secondary/40 md:min-h-36",
        hasOptimisticFilter ? "grid-cols-2" : "grid-cols-1",
      )}
    >
      {totalSlot}
      {hasOptimisticFilter &&
        (isPending ? <FilteredSummaryHalfSkeleton /> : filteredSlot)}
    </div>
  );
}
