import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";

import type { DashboardEnvelopeBreakdownRow } from "@/features/dashboard/schemas/dashboard.schema";
import { RankedBarList } from "@/shared/components/common/ranked-bar-list";
import {
  formatCalendarDateRange,
  parseCalendarDate,
} from "@/shared/utils/date-helpers";
import {
  CURRENCY_MAP,
  formatCurrency,
  type CurrencyCode,
} from "@/shared/utils/format-currency";

interface EnvelopeBreakdownProps {
  rows: DashboardEnvelopeBreakdownRow[];
  currency: CurrencyCode;
}

export function EnvelopeBreakdown({ rows, currency }: EnvelopeBreakdownProps) {
  const t = useTranslations("statistics");
  const locale = useLocale();
  const config = CURRENCY_MAP[currency];

  return (
    <RankedBarList
      items={rows}
      getKey={(row) => row.envelopeId}
      getValue={(row) => row.spent}
      formatValue={(value) => formatCurrency(value, config)}
      emptyMessage={t("noSpendingYet")}
      renderLabel={(row) => (
        <span className="min-w-0">
          <Link
            href={`/dashboard/envelope/${row.envelopeId}`}
            className="font-medium hover:underline"
          >
            {row.envelopeName}
          </Link>
          {row.firstExpenseDate && row.lastExpenseDate && (
            <span className="text-xs text-muted-foreground">
              {" · "}
              {formatCalendarDateRange(
                parseCalendarDate(row.firstExpenseDate),
                parseCalendarDate(row.lastExpenseDate),
                locale,
              )}
            </span>
          )}
        </span>
      )}
    />
  );
}
