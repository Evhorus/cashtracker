/** URL payment-method filter helpers (`?methods=a,b,none`, where `none` means unassigned). */

export const UNASSIGNED_METHOD = "none";

export interface MethodFilter {
  /** Selected ids including `none` (for UI controls). */
  selected: string[];
  paymentMethodIds: string[];
  includeUnassigned: boolean;
}

export function parseMethodFilter(param: string | undefined): MethodFilter {
  const selected = (param ?? "").split(",").filter(Boolean);
  return {
    selected,
    paymentMethodIds: selected.filter((id) => id !== UNASSIGNED_METHOD),
    includeUnassigned: selected.includes(UNASSIGNED_METHOD),
  };
}

export function toggleMethod(selected: string[], id: string): string[] {
  return selected.includes(id)
    ? selected.filter((current) => current !== id)
    : [...selected, id];
}

interface ExpenseWithMethod {
  paymentMethod: { id: string; name: string; color: string } | null;
}

export interface MethodOption {
  /** Payment method id or `UNASSIGNED_METHOD`. */
  id: string;
  /** Null for `UNASSIGNED_METHOD` (translated at render time). */
  name: string | null;
  color: string | null;
}

/** Returns unique payment methods used in `expenses` (plus `none` if any are unassigned), or [] if fewer than 2 options exist. */
export function methodOptionsFor(
  expenses: ExpenseWithMethod[],
): MethodOption[] {
  const options = new Map<string, MethodOption>();
  for (const { paymentMethod } of expenses) {
    if (paymentMethod) {
      options.set(paymentMethod.id, {
        id: paymentMethod.id,
        name: paymentMethod.name,
        color: paymentMethod.color,
      });
    }
  }
  if (expenses.some((expense) => expense.paymentMethod === null)) {
    options.set(UNASSIGNED_METHOD, {
      id: UNASSIGNED_METHOD,
      name: null,
      color: null,
    });
  }
  return options.size >= 2 ? [...options.values()] : [];
}
