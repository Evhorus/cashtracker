import { useTranslations } from "next-intl";

import {
  EnvelopeHelpers,
  type EnvelopeProgressStatus,
} from "@/features/envelopes/lib/envelope-helpers";
import { cn } from "@/shared/lib/utils";

interface EnvelopeStatusBadgeProps {
  status: EnvelopeProgressStatus;
  /** "badge" (default): tinted pill; "text": plain colored text. */
  variant?: "badge" | "text";
  className?: string;
}

/** Shared envelope status renderer (stays a Server Component via next-intl's react-server `useTranslations`). */
export function EnvelopeStatusBadge({
  status,
  variant = "badge",
  className,
}: EnvelopeStatusBadgeProps) {
  const t = useTranslations("envelopes.status");
  const label = t(status);

  if (variant === "text") {
    return (
      <span
        className={cn(
          "text-sm font-semibold",
          EnvelopeHelpers.getStatusTextColorClass(status),
          className,
        )}
      >
        {label}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-block rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap",
        EnvelopeHelpers.getStatusBadgeClass(status),
        className,
      )}
    >
      {label}
    </span>
  );
}
