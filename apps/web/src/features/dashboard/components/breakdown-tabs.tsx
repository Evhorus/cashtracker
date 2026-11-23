import { useTranslations } from "next-intl";

import { CategoryBreakdown } from "@/features/categories/components/category-breakdown";
import type {
  DashboardCategoryBreakdownRow,
  DashboardEnvelopeBreakdownRow,
  DashboardNameBreakdownRow,
  DashboardBreakdownTotal as DashboardBreakdownTotalRow,
} from "@/features/dashboard/schemas/dashboard.schema";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components/ui/tabs";
import type { CurrencyCode } from "@/shared/utils/format-currency";
import { BreakdownTotal } from "./breakdown-total";
import { EnvelopeBreakdown } from "./envelope-breakdown";
import { ExpenseNameBreakdown } from "./expense-name-breakdown";

interface BreakdownTabsProps {
  categoryRows: DashboardCategoryBreakdownRow[];
  envelopeRows: DashboardEnvelopeBreakdownRow[];
  nameRows: DashboardNameBreakdownRow[];
  total: DashboardBreakdownTotalRow;
  currency: CurrencyCode;
}

// Server component: tab primitives own "use client", and all four datasets are pre-fetched by the caller.
export function BreakdownTabs({
  categoryRows,
  envelopeRows,
  nameRows,
  total,
  currency,
}: BreakdownTabsProps) {
  const t = useTranslations("statistics");

  return (
    <Tabs defaultValue="category">
      <TabsList>
        <TabsTrigger value="category">{t("byCategory")}</TabsTrigger>
        <TabsTrigger value="envelope">{t("byEnvelope")}</TabsTrigger>
        <TabsTrigger value="name">{t("byName")}</TabsTrigger>
        <TabsTrigger value="total">{t("byTotal")}</TabsTrigger>
      </TabsList>
      <TabsContent value="category">
        <CategoryBreakdown rows={categoryRows} currency={currency} />
      </TabsContent>
      <TabsContent value="envelope">
        <EnvelopeBreakdown rows={envelopeRows} currency={currency} />
      </TabsContent>
      <TabsContent value="name">
        <ExpenseNameBreakdown rows={nameRows} currency={currency} />
      </TabsContent>
      <TabsContent value="total">
        <BreakdownTotal total={total} currency={currency} />
      </TabsContent>
    </Tabs>
  );
}
