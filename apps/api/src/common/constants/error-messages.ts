// Non-owners receive NOT_FOUND (not 403) to prevent resource enumeration.
export const ERROR_MESSAGES = {
  ENVELOPE_NOT_FOUND: 'Envelope not found',
  ENVELOPE_CURRENCY_LOCKED:
    'No puedes cambiar la moneda de un sobre que ya tiene gastos',

  EXPENSE_NOT_FOUND: 'Expense not found',
  EXPENSE_CURRENCY_MISMATCH: 'La moneda del gasto debe ser la misma del sobre',

  CATEGORY_NOT_FOUND: 'Category not found',
  CATEGORY_ALREADY_EXISTS: 'Ya tienes una categoría con ese nombre',

  PAYMENT_METHOD_NOT_FOUND: 'Payment method not found',
  PAYMENT_METHOD_ALREADY_EXISTS: 'Ya tienes un medio de pago con ese nombre',

  INVALID_DATE_FORMAT: 'La fecha debe tener el formato YYYY-MM-DD',
  INVALID_DATE_RANGE: 'La fecha final no puede ser anterior a la inicial',
  AMOUNT_TOO_LARGE: 'El monto supera el máximo permitido',
} as const;

export type ErrorMessage = (typeof ERROR_MESSAGES)[keyof typeof ERROR_MESSAGES];
