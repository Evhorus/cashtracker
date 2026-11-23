import { useTranslations } from "next-intl";

import type { DashboardNameBreakdownRow } from "@/features/dashboard/schemas/dashboard.schema";
import { RankedBarList } from "@/shared/components/common/ranked-bar-list";
import {
  CURRENCY_MAP,
  formatCurrency,
  type CurrencyCode,
} from "@/shared/utils/format-currency";

interface ExpenseNameBreakdownProps {
  rows: DashboardNameBreakdownRow[];
  currency: CurrencyCode;
}

export function ExpenseNameBreakdown({
  rows,
  currency,
}: ExpenseNameBreakdownProps) {
  const t = useTranslations("statistics");
  const config = CURRENCY_MAP[currency];

  return (
    <RankedBarList
      items={rows}
      getKey={(row) => row.name}
      getValue={(row) => row.spent}
      formatValue={(value) => formatCurrency(value, config)}
      emptyMessage={t("noSpendingYet")}
      renderLabel={(row) => (
        <span className="flex items-center gap-2 font-medium">
          {row.name}
          {row.expenseCount > 1 && (
            <span className="rounded-sm bg-secondary px-1 py-0.5 text-xs font-normal text-secondary-foreground">
              {t("expenseCount", { count: row.expenseCount })}
            </span>
          )}
        </span>
      )}
    />
  );
}
