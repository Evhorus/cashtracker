import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";

import { Heading } from "@/shared/components/common/typography";
import { cn } from "@/shared/lib/utils";
import { formatCalendarDateShort } from "@/shared/utils/date-helpers";
import { CURRENCY_MAP, formatCurrency } from "@/shared/utils/format-currency";
import type { DashboardRecentExpense } from "@/features/dashboard/types";

interface RecentActivityProps {
  expenses: DashboardRecentExpense[];
  className?: string;
}

// Cross-envelope recent expenses widget; renders nothing when empty.
export async function RecentActivity({
  expenses,
  className,
}: RecentActivityProps) {
  const t = await getTranslations("dashboard");
  const locale = await getLocale();

  if (expenses.length === 0) return null;

  return (
    <div
      className={cn(
        "rounded-2xl border border-border/60 bg-card/50 p-5",
        className,
      )}
    >
      <Heading size="sm">{t("recentActivity")}</Heading>

      <div className="mt-3 space-y-1">
        {expenses.map((expense) => {
          const config = CURRENCY_MAP[expense.currency];
          return (
            <Link
              key={expense.id}
              href={`/dashboard/envelope/${expense.envelopeId}/expenses/${expense.id}`}
              className="flex items-center gap-3 rounded-lg p-1.5 transition-colors hover:bg-muted"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                <span className="font-mono text-sm font-semibold">
                  {expense.name.trim().charAt(0).toUpperCase() || "?"}
                </span>
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{expense.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {expense.envelopeName} ·{" "}
                  {formatCalendarDateShort(expense.date, locale)}
                </p>
              </div>
              <span className="shrink-0 font-mono text-sm font-semibold">
                {formatCurrency(expense.amount, config)}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
