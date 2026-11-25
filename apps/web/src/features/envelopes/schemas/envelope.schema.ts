import { z } from "zod";

import { ExpenseAPIResponseSchema } from "@/features/expenses/schemas/expense.schema";
import {
  hasAtMostTwoDecimals,
  isPositiveAmount,
  MAX_AMOUNT,
  type ValidationTranslator,
} from "@/shared/lib/validation";
import { CURRENCY_CODES } from "@/shared/utils/format-currency";
import { paginatedSchema } from "@/shared/utils/pagination";

export const EnvelopeAPIResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  amount: z.string().nullable(),
  currency: z.string().default("COP"),
  spent: z.string(),
  status: z.enum(["unlimited", "normal", "warning", "exceeded"]),
  category: z
    .object({
      id: z.string(),
      label: z.string(),
      color: z.string(),
      icon: z.string(),
    })
    .nullable(),
  description: z.string().nullable().optional(),
  firstExpenseDate: z.string().nullable().optional(),
  lastExpenseDate: z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  expenses: z.array(ExpenseAPIResponseSchema).optional(),
});

export type EnvelopeApi = z.infer<typeof EnvelopeAPIResponseSchema>;

export const EnvelopesAPIResponseSchema = paginatedSchema(
  EnvelopeAPIResponseSchema,
);
export type EnvelopesResponseApi = z.infer<typeof EnvelopesAPIResponseSchema>;

export const buildEnvelopeFormSchema = (t: ValidationTranslator) =>
  z
    .object({
      name: z
        .string()
        .min(1, { message: t("envelopeNameRequired") })
        .refine((val) => val.trim().length > 0, t("notOnlySpaces"))
        .transform((val) => val.trim()),
      /** UI-only toggle; when false, amount is sent as null (unlimited envelope). */
      hasLimit: z.boolean(),
      amount: z.string().optional(),
      currency: z.enum(CURRENCY_CODES),
      categoryId: z.string().optional(),
    })
    .superRefine((data, ctx) => {
      if (!data.hasLimit) return;

      if (!data.amount?.trim()) {
        ctx.addIssue({
          code: "custom",
          message: t("amountEmpty"),
          path: ["amount"],
        });
        return;
      }

      if (!isPositiveAmount(data.amount)) {
        ctx.addIssue({
          code: "custom",
          message: t("amountMustBePositive"),
          path: ["amount"],
        });
      }

      if (!hasAtMostTwoDecimals(data.amount)) {
        ctx.addIssue({
          code: "custom",
          message: t("amountMaxDecimals"),
          path: ["amount"],
        });
      }

      if (Number(data.amount) > MAX_AMOUNT) {
        ctx.addIssue({
          code: "custom",
          message: t("amountTooLarge"),
          path: ["amount"],
        });
      }
    });

export type EnvelopeFormValues = z.infer<
  ReturnType<typeof buildEnvelopeFormSchema>
>;
