import type { CurrencyCode } from "@cashtracker/shared";

export type { CurrencyCode };

export interface CurrencyConfig {
  locale: string;
  currency: string;
  symbol: string;
  /** Minor-unit digits accepted by backend and PriceInput (0 disables decimals). Display names live in i18n `currencies.*`. */
  decimalDigits: number;
  /** Display precision for `formatCurrency` (e.g. 0 for COP while still storing up to 2 decimals). */
  displayDecimalDigits: number;
}

export const CURRENCY_MAP: Record<CurrencyCode, CurrencyConfig> = {
  COP: {
    locale: "es-CO",
    currency: "COP",
    symbol: "$",
    decimalDigits: 2,
    displayDecimalDigits: 0,
  },
  USD: {
    locale: "en-US",
    currency: "USD",
    symbol: "$",
    decimalDigits: 2,
    displayDecimalDigits: 2,
  },
  EUR: {
    locale: "de-DE",
    currency: "EUR",
    symbol: "€",
    decimalDigits: 2,
    displayDecimalDigits: 2,
  },
};

export const DEFAULT_CURRENCY_CONFIG = CURRENCY_MAP.COP;

export const formatCurrency = (
  quantity: number,
  config: CurrencyConfig = DEFAULT_CURRENCY_CONFIG,
) => {
  // Round first to absorb float noise; `|| 0` normalizes -0 so Intl never renders "-$ 0".
  // Whole numbers omit decimals, while non-whole amounts keep all displayDecimalDigits (e.g. "$12.50").
  const rounded = Number(quantity.toFixed(config.displayDecimalDigits)) || 0;
  const minimumFractionDigits = Number.isInteger(rounded)
    ? 0
    : config.displayDecimalDigits;

  // Format `rounded`, not `quantity`, so -0 normalization applies to the rendered output.
  return new Intl.NumberFormat(config.locale, {
    style: "currency",
    currency: config.currency,
    minimumFractionDigits,
    maximumFractionDigits: config.displayDecimalDigits,
  }).format(rounded);
};

export const formatNumber = (
  value: number,
  config: CurrencyConfig = DEFAULT_CURRENCY_CONFIG,
  /** Preserves trailing zeros when callers know the user typed decimals (e.g. PriceInput blur). */
  minimumFractionDigits = 0,
): string => {
  return new Intl.NumberFormat(config.locale, {
    minimumFractionDigits,
    maximumFractionDigits: config.decimalDigits,
  }).format(value);
};

/** Parses canonical "."-decimal strings (form state or backend decimals), not raw locale-formatted keystrokes. */
export const parseNumericValue = (
  value: string | number | undefined,
): number => {
  if (value === undefined || value === "") return 0;
  if (typeof value === "number") return value;

  return Number(value) || 0;
};
