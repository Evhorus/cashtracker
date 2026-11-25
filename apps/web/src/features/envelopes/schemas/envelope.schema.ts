import {
  CURRENCY_CODES,
  EnvelopeApiSchema,
  EnvelopesApiSchema,
  MAX_AMOUNT,
  type EnvelopeApi,
  type EnvelopesResponseApi,
} from "@cashtracker/shared";
import { z } from "zod";

import {
  hasAtMostTwoDecimals,
  isPositiveAmount,
  type ValidationTranslator,
} from "@/shared/lib/validation";

export {
  EnvelopeApiSchema as EnvelopeAPIResponseSchema,
  EnvelopesApiSchema as EnvelopesAPIResponseSchema,
  type EnvelopeApi,
  type EnvelopesResponseApi,
};

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
