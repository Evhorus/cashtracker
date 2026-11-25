import { z } from "zod";

export const PAYMENT_METHOD_TYPES = [
  "credit_card",
  "debit_card",
  "cash",
  "transfer",
] as const;

export type PaymentMethodType = (typeof PAYMENT_METHOD_TYPES)[number];
export const PaymentMethodTypeSchema = z.enum(PAYMENT_METHOD_TYPES);

export const TYPES_WITH_CUT_DAY: readonly PaymentMethodType[] = ["credit_card"];

export const PAYMENT_METHOD_NAME_MAX_LENGTH = 50;
export const CUT_DAY_MIN = 1;
export const CUT_DAY_MAX = 31;

export const PaymentMethodApiSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: PaymentMethodTypeSchema,
  color: z.string(),
  cutDay: z.number().nullable(),
});
export type PaymentMethodApi = z.infer<typeof PaymentMethodApiSchema>;

export const PaymentMethodsApiSchema = z.array(PaymentMethodApiSchema);
export type PaymentMethodsResponseApi = z.infer<typeof PaymentMethodsApiSchema>;

export const ExpensePaymentMethodApiSchema = z.object({
  id: z.string(),
  name: z.string(),
  color: z.string(),
});
export type ExpensePaymentMethodApi = z.infer<
  typeof ExpensePaymentMethodApiSchema
>;
