import { useTranslations } from "next-intl";

import type { DashboardBreakdownTotal as DashboardBreakdownTotalRow } from "@/features/dashboard/schemas/dashboard.schema";
import {
  CURRENCY_MAP,
  formatCurrency,
  type CurrencyCode,
} from "@/shared/utils/format-currency";

interface BreakdownTotalProps {
  total: DashboardBreakdownTotalRow;
  currency: CurrencyCode;
}

export function BreakdownTotal({ total, currency }: BreakdownTotalProps) {
  const t = useTranslations("statistics");
  const config = CURRENCY_MAP[currency];

  return (
    <div className="flex flex-col items-center gap-1.5 py-10 text-center">
      <p className="font-mono text-3xl font-bold sm:text-4xl">
        {formatCurrency(total.spent, config)}
      </p>
      <p className="text-sm text-muted-foreground">
        {t("expenseCount", { count: total.expenseCount })}
      </p>
    </div>
  );
}
