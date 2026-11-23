import { z } from "zod";

import { ExpensePaymentMethodAPISchema } from "@/features/payment-methods/schemas/payment-method.schema";
import {
  hasAtMostTwoDecimals,
  isPositiveAmount,
  MAX_AMOUNT,
  type ValidationTranslator,
} from "@/shared/lib/validation";
import type { CurrencyCode } from "@/shared/utils/format-currency";
import { PaginationMetaSchema } from "@/shared/utils/pagination";

export const ExpenseAPIResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  amount: z.string(),
  currency: z.string().default("COP"),
  date: z.string(),
  description: z.string().nullable().optional(),
  paymentMethod: ExpensePaymentMethodAPISchema.nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type ExpenseApi = z.infer<typeof ExpenseAPIResponseSchema>;

const ExpensesPaginationMetaSchema = PaginationMetaSchema.extend({
  totalAmount: z.coerce.number(),
});

export const ExpensesAPIResponseSchema = z.object({
  data: z.array(ExpenseAPIResponseSchema),
  meta: ExpensesPaginationMetaSchema,
});
export type ExpensesResponseApi = z.infer<typeof ExpensesAPIResponseSchema>;
export type ExpensesPaginationMeta = z.infer<
  typeof ExpensesPaginationMetaSchema
>;

/** Built per-envelope so currency is structurally locked to the parent envelope. */
export const buildExpenseSchema = (
  currency: CurrencyCode,
  t: ValidationTranslator,
) =>
  z.object({
    name: z
      .string()
      .min(1, { message: t("expenseNameRequired") })
      .refine((value) => value.trim().length > 0, {
        message: t("notOnlySpaces"),
      })
      .transform((value) => value.trim()),
    amount: z
      .string({ message: t("amountRequired") })
      .min(1, { message: t("amountEmpty") })
      .refine(isPositiveAmount, { message: t("amountMustBePositive") })
      .refine(hasAtMostTwoDecimals, { message: t("amountMaxDecimals") })
      .refine((value) => Number(value) <= MAX_AMOUNT, {
        message: t("amountTooLarge"),
      }),
    currency: z.literal(currency),
    date: z.coerce.date<Date>({ message: t("dateRequired") }),
    description: z
      .string()
      .max(500, { message: t("descriptionTooLong") })
      .optional(),
    /** Payment method id, or "" for none. */
    paymentMethodId: z.string(),
  });

export type ExpenseFormValues = z.infer<ReturnType<typeof buildExpenseSchema>>;
