"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

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
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handleChange(value: string | null) {
    if (!value) return;
    const params = new URLSearchParams(searchParams);
    params.set("currency", value);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <Select value={selectedCurrency} onValueChange={handleChange}>
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
