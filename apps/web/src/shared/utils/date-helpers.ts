import { TZDate } from "@date-fns/tz";
import { format, formatDistanceToNow, parseISO } from "date-fns";
import { enUS, es } from "date-fns/locale";

import type { SupportedLocale } from "@/shared/config/i18n/config";

// Display formatters take locale explicitly because they run across server/client for different readers.
/** Exported for third-party date pickers (e.g. react-day-picker) needing a date-fns Locale. */
export const DATE_FNS_LOCALES = { es, en: enUS } as const satisfies Record<
  SupportedLocale,
  unknown
>;

// Per-locale patterns: Spanish requires "de" separators that English omits.
const LONG_DATE_PATTERN = {
  es: "EEEE, d 'de' MMMM 'de' yyyy",
  en: "EEEE, d MMMM yyyy",
} as const satisfies Record<SupportedLocale, string>;

function getDeviceTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
}

export function parseDateInput(dateInput: Date | string | number): Date {
  if (typeof dateInput === "string") {
    return parseISO(dateInput);
  }
  return new Date(dateInput);
}

/**
 * Parses a date-only API value ("yyyy-MM-dd" prefix) into a UTC-midnight Date so server/client
 * runtimes always read identical Y/M/D via UTC getters. For form Calendar state, use `toFormCalendarDate`.
 */
export function parseCalendarDate(dateInput: string): Date {
  const [year, month, day] = dateInput.slice(0, 10).split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

/** Converts a UTC-anchored calendar date into a browser-local Date for react-day-picker (client-only). */
export function toFormCalendarDate(date: Date): Date {
  return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

/** Formats a browser-local form Date as "yyyy-MM-dd" using local getters (avoids `toISOString()` UTC day shifts). */
export function formatCalendarDateForApi(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

function toDeviceTimeZone(dateInput: Date): Date {
  return new TZDate(dateInput, getDeviceTimeZone());
}

/** Formats a UTC-anchored calendar date using UTC getters (use this, not `formatDate`, for `expense.date`). */
export function formatCalendarDate(
  date: Date,
  locale: SupportedLocale,
): string {
  return format(new TZDate(date, "UTC"), LONG_DATE_PATTERN[locale], {
    locale: DATE_FNS_LOCALES[locale],
  });
}

/** Compact "d MMM" (or "d MMM yyyy" with `includeYear`) using UTC getters for calendar dates. */
export function formatCalendarDateShort(
  date: Date,
  locale: SupportedLocale,
  includeYear = false,
): string {
  return format(new TZDate(date, "UTC"), includeYear ? "d MMM yyyy" : "d MMM", {
    locale: DATE_FNS_LOCALES[locale],
  });
}

export function formatDate(
  dateInput: Date | string | number,
  locale: SupportedLocale,
): string {
  return format(
    toDeviceTimeZone(parseDateInput(dateInput)),
    LONG_DATE_PATTERN[locale],
    { locale: DATE_FNS_LOCALES[locale] },
  );
}

/** Compact "mmm yyyy" format in the device timezone. */
export function formatMonthYear(
  dateInput: Date | string | number,
  locale: SupportedLocale,
): string {
  return format(toDeviceTimeZone(parseDateInput(dateInput)), "MMM yyyy", {
    locale: DATE_FNS_LOCALES[locale],
  });
}

/** Relative timestamp — diff between two instants is timezone-independent. */
export function formatRelativeTime(
  dateInput: Date | string | number,
  locale: SupportedLocale,
): string {
  return formatDistanceToNow(parseDateInput(dateInput), {
    locale: DATE_FNS_LOCALES[locale],
    addSuffix: true,
  });
}

/** Today as a browser-local calendar date for client-side form state (not UTC-anchored). */
export function getToday(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export function hasMultipleYears(years: number[]): boolean {
  return new Set(years).size > 1;
}

/** Formats a "YYYY-MM" key as a short month name; parsed in UTC to avoid shifting a month back behind UTC. */
export function formatMonthKey(
  monthKey: string,
  locale: SupportedLocale,
  includeYear: boolean,
): string {
  const [year, month] = monthKey.split("-").map(Number);

  if (!year || !month) return monthKey;

  return format(
    new TZDate(Date.UTC(year, month - 1, 1), "UTC"),
    includeYear ? "MMM yyyy" : "MMM",
    { locale: DATE_FNS_LOCALES[locale] },
  );
}

/** Compact UTC calendar date span (omits repeated year when both ends share one). */
export function formatCalendarDateRange(
  first: Date,
  last: Date,
  locale: SupportedLocale,
): string {
  const lastLabel = formatCalendarDateShort(last, locale, true);
  if (first.getTime() === last.getTime()) return lastLabel;
  const sameYear = first.getUTCFullYear() === last.getUTCFullYear();
  return `${formatCalendarDateShort(first, locale, !sameYear)} – ${lastLabel}`;
}
