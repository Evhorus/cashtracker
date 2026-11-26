"use client";
import { useTranslations } from "next-intl";
import { Bar, BarChart, XAxis } from "recharts";

import { Text } from "@/shared/components/common/typography";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import type { ChartConfig } from "@/shared/components/ui/chart";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/shared/components/ui/chart";
import { type CurrencyCode } from "@/shared/utils/format-currency";

type MonthlySpendingChartData = {
  label: string;
  spent: number;
};

interface MonthlySpendingChartProps {
  totalEnvelopes: number;
  chartData: MonthlySpendingChartData[];
  /** Backend scopes the chart to the user's most-used currency rather than summing across currencies. */
  currency: CurrencyCode;
  /** Shows the currency in the title only when the user has multiple currencies. */
  hasOtherCurrencies: boolean;
}

// Monthly spending grouped by expense date (oldest first).
export const MonthlySpendingChart = ({
  chartData,
  totalEnvelopes,
  currency,
  hasOtherCurrencies,
}: MonthlySpendingChartProps) => {
  const t = useTranslations("statistics");
  const tCurrency = useTranslations("currencies");
  if (totalEnvelopes === 0) return null;

  // Require at least two months to show a trend; otherwise render the card with an explanation.
  const hasTrend = chartData.length >= 2;

  // Keep keys in English: Recharts splices them into CSS custom properties (--color-spent).
  const chartConfig = {
    spent: {
      label: t("spent"),
      color: "var(--color-primary)",
    },
  } satisfies ChartConfig;

  return (
    <Card className="animate-fade-in [animation-delay:0.4s]">
      <CardHeader>
        <CardTitle>
          {t("chartTitle")}
          {hasOtherCurrencies && (
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              ({tCurrency(currency)})
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!hasTrend ? (
          <Text className="py-6 text-center">{t("notEnoughTrendData")}</Text>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-64 w-full sm:h-80"
          >
            <BarChart
              accessibilityLayer
              data={chartData}
              barGap={4}
              barCategoryGap="30%"
            >
              {/* 3-letter month ticks prevent Recharts label skipping on narrow screens; full month/year shows in tooltip. */}
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={{ stroke: "var(--border)" }}
                tickFormatter={(value: string) => value.slice(0, 3)}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar
                dataKey="spent"
                fill="var(--color-spent)"
                radius={[4, 4, 0, 0]}
                maxBarSize={28}
              />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
};
