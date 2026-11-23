export const PAYMENT_METHOD_TYPES = [
  "credit_card",
  "debit_card",
  "cash",
  "transfer",
] as const;

export type PaymentMethodType = (typeof PAYMENT_METHOD_TYPES)[number];

export interface PaymentMethod {
  id: string;
  name: string;
  type: PaymentMethodType;
  /** oklch() string from the backend's PRESET_COLORS whitelist. */
  color: string;
  /** Statement cut-off day (credit cards only). */
  cutDay: number | null;
}

export type ExpensePaymentMethod = Pick<PaymentMethod, "id" | "name" | "color">;
