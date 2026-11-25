import type { LucideIcon } from "lucide-react";

import { Heading, Text } from "@/shared/components/common/typography";
import { Card } from "@/shared/components/ui/card";
import { cn } from "@/shared/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  /** "filtered" (default): compact, no CTA. "first-run": taller, serif heading, optional CTA. */
  variant?: "filtered" | "first-run";
  /** Small all-caps line above the title (first-run only). */
  eyebrow?: string;
  /** CTA button (for "first-run", not "filtered"). */
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  variant = "filtered",
  eyebrow,
  action,
  className,
}: EmptyStateProps) {
  const isFirstRun = variant === "first-run";

  return (
    <Card
      className={cn(
        "animate-fade-in border-0 bg-card/50 text-center shadow-sm",
        isFirstRun ? "px-6 py-16" : "p-12",
        className,
      )}
    >
      <div
        className={cn(
          "mx-auto space-y-4",
          isFirstRun ? "max-w-sm space-y-5" : "max-w-md",
        )}
      >
        <div
          className={cn(
            "mx-auto flex items-center justify-center rounded-full bg-primary/10",
            isFirstRun ? "h-20 w-20" : "h-16 w-16",
          )}
        >
          <Icon
            className={cn("text-primary", isFirstRun ? "h-9 w-9" : "h-8 w-8")}
          />
        </div>

        <div className="space-y-2">
          {isFirstRun && eyebrow && (
            <p className="font-mono text-xs font-semibold tracking-widest text-muted-foreground uppercase">
              {eyebrow}
            </p>
          )}
          <Heading as="h3" size={isFirstRun ? "display" : "empty"}>
            {title}
          </Heading>
          <Text>{description}</Text>
        </div>

        {action && <div className="flex justify-center pt-1">{action}</div>}
      </div>
    </Card>
  );
}
