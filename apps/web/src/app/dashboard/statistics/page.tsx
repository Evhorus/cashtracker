import type { Metadata } from "next";
import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import { getLocale, getTranslations } from "next-intl/server";
import { formatMonthKey, hasMultipleYears } from "@/shared/utils/date-helpers";
import {
  parseCurrencyParam,
  parseIsoDateParam,
  parseYearParam,
} from "@/shared/utils/url-params";
import { getDashboardSummary } from "@/features/dashboard/data/get-dashboard-summary";
import { getCategoryBreakdown } from "@/features/dashboard/data/get-category-breakdown";
import { getEnvelopeBreakdown } from "@/features/dashboard/data/get-envelope-breakdown";
import { getNameBreakdown } from "@/features/dashboard/data/get-name-breakdown";
import { getBreakdownTotal } from "@/features/dashboard/data/get-breakdown-total";
import { PeriodFilterSelect } from "@/features/dashboard/components/period-filter-select";
import { CurrencyFilterSelect } from "@/features/dashboard/components/currency-filter-select";
import { DateRangeFilter } from "@/features/dashboard/components/date-range-filter";
import nextDynamic from "next/dynamic";
import { MonthlySpendingChartSkeleton } from "@/features/dashboard/components/monthly-spending-chart-skeleton";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Heading } from "@/shared/components/common/typography";
import { BreakdownTabs } from "@/features/dashboard/components/breakdown-tabs";
import { CurrencyBreakdown } from "@/features/dashboard/components/currency-breakdown";
import { cn } from "@/shared/lib/utils";
import type { CurrencyCode } from "@/shared/utils/format-currency";
import type {
  DashboardBreakdownFilters,
  DashboardSummary,
} from "@/features/dashboard/schemas/dashboard.schema";

// recharts is a heavy dependency - code-split it into its own chunk, same
// reasoning as it had on dashboard/page.tsx before this moved here (see
// that file's history).
const MonthlySpendingChart = nextDynamic(
  () =>
    import("@/features/dashboard/components/monthly-spending-chart").then(
      (mod) => mod.MonthlySpendingChart,
    ),
  { loading: () => <MonthlySpendingChartSkeleton /> },
);

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("statistics");
  return { title: t("title") };
}

// Force dynamic rendering because this page uses Clerk auth
export const dynamic = "force-dynamic";

interface StatisticsPageProps {
  searchParams: Promise<{
    year?: string;
    currency?: string;
    startDate?: string;
    endDate?: string;
    // UI-only bookkeeping for PeriodFilterSelect (month/quarter/
    // fourMonth/semester) - see that component's own doc comment. Every
    // other value below still drives the actual fetches.
    period?: string;
    periodValue?: string;
    markedStart?: string;
    markedEnd?: string;
  }>;
}

// The year/currency-filterable monthly trend, split out of "/dashboard"
// (now a lightweight Resumen) - this is where you dig into history, so
// the filters that only affect the chart live here with it instead of
// on the glanceable overview page.
export default async function StatisticsPage({
  searchParams,
}: StatisticsPageProps) {
  await auth.protect();
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
  } = await searchParams;
  const year = parseYearParam(yearParam);
  const currencyParam = parseCurrencyParam(rawCurrency);
  const startDate = parseIsoDateParam(rawStartDate);
  const endDate = parseIsoDateParam(rawEndDate);
  const markedStart = parseIsoDateParam(rawMarkedStart);
  const markedEnd = parseIsoDateParam(rawMarkedEnd);
  // An exact range wins over the year shortcut when the URL somehow
  // carries both (hand-edited, stale) - same precedence the backend
  // applies (see BreakdownQueryDto), so the chart above and the
  // breakdown tabs below can never disagree about which one is active.
  const hasDateRange = Boolean(startDate && endDate);
  const periodFilters = {
    year: hasDateRange ? undefined : year,
    startDate: hasDateRange ? startDate : undefined,
    endDate: hasDateRange ? endDate : undefined,
  };

  // Start summary and (when currency is already in the URL) the four breakdown
  // requests concurrently so BreakdownSection does not wait for the summary
  // round-trip before hitting the API.
  const summaryPromise = getDashboardSummary(year, currencyParam);
  const prefetchedBreakdowns = currencyParam
    ? fetchBreakdowns({ currency: currencyParam, ...periodFilters })
    : null;

  const summary = await summaryPromise;

  // The year is only worth showing when the range actually spans more
  // than one - within a single year "Aug" alone reads fine, and the
  // extra token is what used to make the axis labels crowd. This lived
  // in the backend until it started sending raw month keys.
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
    // Discard unused prefetch safely if the URL currency was overridden by the summary.
    void prefetchedBreakdowns.catch(() => undefined);
  }
  // PeriodFilterSelect only makes sense once there's a boundary to
  // narrow - showing "Semestre"/"Trimestre"/etc. before the user has
  // drawn any range invites picking one with nothing marked to anchor
  // it to. It appears once DateRangeFilter has applied something
  // (markedStart/markedEnd), or for a still-valid `year`/`period` link
  // from before this control existed.
  const canShowPeriodFilter =
    Boolean(markedStart && markedEnd) || Boolean(year) || Boolean(period);

  return (
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

      <MonthlySpendingChart
        chartData={chartData}
        totalEnvelopes={summary.totalEnvelopes}
        currency={chartCurrency}
        hasOtherCurrencies={hasMultipleCurrencies}
      />

      {/* Keyed on the active filters so changing year/currency/date
          range re-shows the fallback instead of silently swapping
          content once ready - the same visible "yes, that click
          registered" feedback the envelopes list uses, and the reason
          the filter controls above sit outside this boundary. */}
      <Suspense
        key={`${year ?? ""}-${chartCurrency}-${startDate ?? ""}-${endDate ?? ""}`}
        fallback={<BreakdownSkeleton multiCurrency={hasMultipleCurrencies} />}
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
    </div>
  );
}

const fetchBreakdowns = (filters: DashboardBreakdownFilters) =>
  Promise.all([
    getCategoryBreakdown(filters),
    getEnvelopeBreakdown(filters),
    getNameBreakdown(filters),
    getBreakdownTotal(filters),
  ]);

type BreakdownResults = Awaited<ReturnType<typeof fetchBreakdowns>>;

interface BreakdownSectionProps {
  totals: (DashboardSummary["totals"][number] & { currency: CurrencyCode })[];
  chartCurrency: CurrencyCode;
  hasMultipleCurrencies: boolean;
  /** The period every breakdown tab is scoped to - an exact range wins
   * over `year` (page body above already resolves that), either or
   * neither may be set. */
  year?: number;
  startDate?: string;
  endDate?: string;
  breakdownsPromise?: Promise<BreakdownResults> | null;
}

/**
 * The breakdown card (four tabs) plus the currency card. Split out of
 * the page body so the header, the filters and the chart render
 * without waiting on this section's own fetch.
 */
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
