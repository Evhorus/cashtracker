import {
  EXPENSE_DESCRIPTION_MAX_LENGTH,
  ExpenseApiSchema,
  ExpensesApiSchema,
  MAX_AMOUNT,
  type CurrencyCode,
  type ExpenseApi,
  type ExpensesPaginationMeta,
  type ExpensesResponseApi,
} from "@cashtracker/shared";
import { z } from "zod";

import {
  hasAtMostTwoDecimals,
  isPositiveAmount,
  type ValidationTranslator,
} from "@/shared/lib/validation";

export {
  ExpenseApiSchema as ExpenseAPIResponseSchema,
  ExpensesApiSchema as ExpensesAPIResponseSchema,
  type ExpenseApi,
  type ExpensesPaginationMeta,
  type ExpensesResponseApi,
};

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
      .max(EXPENSE_DESCRIPTION_MAX_LENGTH, { message: t("descriptionTooLong") })
      .optional(),
    /** Payment method id, or "" for none. */
    paymentMethodId: z.string(),
  });

export type ExpenseFormValues = z.infer<ReturnType<typeof buildExpenseSchema>>;
