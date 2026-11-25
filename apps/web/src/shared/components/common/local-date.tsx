"use client";

import { useSyncExternalStore } from "react";
import { useLocale } from "next-intl";

import { formatDate, formatMonthYear } from "@/shared/utils/date-helpers";

const emptySubscribe = () => () => {};
const useIsClient = () =>
  useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

interface LocalDateProps {
  /** Timestamp to format in the visitor's timezone; omitted renders today. */
  value?: Date | string | number;
  variant?: "date" | "monthYear";
  className?: string;
}

// Defers timezone-dependent formatting to client mount so UTC servers (Vercel)
// never shift evening timestamps into the next day or cause hydration mismatches.
export function LocalDate({
  value,
  variant = "date",
  className,
}: LocalDateProps) {
  const locale = useLocale();
  const isClient = useIsClient();

  if (!isClient) {
    return (
      <span className={className} aria-hidden="true">
        {"\u00A0"}
      </span>
    );
  }

  const target = value ?? new Date();
  const formatted =
    variant === "monthYear"
      ? formatMonthYear(target, locale)
      : formatDate(target, locale);

  return <time className={className}>{formatted}</time>;
}
