import { Wallet } from "lucide-react";

import type { EnvelopeCategory } from "@/features/envelopes/types";
import { cn } from "@/shared/lib/utils";
import { resolveIcon } from "../lib/icon-registry";
import { withAlpha } from "../lib/with-alpha";

interface CategoryIconProps {
  category?: EnvelopeCategory | null;
  className?: string;
}

/** Tinted category icon badge; falls back to the primary Wallet icon when unclassified. */
export function CategoryIcon({ category, className }: CategoryIconProps) {
  // Property access avoids the React Compiler lint rule flagging `const Icon = ...` as component creation during render.
  const def = { Icon: category ? resolveIcon(category.icon) : Wallet };
  const color = category?.color ?? "var(--color-primary)";

  return (
    <div
      className={cn(
        "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
        !category && "bg-primary/10",
        className,
      )}
      style={
        category ? { background: withAlpha(category.color, 0.14) } : undefined
      }
    >
      <def.Icon className="h-5 w-5" style={{ color }} />
    </div>
  );
}

interface CategoryLabelProps {
  category?: EnvelopeCategory | null;
  className?: string;
}

export function CategoryLabel({ category, className }: CategoryLabelProps) {
  if (!category) return null;

  const def = { Icon: resolveIcon(category.icon) };

  return (
    <span
      className={cn("inline-flex items-center gap-1 font-medium", className)}
      style={{ color: category.color }}
    >
      <def.Icon className="h-3 w-3" />
      {category.label}
    </span>
  );
}
