import { MAX_AMOUNT } from "@cashtracker/shared";
import type { useTranslations } from "next-intl";

export { MAX_AMOUNT };

export type ValidationTranslator = ReturnType<
  typeof useTranslations<"validation">
>;

const MAX_TWO_DECIMALS = /^\d+(?:\.\d{1,2})?$/;

export const isPositiveAmount = (value: string): boolean => {
  const amount = Number(value);
  return Number.isFinite(amount) && amount > 0;
};

export const hasAtMostTwoDecimals = (value: string): boolean =>
  MAX_TWO_DECIMALS.test(value.trim());
