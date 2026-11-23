export const PAYMENT_METHOD_TYPES = [
  'credit_card',
  'debit_card',
  'cash',
  'transfer',
] as const;

export type PaymentMethodType = (typeof PAYMENT_METHOD_TYPES)[number];

export const TYPES_WITH_CUT_DAY: readonly PaymentMethodType[] = ['credit_card'];
