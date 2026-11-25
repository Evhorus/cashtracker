import {
  PAYMENT_METHOD_TYPES,
  type PaymentMethodType,
} from "@cashtracker/shared";

export { PAYMENT_METHOD_TYPES };

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
