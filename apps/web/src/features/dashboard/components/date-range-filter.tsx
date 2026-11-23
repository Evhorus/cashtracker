"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CalendarIcon, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { DateRange } from "react-day-picker";

import { Button } from "@/shared/components/ui/button";
import { Calendar } from "@/shared/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import type { SupportedLocale } from "@/shared/config/i18n/config";
import {
  DATE_FNS_LOCALES,
  formatCalendarDateForApi,
  formatCalendarDateShort,
  hasMultipleYears,
  parseCalendarDate,
  toFormCalendarDate,
} from "@/shared/utils/date-helpers";

interface DateRangeFilterProps {
  startDate?: string;
  endDate?: string;
  /** Last user-drawn range boundary; preserved when PeriodFilterSelect narrows startDate/endDate. */
  markedStart?: string;
  markedEnd?: string;
}

// Exact date range (mutually exclusive with YearFilterSelect). Requires explicit Apply because
// react-day-picker emits a complete {from, to} pair on the very first click.
export const DateRangeFilter = ({
  startDate,
  endDate,
  markedStart,
  markedEnd,
}: DateRangeFilterProps) => {
  const t = useTranslations("statistics");
  const tCommon = useTranslations("common");
  const locale = useLocale() as SupportedLocale;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);

  // Prefer marked boundary so PeriodFilterSelect narrowing doesn't overwrite the displayed range.
  const shownStart = markedStart ?? startDate;
  const shownEnd = markedEnd ?? endDate;

  // UTC-anchored for label formatting; Calendar widgets require browser-local Dates (see below).
  const appliedRange: DateRange | undefined =
    shownStart && shownEnd
      ? { from: parseCalendarDate(shownStart), to: parseCalendarDate(shownEnd) }
      : undefined;

  // Browser-local Dates for Calendar selected/defaultMonth (avoids off-by-one-day behind UTC).
  const appliedRangeForCalendar: DateRange | undefined = appliedRange
    ? {
        from: toFormCalendarDate(appliedRange.from!),
        to: toFormCalendarDate(appliedRange.to!),
      }
    : undefined;

  // Local-anchored draft selection; written to URL only on Apply via formatCalendarDateForApi.
  const [draftRange, setDraftRange] = useState(appliedRangeForCalendar);

  // Reset draft on open so a cancelled edit never leaks into the next open.
  const handleOpenChange = (next: boolean) => {
    if (next) setDraftRange(appliedRangeForCalendar);
    setOpen(next);
  };

  const navigate = (params: URLSearchParams) => {
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  };

  const handleApply = () => {
    if (!draftRange?.from || !draftRange?.to) return;
    const params = new URLSearchParams(searchParams);
    params.delete("year");
    // Clear period params so PeriodFilterSelect resets to all-time.
    params.delete("period");
    params.delete("periodValue");
    const start = formatCalendarDateForApi(draftRange.from);
    const end = formatCalendarDateForApi(draftRange.to);
    params.set("startDate", start);
    params.set("endDate", end);
    // Persist the drawn boundary separately so PeriodFilterSelect keeps clipping to it.
    params.set("markedStart", start);
    params.set("markedEnd", end);
    navigate(params);
    setOpen(false);
  };

  const handleClear = () => {
    const params = new URLSearchParams(searchParams);
    params.delete("startDate");
    params.delete("endDate");
    params.delete("period");
    params.delete("periodValue");
    params.delete("markedStart");
    params.delete("markedEnd");
    navigate(params);
    setOpen(false);
  };

  // Show years only when the range crosses a calendar year boundary.
  const spansMultipleYears =
    appliedRange &&
    hasMultipleYears([
      appliedRange.from!.getUTCFullYear(),
      appliedRange.to!.getUTCFullYear(),
    ]);
  const label = appliedRange
    ? `${formatCalendarDateShort(appliedRange.from!, locale, spansMultipleYears)} – ${formatCalendarDateShort(appliedRange.to!, locale, spansMultipleYears)}`
    : t("dateRangePlaceholder");

  return (
    <div className="flex items-center gap-1">
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger
          render={
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 font-medium"
              aria-label={t("filterDateRange")}
            >
              <CalendarIcon className="h-3.5 w-3.5" />
              {label}
            </Button>
          }
        />
        <PopoverContent className="w-auto p-0" align="end">
          {/* Two independent single-date calendars: numberOfMonths={2} links month/year navigation across panels. */}
          <div className="flex flex-col divide-y divide-border/60 sm:flex-row sm:divide-x sm:divide-y-0">
            <div>
              <p className="px-3 pt-3 text-xs font-medium text-muted-foreground">
                {t("fromDate")}
              </p>
              <Calendar
                mode="single"
                selected={draftRange?.from}
                defaultMonth={draftRange?.from}
                onSelect={(date) =>
                  setDraftRange((prev) => ({ from: date, to: prev?.to }))
                }
                disabled={draftRange?.to ? { after: draftRange.to } : undefined}
                locale={DATE_FNS_LOCALES[locale]}
                captionLayout="dropdown"
              />
            </div>
            <div>
              <p className="px-3 pt-3 text-xs font-medium text-muted-foreground">
                {t("toDate")}
              </p>
              <Calendar
                mode="single"
                selected={draftRange?.to}
                defaultMonth={draftRange?.to ?? draftRange?.from}
                onSelect={(date) =>
                  setDraftRange((prev) => ({ from: prev?.from, to: date }))
                }
                disabled={
                  draftRange?.from ? { before: draftRange.from } : undefined
                }
                locale={DATE_FNS_LOCALES[locale]}
                captionLayout="dropdown"
              />
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 border-t border-border/60 p-3">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
            >
              {t("clearDateRange")}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setOpen(false)}
            >
              {tCommon("cancel")}
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={!draftRange?.from || !draftRange?.to}
              onClick={handleApply}
            >
              {t("applyDateRange")}
            </Button>
          </div>
        </PopoverContent>
      </Popover>
      {appliedRange && (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={handleClear}
          aria-label={t("clearDateRange")}
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  );
};
