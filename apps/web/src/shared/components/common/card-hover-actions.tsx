import { cn } from "@/shared/lib/utils";

interface CardHoverActionsProps {
  children: React.ReactNode;
  className?: string;
  /** Keep buttons visible without hover (used in table rows; cards keep hover-reveal since they have a mobile menu). */
  alwaysVisible?: boolean;
}

/** Desktop-only action wrapper (hidden below `md`; callers pair with a tap-friendly mobile menu). */
export function CardHoverActions({
  children,
  className,
  alwaysVisible = false,
}: CardHoverActionsProps) {
  return (
    <div
      className={cn(
        "hidden items-center gap-1 md:flex",
        alwaysVisible
          ? undefined
          : "translate-x-2 opacity-0 transition-all duration-200 group-focus-within:translate-x-0 group-focus-within:opacity-100 group-hover:translate-x-0 group-hover:opacity-100",
        className,
      )}
    >
      {children}
    </div>
  );
}
