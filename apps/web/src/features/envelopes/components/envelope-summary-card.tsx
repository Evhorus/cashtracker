import { Suspense } from "react";
import dynamic from "next/dynamic";
import { Infinity as InfinityIcon, TriangleAlert } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { EnvelopeChartSkeleton } from "@/features/envelopes/components/envelope-chart-skeleton";
import { EnvelopeHelpers } from "@/features/envelopes/lib/envelope-helpers";
import type { Envelope } from "@/features/envelopes/types";
import {
  getFilteredExpenses,
  type FilteredExpensesQuery,
} from "@/features/expenses/lib/build-filter-banner";
import {
  parseMethodFilter,
  type MethodOption,
} from "@/features/payment-methods/lib/method-filter";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { cn } from "@/shared/lib/utils";
import {
  CURRENCY_MAP,
  formatCurrency,
  type CurrencyCode,
} from "@/shared/utils/format-currency";

const EnvelopeChart = dynamic(
  () =>
    import("@/features/envelopes/components/envelope-chart").then(
      (mod) => mod.EnvelopeChart,
    ),
  { loading: () => <EnvelopeChartSkeleton /> },
);

interface EnvelopeSummaryCardProps {
  envelope: Envelope;
  hasActiveFilter: boolean;
  filterKey: string;
  filterQuery: FilteredExpensesQuery;
  methodOptions: MethodOption[];
}

export async function EnvelopeSummaryCard({
  envelope,
  hasActiveFilter,
  filterKey,
  filterQuery,
  methodOptions,
}: EnvelopeSummaryCardProps) {
  const tEnvelope = await getTranslations("envelopes");
  const isUnlimited = envelope.amount === null;
  const remaining = EnvelopeHelpers.getRemaining(envelope);
  const percentage = EnvelopeHelpers.getPercentage(envelope);
  const status = envelope.status;
  const currencyConfig = CURRENCY_MAP[envelope.currency];
  const spentColorClass = EnvelopeHelpers.getStatusTextColorClass(status);

  return (
    <Card className="border-0 bg-card/50 shadow-sm">
      <CardHeader>
        <CardTitle>{tEnvelope("detail.summary")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {status === "unlimited" ? (
          <div
            className={cn(
              "grid min-h-24 overflow-hidden rounded-lg bg-secondary/40 md:min-h-36",
              hasActiveFilter ? "grid-cols-2" : "grid-cols-1",
            )}
          >
            <div className="flex flex-col justify-center gap-0.5 px-3 py-3 md:px-4 md:py-5">
              <p className="text-xs text-muted-foreground">
                {tEnvelope("detail.spentTotal")}
              </p>
              <p className="font-mono text-base font-bold tabular-nums md:text-lg">
                {formatCurrency(+envelope.spent, currencyConfig)}
              </p>
              <p className="flex items-center gap-1 text-xs whitespace-nowrap text-muted-foreground">
                <InfinityIcon className="h-3.5 w-3.5 shrink-0" />
                {tEnvelope("detail.noLimitShort")}
              </p>
            </div>
            {hasActiveFilter && (
              <Suspense key={filterKey} fallback={<div />}>
                <FilteredSummary
                  layout="half"
                  currency={envelope.currency}
                  methodOptions={methodOptions}
                  {...filterQuery}
                />
              </Suspense>
            )}
          </div>
        ) : (
          <>
            {hasActiveFilter && (
              <Suspense key={filterKey} fallback={null}>
                <FilteredSummary
                  layout="line"
                  currency={envelope.currency}
                  methodOptions={methodOptions}
                  {...filterQuery}
                />
              </Suspense>
            )}
            <EnvelopeChart
              spent={+envelope.spent}
              total={+envelope.amount!}
              status={status}
            />
          </>
        )}

        {status === "exceeded" && (
          <div className="flex items-center gap-2.5 rounded-lg border border-destructive/25 bg-destructive/10 px-3.5 py-2.5">
            <TriangleAlert className="h-4 w-4 shrink-0 text-destructive" />
            <p className="text-sm font-medium text-destructive">
              {tEnvelope("detail.exceededBy", {
                amount: formatCurrency(
                  Math.abs(remaining ?? 0),
                  currencyConfig,
                ),
              })}
            </p>
          </div>
        )}

        <dl className="divide-y divide-border/60">
          {!isUnlimited && (
            <div className="flex items-center justify-between py-3 first:pt-0">
              <dt className="text-sm text-muted-foreground">
                {tEnvelope("detail.available")}
              </dt>
              <dd
                className={cn(
                  "text-base font-bold",
                  (remaining ?? 0) < 0 ? "text-destructive" : "text-success",
                )}
              >
                {formatCurrency(remaining ?? 0, currencyConfig)}
              </dd>
            </div>
          )}

          {!isUnlimited && (
            <div className="flex items-center justify-between py-3 first:pt-0">
              <dt className="text-sm text-muted-foreground">
                {tEnvelope("detail.spent")}
              </dt>
              <dd className="text-right">
                <p className={cn("text-base font-bold", spentColorClass)}>
                  {formatCurrency(+envelope.spent, currencyConfig)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {tEnvelope("detail.percentOfLimit", {
                    percent: (percentage ?? 0).toFixed(1),
                  })}
                </p>
              </dd>
            </div>
          )}

          {!isUnlimited && (
            <div className="flex items-center justify-between py-3 first:pt-0">
              <dt className="text-sm text-muted-foreground">
                {tEnvelope("detail.totalLimit")}
              </dt>
              <dd className="text-base font-bold">
                {formatCurrency(+envelope.amount!, currencyConfig)}
              </dd>
            </div>
          )}

          <div className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
            <dt className="text-sm text-muted-foreground">
              {tEnvelope("detail.transactions")}
            </dt>
            <dd className="text-base font-bold">{envelope.expenses.length}</dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}

async function FilteredSummary({
  currency,
  methodOptions,
  layout,
  ...query
}: FilteredExpensesQuery & {
  currency: CurrencyCode;
  methodOptions: MethodOption[];
  layout: "half" | "line";
}) {
  const t = await getTranslations("envelopes.detail");
  const tMethods = await getTranslations("paymentMethods.filter");
  const tBanner = await getTranslations("expenses.filteredBanner");
  const { meta } = await getFilteredExpenses(query);
  const selected = parseMethodFilter(query.methods).selected;
  const methods = methodOptions.filter((option) =>
    selected.includes(option.id),
  );
  const amount = formatCurrency(meta.totalAmount, CURRENCY_MAP[currency]);
  const count = t("filteredCount", { count: meta.total });

  const labels = (
    <span className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5">
      {methods.map((method) => (
        <span key={method.id} className="inline-flex items-center gap-1.5">
          <span
            aria-hidden
            className={
              method.color
                ? "h-2 w-2 shrink-0 rounded-full"
                : "h-2 w-2 shrink-0 rounded-full border border-dashed border-muted-foreground"
            }
            style={method.color ? { background: method.color } : undefined}
          />
          {method.name ?? tMethods("none")}
        </span>
      ))}
      {query.search && <span>{tBanner("search", { term: query.search })}</span>}
    </span>
  );

  if (layout === "line") {
    return (
      <div className="flex animate-in items-center justify-between gap-3 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-sm duration-300 fade-in slide-in-from-top-1">
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">{t("filtered")}</p>
          {labels}
        </div>
        <div className="shrink-0 text-right">
          <p className="font-mono font-bold tabular-nums">{amount}</p>
          <p className="text-xs text-muted-foreground">{count}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex animate-in flex-col justify-center gap-0.5 border-l border-primary/30 bg-primary/10 px-3 py-3 text-sm duration-300 fade-in slide-in-from-right-4 md:px-4 md:py-5">
      <p className="text-xs text-muted-foreground">{t("filtered")}</p>
      {labels}
      <p className="mt-0.5 font-mono text-base font-bold tabular-nums md:mt-1 md:text-lg">
        {amount}
      </p>
      <p className="text-xs text-muted-foreground">{count}</p>
    </div>
  );
}
