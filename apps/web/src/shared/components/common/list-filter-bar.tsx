import { cn } from "@/shared/lib/utils";

interface ListFilterBarProps {
  filters?: React.ReactNode;
  renderSearch: (className: string) => React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export function ListFilterBar({
  filters,
  renderSearch,
  actions,
  className,
}: ListFilterBarProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 md:flex-row md:items-center",
        className,
      )}
    >
      {renderSearch("w-full md:w-64 md:shrink-0")}
      {filters && <div className="min-w-0">{filters}</div>}
      {actions && (
        <div className="hidden md:ml-auto md:flex md:items-center md:gap-2">
          {actions}
        </div>
      )}
    </div>
  );
}
