import type { useTranslations } from "next-intl";

export type ValidationTranslator = ReturnType<
  typeof useTranslations<"validation">
>;

/** Max value fitting backend `decimal(12, 2)` columns (`expense.amount`, `envelope.amount`). */
export const MAX_AMOUNT = 9_999_999_999.99;

const MAX_TWO_DECIMALS = /^\d+(?:\.\d{1,2})?$/;

export const isPositiveAmount = (value: string): boolean => {
  const amount = Number(value);
  return Number.isFinite(amount) && amount > 0;
};

export const hasAtMostTwoDecimals = (value: string): boolean =>
  MAX_TWO_DECIMALS.test(value.trim());
