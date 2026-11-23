import type { LucideIcon } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

// Icon-only mode uses a hover-only tint; labeled mode swaps to a permanently tinted Button variant.
const toneClass = {
  default: "hover:bg-primary/10 hover:text-primary",
  destructive: "hover:bg-destructive/10 hover:text-destructive",
} as const;

const toneVariant = {
  default: "secondary",
  destructive: "destructive",
} as const;

interface CardActionButtonProps extends Omit<
  React.ComponentProps<typeof Button>,
  "variant" | "size" | "children"
> {
  icon: LucideIcon;
  /** Accessible name (sr-only by default; visible when `showLabelOnDesktop` is set). */
  label: string;
  /** Picks the tint (hover-only when icon-only; permanent variant when labeled). */
  tone?: keyof typeof toneClass;
  /** Renders `label` visibly as a permanently tinted pill instead of an icon-only ghost button. */
  showLabelOnDesktop?: boolean;
}

/** Action button for cards/rows/headers; forwards extra props so Dialog/AlertDialogTrigger `render` can merge handlers. */
export function CardActionButton({
  icon: Icon,
  label,
  tone = "default",
  showLabelOnDesktop = false,
  className,
  ...props
}: CardActionButtonProps) {
  return (
    <Button
      variant={showLabelOnDesktop ? toneVariant[tone] : "ghost"}
      size={showLabelOnDesktop ? "default" : "icon"}
      className={cn(
        !showLabelOnDesktop && "h-9 w-9 text-muted-foreground",
        !showLabelOnDesktop && toneClass[tone],
        className,
      )}
      {...props}
    >
      <Icon className="h-4 w-4" />
      {showLabelOnDesktop ? label : <span className="sr-only">{label}</span>}
    </Button>
  );
}
