import { Suspense } from "react";
import dynamic from "next/dynamic";
import { getLocale, getTranslations } from "next-intl/server";

import { BreakdownTabs } from "@/features/dashboard/components/breakdown-tabs";
import { CurrencyBreakdown } from "@/features/dashboard/components/currency-breakdown";
import { CurrencyFilterSelect } from "@/features/dashboard/components/currency-filter-select";
import { DateRangeFilter } from "@/features/dashboard/components/date-range-filter";
import { MonthlySpendingChartSkeleton } from "@/features/dashboard/components/monthly-spending-chart-skeleton";
import { PeriodFilterSelect } from "@/features/dashboard/components/period-filter-select";
import type {
  DashboardBreakdownFilters,
  DashboardSummary,
} from "@/features/dashboard/schemas/dashboard.schema";
import { DashboardService } from "@/features/dashboard/services/dashboard.service";
import {
  FilterPendingProvider,
  FilterResultsSlot,
} from "@/shared/components/common/filter-pending";
import { Heading } from "@/shared/components/common/typography";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { cn } from "@/shared/lib/utils";
import { formatMonthKey, hasMultipleYears } from "@/shared/utils/date-helpers";
import type { CurrencyCode } from "@/shared/utils/format-currency";
import {
  parseCurrencyParam,
  parseIsoDateParam,
  parseYearParam,
} from "@/shared/utils/url-params";

const MonthlySpendingChart = dynamic(
  () =>
    import("@/features/dashboard/components/monthly-spending-chart").then(
      (mod) => mod.MonthlySpendingChart,
    ),
  { loading: () => <MonthlySpendingChartSkeleton /> },
);

export interface StatisticsSearchParams {
  year?: string;
  currency?: string;
  startDate?: string;
  endDate?: string;
  period?: string;
  periodValue?: string;
  markedStart?: string;
  markedEnd?: string;
}

interface StatisticsViewProps {
  searchParams: StatisticsSearchParams;
}

export async function StatisticsView({ searchParams }: StatisticsViewProps) {
  const locale = await getLocale();
  const t = await getTranslations("statistics");
  const {
    year: yearParam,
    currency: rawCurrency,
    startDate: rawStartDate,
    endDate: rawEndDate,
    period,
    periodValue,
    markedStart: rawMarkedStart,
    markedEnd: rawMarkedEnd,
  } = searchParams;

  const year = parseYearParam(yearParam);
  const currencyParam = parseCurrencyParam(rawCurrency);
  const startDate = parseIsoDateParam(rawStartDate);
  const endDate = parseIsoDateParam(rawEndDate);
  const markedStart = parseIsoDateParam(rawMarkedStart);
  const markedEnd = parseIsoDateParam(rawMarkedEnd);

  // An exact date range takes precedence over `year`, matching backend BreakdownQueryDto.
  const hasDateRange = Boolean(startDate && endDate);
  const periodFilters = {
    year: hasDateRange ? undefined : year,
    startDate: hasDateRange ? startDate : undefined,
    endDate: hasDateRange ? endDate : undefined,
  };

  // Fetch breakdowns in parallel with summary when the currency is already in the URL.
  const summaryPromise = DashboardService.getSummary(year, currencyParam);
  const prefetchedBreakdowns = currencyParam
    ? fetchBreakdowns({ currency: currencyParam, ...periodFilters })
    : null;

  const summary = await summaryPromise;

  const spansMultipleYears = hasMultipleYears(
    summary.chart.map((entry) => Number(entry.month.slice(0, 4))),
  );
  const chartData = summary.chart.map((entry) => ({
    label: formatMonthKey(entry.month, locale, spansMultipleYears),
    spent: entry.spent,
  }));

  const totals = summary.totals.map((total) => ({
    ...total,
    currency: total.currency as CurrencyCode,
  }));
  const hasMultipleCurrencies = totals.length > 1;
  const chartCurrency = (summary.chartCurrency ?? "COP") as CurrencyCode;
  const matchingBreakdownsPromise =
    prefetchedBreakdowns && currencyParam === chartCurrency
      ? prefetchedBreakdowns
      : null;

  if (prefetchedBreakdowns && !matchingBreakdownsPromise) {
    void prefetchedBreakdowns.catch(() => undefined);
  }

  const canShowPeriodFilter =
    Boolean(markedStart && markedEnd) || Boolean(year) || Boolean(period);

  return (
    <FilterPendingProvider>
      <div className="space-y-6">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <Heading as="h1" size="lg">
              {t("title")}
            </Heading>
            <p className="mt-1 text-muted-foreground">{t("subtitle")}</p>
          </div>

          <div className="flex items-center gap-4">
            {(summary.availableYears.length > 0 || hasMultipleCurrencies) && (
              <div className="flex flex-wrap items-center gap-2">
                <DateRangeFilter
                  startDate={startDate}
                  endDate={endDate}
                  markedStart={markedStart}
                  markedEnd={markedEnd}
                />
                {canShowPeriodFilter && (
                  <PeriodFilterSelect
                    years={summary.availableYears}
                    selectedYear={year}
                    period={period}
                    periodValue={periodValue}
                    startDate={startDate}
                    endDate={endDate}
                    markedStart={markedStart}
                    markedEnd={markedEnd}
                  />
                )}
                {hasMultipleCurrencies && (
                  <CurrencyFilterSelect
                    currencies={totals.map((total) => total.currency)}
                    selectedCurrency={chartCurrency}
                  />
                )}
              </div>
            )}
          </div>
        </div>

        <FilterResultsSlot
          className="space-y-6"
          fallback={
            <div className="space-y-6">
              <MonthlySpendingChartSkeleton />
              <BreakdownSkeleton multiCurrency={hasMultipleCurrencies} />
            </div>
          }
        >
          <MonthlySpendingChart
            chartData={chartData}
            totalEnvelopes={summary.totalEnvelopes}
            currency={chartCurrency}
            hasOtherCurrencies={hasMultipleCurrencies}
          />

          <Suspense
            key={`${year ?? ""}-${chartCurrency}-${startDate ?? ""}-${endDate ?? ""}`}
            fallback={
              <BreakdownSkeleton multiCurrency={hasMultipleCurrencies} />
            }
          >
            <BreakdownSection
              totals={totals}
              chartCurrency={chartCurrency}
              hasMultipleCurrencies={hasMultipleCurrencies}
              year={periodFilters.year}
              startDate={periodFilters.startDate}
              endDate={periodFilters.endDate}
              breakdownsPromise={matchingBreakdownsPromise}
            />
          </Suspense>
        </FilterResultsSlot>
      </div>
    </FilterPendingProvider>
  );
}

const fetchBreakdowns = (filters: DashboardBreakdownFilters) =>
  Promise.all([
    DashboardService.getCategoryBreakdown(filters),
    DashboardService.getEnvelopeBreakdown(filters),
    DashboardService.getNameBreakdown(filters),
    DashboardService.getBreakdownTotal(filters),
  ]);

type BreakdownResults = Awaited<ReturnType<typeof fetchBreakdowns>>;

interface BreakdownSectionProps {
  totals: (DashboardSummary["totals"][number] & { currency: CurrencyCode })[];
  chartCurrency: CurrencyCode;
  hasMultipleCurrencies: boolean;
  year?: number;
  startDate?: string;
  endDate?: string;
  breakdownsPromise?: Promise<BreakdownResults> | null;
}

async function BreakdownSection({
  totals,
  chartCurrency,
  hasMultipleCurrencies,
  year,
  startDate,
  endDate,
  breakdownsPromise,
}: BreakdownSectionProps) {
  const t = await getTranslations("statistics");
  const filters = { currency: chartCurrency, year, startDate, endDate };
  const [categoryRows, envelopeRows, nameRows, total] =
    await (breakdownsPromise ?? fetchBreakdowns(filters));

  return (
    <div
      className={
        hasMultipleCurrencies ? "grid grid-cols-1 gap-6 lg:grid-cols-3" : ""
      }
    >
      <Card
        className={cn(
          hasMultipleCurrencies && "lg:col-span-2",
          "border-0 bg-card/50 shadow-sm",
        )}
      >
        <CardHeader>
          <CardTitle>{t("breakdownTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          <BreakdownTabs
            categoryRows={categoryRows}
            envelopeRows={envelopeRows}
            nameRows={nameRows}
            total={total}
            currency={chartCurrency}
          />
        </CardContent>
      </Card>

      {hasMultipleCurrencies && (
        <Card className="border-0 bg-card/50 shadow-sm">
          <CardHeader>
            <CardTitle>{t("byCurrency")}</CardTitle>
          </CardHeader>
          <CardContent>
            <CurrencyBreakdown totals={totals} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function BreakdownSkeleton({ multiCurrency }: { multiCurrency: boolean }) {
  return (
    <div
      className={multiCurrency ? "grid grid-cols-1 gap-6 lg:grid-cols-3" : ""}
    >
      <Skeleton
        className={cn("h-72 rounded-xl", multiCurrency && "lg:col-span-2")}
      />
      {multiCurrency && <Skeleton className="h-72 rounded-xl" />}
    </div>
  );
}
