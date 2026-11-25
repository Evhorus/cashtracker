/**
 * Pure UTC calendar math for statistics period shortcuts (month/quarter/fourMonth/semester),
 * matching `parseCalendarDate`'s UTC anchor across server/client runtimes.
 */

export type PeriodType = "month" | "quarter" | "fourMonth" | "semester";

export interface PeriodInstance {
  /** Stable URL key (`periodValue`). */
  value: string;
  /** "YYYY-MM" bounds for `formatMonthKey`. */
  startMonthKey: string;
  endMonthKey: string;
  /** "yyyy-MM-dd" bounds for query params. */
  startDate: string;
  endDate: string;
}

const PERIOD_SPANS: Record<
  Exclude<PeriodType, "month">,
  { months: number; prefix: string }
> = {
  quarter: { months: 3, prefix: "Q" },
  fourMonth: { months: 4, prefix: "F" },
  semester: { months: 6, prefix: "S" },
};

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

function monthKey(year: number, month0: number): string {
  return `${year}-${pad2(month0 + 1)}`;
}

/** Last day of the UTC month as "yyyy-MM-dd" (day 0 of next month handles leap years). */
function lastDayOfMonth(year: number, month0: number): string {
  const date = new Date(Date.UTC(year, month0 + 1, 0));
  return `${date.getUTCFullYear()}-${pad2(date.getUTCMonth() + 1)}-${pad2(date.getUTCDate())}`;
}

function firstDayOfMonth(year: number, month0: number): string {
  return `${year}-${pad2(month0 + 1)}-01`;
}

/** Returns all periods of `type` across `years` in ascending chronological order. */
export function getPeriodInstances(
  type: PeriodType,
  years: number[],
): PeriodInstance[] {
  const sortedYears = [...years].sort((a, b) => a - b);

  if (type === "month") {
    return sortedYears.flatMap((year) =>
      Array.from({ length: 12 }, (_, month0) => ({
        value: monthKey(year, month0),
        startMonthKey: monthKey(year, month0),
        endMonthKey: monthKey(year, month0),
        startDate: firstDayOfMonth(year, month0),
        endDate: lastDayOfMonth(year, month0),
      })),
    );
  }

  const { months, prefix } = PERIOD_SPANS[type];
  const periodsPerYear = 12 / months;

  return sortedYears.flatMap((year) =>
    Array.from({ length: periodsPerYear }, (_, index) => {
      const startMonth0 = index * months;
      const endMonth0 = startMonth0 + months - 1;
      return {
        value: `${year}-${prefix}${index + 1}`,
        startMonthKey: monthKey(year, startMonth0),
        endMonthKey: monthKey(year, endMonth0),
        startDate: firstDayOfMonth(year, startMonth0),
        endDate: lastDayOfMonth(year, endMonth0),
      };
    }),
  );
}

/** Keeps instances that at least partially overlap `[rangeStart, rangeEnd]`. */
export function filterInstancesInRange(
  instances: PeriodInstance[],
  rangeStart: string,
  rangeEnd: string,
): PeriodInstance[] {
  return instances.filter(
    (instance) =>
      instance.endDate >= rangeStart && instance.startDate <= rangeEnd,
  );
}

/** Returns true if at least one full instance of `type` fits inside `[rangeStart, rangeEnd]`. */
export function typeFitsWithinRange(
  type: PeriodType,
  years: number[],
  rangeStart: string,
  rangeEnd: string,
): boolean {
  return getPeriodInstances(type, years).some(
    (instance) =>
      instance.startDate >= rangeStart && instance.endDate <= rangeEnd,
  );
}

/** Returns true if the full calendar year fits inside `[rangeStart, rangeEnd]`. */
export function yearFitsWithinRange(
  year: number,
  rangeStart: string,
  rangeEnd: string,
): boolean {
  return `${year}-01-01` >= rangeStart && `${year}-12-31` <= rangeEnd;
}
