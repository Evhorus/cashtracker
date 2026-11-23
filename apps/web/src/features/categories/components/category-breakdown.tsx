import { Tag } from "lucide-react";
import { useTranslations } from "next-intl";

import type { DashboardCategoryBreakdownRow } from "@/features/dashboard/schemas/dashboard.schema";
import { RankedBarList } from "@/shared/components/common/ranked-bar-list";
import {
  CURRENCY_MAP,
  formatCurrency,
  type CurrencyCode,
} from "@/shared/utils/format-currency";
import { resolveIcon } from "../lib/icon-registry";

interface CategoryBreakdownProps {
  rows: DashboardCategoryBreakdownRow[];
  currency: CurrencyCode;
}

const NO_CATEGORY_COLOR = "oklch(0.5 0.02 260)";

export function CategoryBreakdown({ rows, currency }: CategoryBreakdownProps) {
  const t = useTranslations("categories");
  const tStats = useTranslations("statistics");
  const config = CURRENCY_MAP[currency];

  return (
    <RankedBarList
      items={rows}
      getKey={(row) => row.category?.id ?? "__none__"}
      getValue={(row) => row.spent}
      formatValue={(value) => formatCurrency(value, config)}
      getBarColor={(row) => row.category?.color ?? NO_CATEGORY_COLOR}
      emptyMessage={tStats("noSpendingYet")}
      renderLabel={(row) => {
        const label = row.category?.label ?? t("none");
        const color = row.category?.color ?? NO_CATEGORY_COLOR;
        const def = {
          Icon: row.category ? resolveIcon(row.category.icon) : Tag,
        };
        return (
          <span className="flex items-center gap-2 font-medium">
            <def.Icon className="h-3.5 w-3.5" style={{ color }} />
            {label}
          </span>
        );
      }}
    />
  );
}
