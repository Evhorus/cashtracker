import type { LucideIcon } from "lucide-react";

import { cn } from "@/shared/lib/utils";
import { withAlpha } from "../lib/with-alpha";

interface CategoryIconBadgeProps {
  /** Pre-resolved via resolveIcon() by the caller; calling resolveIcon() inside a component body trips react-compiler's static-components rule. */
  Icon: LucideIcon;
  color: string;
  className?: string;
  iconClassName?: string;
}

export function CategoryIconBadge({
  Icon,
  color,
  className,
  iconClassName = "h-4 w-4",
}: CategoryIconBadgeProps) {
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-lg",
        className,
      )}
      style={{ background: withAlpha(color, 0.14), color }}
    >
      <Icon className={iconClassName} />
    </span>
  );
}
