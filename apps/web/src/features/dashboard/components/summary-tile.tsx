import Link from "next/link";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/shared/lib/utils";

interface SummaryTileProps {
  icon: LucideIcon;
  label: string;
  value: number | string;
  /** Icon tint: "primary" (default), "alert" (non-zero warning count), or "muted" (zero count). */
  tone?: "primary" | "alert" | "muted";
  href: string;
}

export function SummaryTile({
  icon: Icon,
  label,
  value,
  tone = "primary",
  href,
}: SummaryTileProps) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-xl border border-border/60 bg-card/50 px-4 py-3.5 transition-colors hover:border-border hover:bg-card"
    >
      <div
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
          tone === "alert" && "bg-amber-500/10 text-amber-500",
          tone === "muted" && "bg-muted text-muted-foreground",
          tone === "primary" && "bg-primary/10 text-primary",
        )}
      >
        <Icon className="h-4 w-4" />
      </div>
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="ml-auto font-mono text-lg font-semibold">{value}</span>
    </Link>
  );
}
