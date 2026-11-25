"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";

import {
  filterInstancesInRange,
  getPeriodInstances,
  typeFitsWithinRange,
  yearFitsWithinRange,
  type PeriodInstance,
  type PeriodType,
} from "@/features/dashboard/lib/period-ranges";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import type { SupportedLocale } from "@/shared/config/i18n/config";
import {
  formatCalendarDateForApi,
  formatMonthKey,
  getToday,
  parseCalendarDate,
} from "@/shared/utils/date-helpers";

const ALL_VALUE = "all";
const YEAR_VALUE = "year";
type SelectedType = typeof ALL_VALUE | typeof YEAR_VALUE | PeriodType;

const PERIOD_TYPES: PeriodType[] = [
  "semester",
  "fourMonth",
  "quarter",
  "month",
];

interface PeriodFilterSelectProps {
  years: number[];
  selectedYear?: number;
  /** Tracks active sub-year period selection across reloads without coupling page.tsx to period types. */
  period?: string;
  periodValue?: string;
  /** Currently active date bounds, used to anchor period-type switches. */
  startDate?: string;
  endDate?: string;
  /** User-drawn DateRangeFilter bounds; preserved across period-type switches to clip candidates. */
  markedStart?: string;
  markedEnd?: string;
}

export const PeriodFilterSelect = ({
  years,
  selectedYear,
  period,
  periodValue,
  startDate,
  endDate,
  markedStart,
  markedEnd,
}: PeriodFilterSelectProps) => {
  const t = useTranslations("statistics");
  const locale = useLocale() as SupportedLocale;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const selectedType = resolveSelectedType(period, selectedYear);
  const effectiveYears = collectEffectiveYears(
    years,
    markedStart,
    markedEnd,
    startDate,
    endDate,
  );

  const getInstancesForType = (type: PeriodType) =>
    clipToMarkedRange(
      getPeriodInstances(type, effectiveYears),
      markedStart,
      markedEnd,
    );

  const instances =
    selectedType !== ALL_VALUE && selectedType !== YEAR_VALUE
      ? getInstancesForType(selectedType)
      : [];

  const typeFits = (type: PeriodType) =>
    !markedStart ||
    !markedEnd ||
    type === selectedType ||
    typeFitsWithinRange(type, effectiveYears, markedStart, markedEnd);
  const availableTypes = PERIOD_TYPES.filter(typeFits);

  const yearFits = (year: number) =>
    !markedStart ||
    !markedEnd ||
    year === selectedYear ||
    yearFitsWithinRange(year, markedStart, markedEnd);
  const yearOptionAvailable =
    effectiveYears.length > 0 && effectiveYears.some(yearFits);

  const navigate = (params: URLSearchParams) => {
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  };

  function handleTypeChange(value: string | null) {
    if (!value) return;
    const params = clearPeriodParams(new URLSearchParams(searchParams));
    const anchor = resolveAnchorDate(startDate, selectedYear);

    if (value === YEAR_VALUE) {
      const targetYear = pickDefaultYear(effectiveYears, anchor);
      if (targetYear) params.set("year", String(targetYear));
      navigate(params);
      return;
    }

    const candidates = getInstancesForType(value as PeriodType);
    const defaultInstance =
      candidates.find((i) => i.startDate <= anchor && anchor <= i.endDate) ??
      candidates[candidates.length - 1];
    if (defaultInstance) {
      applyPeriodInstance(params, value, defaultInstance);
    }
    navigate(params);
  }

  function handleInstanceChange(value: string | null) {
    if (!value || selectedType === ALL_VALUE) return;
    const params = new URLSearchParams(searchParams);

    if (selectedType === YEAR_VALUE) {
      params.set("year", value);
      params.delete("startDate");
      params.delete("endDate");
      navigate(params);
      return;
    }

    const instance = instances.find((i) => i.value === value);
    if (!instance) return;
    applyPeriodInstance(params, selectedType, instance);
    params.delete("year");
    navigate(params);
  }

  const instanceValue =
    selectedType === YEAR_VALUE
      ? String(selectedYear ?? "")
      : (periodValue ?? "");

  const instanceOptions =
    selectedType === YEAR_VALUE
      ? effectiveYears
          .filter(yearFits)
          .sort((a, b) => a - b)
          .map((year) => ({ value: String(year), label: String(year) }))
      : instances.map((instance) => ({
          value: instance.value,
          label: instanceLabel(instance, locale),
        }));
  const selectedInstanceLabel =
    instanceOptions.find((option) => option.value === instanceValue)?.label ??
    "";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select value={selectedType} onValueChange={handleTypeChange}>
        <SelectTrigger
          size="sm"
          className="w-auto gap-1.5 font-medium"
          aria-label={t("filterPeriodType")}
        >
          <SelectValue>{() => t(`periodType.${selectedType}`)}</SelectValue>
        </SelectTrigger>
        {/* No "all" item here: DateRangeFilter's clear button owns dropping the range. */}
        <SelectContent alignItemWithTrigger={false}>
          {yearOptionAvailable && (
            <SelectItem value={YEAR_VALUE}>{t("periodType.year")}</SelectItem>
          )}
          {availableTypes.map((type) => (
            <SelectItem key={type} value={type}>
              {t(`periodType.${type}`)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {selectedType !== ALL_VALUE && (
        <Select value={instanceValue} onValueChange={handleInstanceChange}>
          <SelectTrigger
            size="sm"
            className="w-auto gap-1.5 font-medium"
            aria-label={t("filterPeriodInstance")}
          >
            <SelectValue>{() => selectedInstanceLabel}</SelectValue>
          </SelectTrigger>
          <SelectContent alignItemWithTrigger={false}>
            {instanceOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
};

function isPeriodType(value: string): value is PeriodType {
  return (PERIOD_TYPES as string[]).includes(value);
}

function resolveSelectedType(
  period?: string,
  selectedYear?: number,
): SelectedType {
  if (period && isPeriodType(period)) return period;
  return selectedYear ? YEAR_VALUE : ALL_VALUE;
}

/** Includes intermediate years inside a marked/active date span so multi-year ranges never skip empty years. */
function collectEffectiveYears(
  years: number[],
  markedStart?: string,
  markedEnd?: string,
  startDate?: string,
  endDate?: string,
): number[] {
  const result = new Set<number>(years);
  const addRange = (from?: string, to?: string) => {
    const startYear = from ? parseCalendarDate(from).getUTCFullYear() : null;
    const endYear = to ? parseCalendarDate(to).getUTCFullYear() : null;
    if (startYear !== null) result.add(startYear);
    if (endYear !== null) result.add(endYear);
    if (startYear !== null && endYear !== null && startYear <= endYear) {
      for (let year = startYear; year <= endYear; year++) {
        result.add(year);
      }
    }
  };
  addRange(markedStart, markedEnd);
  addRange(startDate, endDate);
  return Array.from(result);
}

function clearPeriodParams(params: URLSearchParams): URLSearchParams {
  for (const key of ["year", "startDate", "endDate", "period", "periodValue"]) {
    params.delete(key);
  }
  return params;
}

function pickDefaultYear(
  effectiveYears: number[],
  anchor: string,
): number | undefined {
  const anchorYear = parseCalendarDate(anchor).getUTCFullYear();
  if (effectiveYears.includes(anchorYear)) return anchorYear;
  return effectiveYears.length > 0 ? Math.max(...effectiveYears) : undefined;
}

function applyPeriodInstance(
  params: URLSearchParams,
  period: string,
  instance: PeriodInstance,
) {
  params.set("period", period);
  params.set("periodValue", instance.value);
  params.set("startDate", instance.startDate);
  params.set("endDate", instance.endDate);
}

function clipToMarkedRange(
  instances: PeriodInstance[],
  markedStart?: string,
  markedEnd?: string,
): PeriodInstance[] {
  if (!markedStart || !markedEnd) return instances;
  return filterInstancesInRange(instances, markedStart, markedEnd);
}

function resolveAnchorDate(startDate?: string, selectedYear?: number): string {
  if (startDate) return startDate;
  if (selectedYear) return `${selectedYear}-01-01`;
  return formatCalendarDateForApi(getToday());
}

function instanceLabel(
  instance: PeriodInstance,
  locale: SupportedLocale,
): string {
  if (instance.startMonthKey === instance.endMonthKey) {
    return formatMonthKey(instance.startMonthKey, locale, true);
  }
  return `${formatMonthKey(instance.startMonthKey, locale, false)} – ${formatMonthKey(instance.endMonthKey, locale, true)}`;
}
