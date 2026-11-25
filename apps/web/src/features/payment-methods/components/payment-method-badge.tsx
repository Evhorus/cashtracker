import { cn } from "@/shared/lib/utils";
import type { ExpensePaymentMethod } from "../types";

interface PaymentMethodBadgeProps {
  method: ExpensePaymentMethod;
  /** "pill" for standalone display (detail page); "inline" for list rows. */
  variant?: "inline" | "pill";
  className?: string;
}

export function PaymentMethodBadge({
  method,
  variant = "inline",
  className,
}: PaymentMethodBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex min-w-0 items-center gap-1.5",
        variant === "pill" &&
          "w-fit rounded-full bg-background/50 px-2.5 py-1 text-xs font-medium sm:text-sm",
        className,
      )}
    >
      <span
        aria-hidden
        className="h-2 w-2 shrink-0 rounded-full"
        style={{ background: method.color }}
      />
      <span className="truncate">{method.name}</span>
    </span>
  );
}
