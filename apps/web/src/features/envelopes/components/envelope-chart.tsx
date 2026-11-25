"use client";
import { useTranslations } from "next-intl";
import { Cell, Label, Pie, PieChart } from "recharts";

import type { EnvelopeProgressStatus } from "@/features/envelopes/lib/envelope-helpers";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/shared/components/ui/chart";

interface EnvelopeChartProps {
  spent: number;
  total: number;
  /** Backend-reported status so chart colors match other views; unlimited envelopes never render this chart. */
  status: Exclude<EnvelopeProgressStatus, "unlimited">;
}

export const EnvelopeChart = ({ spent, total, status }: EnvelopeChartProps) => {
  const t = useTranslations("envelopes.chart");
  const isExceeded = status === "exceeded";
  const isWarning = status === "warning";
  const percentage = total > 0 ? (spent / total) * 100 : 0;
  const remaining = Math.max(0, total - spent);
  const overspent = Math.max(0, spent - total);

  // Warning uses amber; exceeded keeps the within-budget wedge green and adds a red overspent wedge.
  const spentKey = isWarning ? "warningSpent" : "spent";

  const data = isExceeded
    ? [
        { name: "spent", value: total, fill: "var(--color-spent)" },
        { name: "overspent", value: overspent, fill: "var(--color-overspent)" },
      ]
    : [
        { name: spentKey, value: spent, fill: `var(--color-${spentKey})` },
        { name: "available", value: remaining, fill: "var(--color-available)" },
      ];

  const chartConfig = {
    spent: {
      label: t("spent"),
      color: "var(--chart-1)",
    },
    warningSpent: {
      label: t("spent"),
      color: "var(--color-amber-500)",
    },
    available: {
      label: t("available"),
      // Uses --muted-foreground (softened via Cell fillOpacity) because --muted blends into --card in dark mode.
      color: "var(--muted-foreground)",
    },
    overspent: {
      label: t("exceeded"),
      color: "var(--destructive)",
    },
  } satisfies ChartConfig;

  const spentDotClass = isWarning ? "bg-amber-500" : "bg-chart-1";
  const percentageTextClass = isExceeded
    ? "fill-destructive"
    : isWarning
      ? "fill-amber-500"
      : "fill-foreground";

  return (
    <div>
      <ChartContainer
        config={chartConfig}
        className="mx-auto aspect-square h-48 max-h-48"
      >
        <PieChart>
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel />}
          />
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={52}
            outerRadius={76}
            strokeWidth={5}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.fill}
                fillOpacity={entry.name === "available" ? 0.35 : 1}
              />
            ))}
            <Label
              content={({ viewBox }) => {
                if (!viewBox || !("cx" in viewBox)) return null;
                return (
                  <text
                    x={viewBox.cx}
                    y={viewBox.cy}
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    <tspan
                      x={viewBox.cx}
                      y={viewBox.cy}
                      className={`text-2xl font-bold ${percentageTextClass}`}
                    >
                      {Math.round(percentage)}%
                    </tspan>
                    <tspan
                      x={viewBox.cx}
                      y={(viewBox.cy ?? 0) + 20}
                      className="fill-muted-foreground text-xs"
                    >
                      {isExceeded ? t("limitExceeded") : t("used")}
                    </tspan>
                  </text>
                );
              }}
            />
          </Pie>
        </PieChart>
      </ChartContainer>

      <div className="mt-1 flex items-center justify-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className={`h-2 w-2 rounded-full ${spentDotClass}`} />
          {t("spent")}
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className={`h-2 w-2 rounded-full ${
              isExceeded ? "bg-destructive" : "bg-muted-foreground/35"
            }`}
          />
          {isExceeded ? t("exceeded") : t("available")}
        </span>
      </div>
    </div>
  );
};
