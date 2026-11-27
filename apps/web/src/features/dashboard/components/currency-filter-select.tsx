"use client";

import { useTranslations } from "next-intl";

import { useFilterPending } from "@/shared/components/common/filter-pending";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { type CurrencyCode } from "@/shared/utils/format-currency";

interface CurrencyFilterSelectProps {
  currencies: CurrencyCode[];
  selectedCurrency: CurrencyCode;
}

/** Currency selector for multi-currency accounts; preserves sibling query params (e.g. ?year=). */
export const CurrencyFilterSelect = ({
  currencies,
  selectedCurrency,
}: CurrencyFilterSelectProps) => {
  const t = useTranslations("statistics");
  const tCurrency = useTranslations("currencies");
  const { isPending, effectiveSearchParams, updateParams } = useFilterPending();

  const optimistic = effectiveSearchParams.get("currency");
  const currentCurrency =
    isPending && optimistic && currencies.includes(optimistic as CurrencyCode)
      ? (optimistic as CurrencyCode)
      : selectedCurrency;

  function handleChange(value: string | null) {
    if (!value) return;
    updateParams(
      (params) => {
        params.set("currency", value);
      },
      { resetPage: false },
    );
  }

  return (
    <Select value={currentCurrency} onValueChange={handleChange}>
      <SelectTrigger
        size="sm"
        className="w-auto gap-1.5 font-medium"
        aria-label={t("filterCurrency")}
      >
        {/* Compact currency code only (e.g. COP) to match amount badges across the app. */}
        <SelectValue>{(value: string) => value}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {currencies.map((currency) => (
          <SelectItem key={currency} value={currency}>
            {tCurrency(currency)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
