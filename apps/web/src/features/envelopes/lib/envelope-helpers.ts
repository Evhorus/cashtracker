import {
  ENVELOPE_SORTS,
  MAX_PAGE_SIZE,
  type EnvelopeProgressStatus,
  type EnvelopeSort,
  type EnvelopeStatusFilter,
} from "@cashtracker/shared";

import type { SupportedLocale } from "@/shared/config/i18n/config";
import {
  formatCalendarDateRange,
  formatMonthYear,
} from "@/shared/utils/date-helpers";
import type { Envelope } from "@/features/envelopes/types";

export type { EnvelopeProgressStatus, EnvelopeSort, EnvelopeStatusFilter };

export const ENVELOPE_STATUS_TAB_VALUES = [
  "all",
  "normal",
  "warning",
  "exceeded",
  "unlimited",
  "alert",
] as const satisfies readonly EnvelopeStatusFilter[];

export type EnvelopeStatusTab = (typeof ENVELOPE_STATUS_TAB_VALUES)[number];

export const ENVELOPES_MAX_PAGE_SIZE = MAX_PAGE_SIZE;

export const ENVELOPE_SORT_VALUES = ENVELOPE_SORTS;

export function parseEnvelopeSort(
  value: string | null | undefined,
): EnvelopeSort {
  return value === "oldest" ? "oldest" : "recent";
}

export const ENVELOPES_DEFAULT_PAGE_SIZE = 10;

export const ENVELOPES_PAGE_SIZE_OPTIONS = [
  10,
  20,
  ENVELOPES_MAX_PAGE_SIZE,
] as const;

export const EnvelopeHelpers = {
  getAmount: (envelope: Envelope): number | null =>
    envelope.amount === null ? null : Number(envelope.amount),

  getSpent: (envelope: Envelope): number => Number(envelope.spent),

  getRemaining: (envelope: Envelope): number | null => {
    if (envelope.amount === null) return null;
    return Number(envelope.amount) - Number(envelope.spent);
  },

  getPercentage: (envelope: Envelope): number | null => {
    if (envelope.amount === null) return null;
    const limit = Number(envelope.amount);
    if (!Number.isFinite(limit) || limit <= 0) return null;
    return (Number(envelope.spent) / limit) * 100;
  },

  getStatusTextColorClass: (status: EnvelopeProgressStatus): string => {
    switch (status) {
      case "exceeded":
        return "text-destructive";
      case "warning":
        return "text-amber-500";
      case "unlimited":
        return "text-muted-foreground";
      case "normal":
        return "text-primary";
    }
  },

  // Targets Base UI Progress's inner indicator slot (`Root > Track > Indicator`).
  getStatusProgressBarColorClass: (status: EnvelopeProgressStatus): string => {
    switch (status) {
      case "exceeded":
        return "[&_[data-slot=progress-indicator]]:bg-destructive";
      case "warning":
        return "[&_[data-slot=progress-indicator]]:bg-amber-500";
      default:
        return "[&_[data-slot=progress-indicator]]:bg-primary";
    }
  },

  getStatusBarColorClass: (status: EnvelopeProgressStatus): string => {
    switch (status) {
      case "exceeded":
        return "bg-destructive";
      case "warning":
        return "bg-amber-500";
      default:
        return "bg-primary";
    }
  },

  getStatusBadgeClass: (status: EnvelopeProgressStatus): string => {
    switch (status) {
      case "exceeded":
        return "bg-destructive/10 text-destructive";
      case "warning":
        return "bg-amber-500/10 text-amber-500";
      case "unlimited":
        return "bg-muted text-muted-foreground";
      case "normal":
        return "bg-primary/10 text-primary";
    }
  },

  formatPeriod: (
    envelope: Pick<Envelope, "expenseDateRange" | "createdAt">,
    locale: SupportedLocale,
  ): string =>
    envelope.expenseDateRange
      ? formatCalendarDateRange(
          envelope.expenseDateRange.first,
          envelope.expenseDateRange.last,
          locale,
        )
      : formatMonthYear(envelope.createdAt, locale),
};
