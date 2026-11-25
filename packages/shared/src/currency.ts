import { z } from "zod";

export const CURRENCY_CODES = ["COP", "USD", "EUR"] as const;
export type CurrencyCode = (typeof CURRENCY_CODES)[number];

/** Const enum-like lookup compatible with class-validator's `@IsEnum(Currency)`. */
export const Currency = {
  COP: "COP",
  USD: "USD",
  EUR: "EUR",
} as const satisfies Record<CurrencyCode, CurrencyCode>;

export const CurrencyCodeSchema = z.enum(CURRENCY_CODES);
