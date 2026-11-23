import { Skeleton } from "@/shared/components/ui/skeleton";

// Embedded inside the summary panel (no Card wrapper) to match EnvelopeChart without layout shift.
export const EnvelopeChartSkeleton = () => {
  return (
    <div className="flex items-center justify-center py-2">
      <Skeleton className="aspect-square h-48 max-h-48 rounded-full" />
    </div>
  );
};
