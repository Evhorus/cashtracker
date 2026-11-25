import {
  CUT_DAY_MAX,
  CUT_DAY_MIN,
  PAYMENT_METHOD_NAME_MAX_LENGTH,
  PAYMENT_METHOD_TYPES,
  PaymentMethodsApiSchema,
} from "@cashtracker/shared";
import { z } from "zod";

import type { ValidationTranslator } from "@/shared/lib/validation";

export { PaymentMethodsApiSchema as PaymentMethodsAPIResponseSchema };

/** Form shape: cutDay is the raw text of a number input ("" = none). */
export const buildPaymentMethodFormSchema = (t: ValidationTranslator) =>
  z.object({
    name: z
      .string()
      .trim()
      .min(1, { message: t("paymentMethodNameRequired") })
      .max(PAYMENT_METHOD_NAME_MAX_LENGTH, {
        message: t("paymentMethodNameTooLong"),
      }),
    type: z.enum(PAYMENT_METHOD_TYPES),
    color: z.string().min(1),
    cutDay: z
      .string()
      .refine(
        (value) =>
          value === "" ||
          (Number.isInteger(Number(value)) &&
            Number(value) >= CUT_DAY_MIN &&
            Number(value) <= CUT_DAY_MAX),
        { message: t("cutDayRange") },
      ),
  });

export type PaymentMethodFormValues = z.infer<
  ReturnType<typeof buildPaymentMethodFormSchema>
>;

/** Form -> API. The backend drops cutDay for non-credit types anyway;
 * sending null keeps the request honest. */
export const toPaymentMethodRequest = (values: PaymentMethodFormValues) => ({
  name: values.name,
  type: values.type,
  color: values.color,
  cutDay:
    values.type === "credit_card" && values.cutDay !== ""
      ? Number(values.cutDay)
      : null,
});
