import { Skeleton } from "@/shared/components/ui/skeleton";

interface PageHeaderSkeletonProps {
  withBackButton?: boolean;
  /** Set false when the matching PageHeader omits `description` to avoid layout shift. */
  withDescription?: boolean;
  /** Matches the page's responsive action slot layout to prevent shift. */
  actions?: "none" | "single" | "icon-pair" | "edit-delete";
  withBreadcrumb?: boolean;
}

export const PageHeaderSkeleton = ({
  withBackButton = true,
  withDescription = true,
  actions = "single",
  withBreadcrumb = false,
}: PageHeaderSkeletonProps) => {
  const hasMobileAction = actions !== "none";

  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        {withBackButton && (
          <Skeleton className="h-10 w-10 shrink-0 rounded-full md:hidden" />
        )}

        <div className="space-y-1.5">
          <Skeleton className="h-8 w-48 md:w-64" />
          {withDescription && <Skeleton className="h-4 w-32" />}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-4 md:flex-col md:items-end md:gap-3">
        {withBreadcrumb && <Skeleton className="hidden h-4 w-48 md:block" />}

        {actions === "single" && (
          <Skeleton className="hidden h-10 w-36 md:block" />
        )}
        {actions === "icon-pair" && (
          <div className="hidden items-center gap-1 md:flex">
            <Skeleton className="h-9 w-9 rounded-md" />
            <Skeleton className="h-9 w-9 rounded-md" />
          </div>
        )}
        {actions === "edit-delete" && (
          <div className="hidden items-center gap-2 md:flex">
            <Skeleton className="h-9 w-20 rounded-md" />
            <Skeleton className="h-9 w-24 rounded-md" />
          </div>
        )}

        {hasMobileAction && (
          <Skeleton className="h-9 w-9 rounded-md md:hidden" />
        )}
      </div>
    </div>
  );
};
