import { EnvelopeHelpers } from "@/features/envelopes/lib/envelope-helpers";
import type { Envelope } from "@/features/envelopes/types";
import type { Expense } from "../types";

/** Matches backend `PaginationQueryDto` max `limit`. */
export const EXPENSES_MAX_PAGE_SIZE = 100;
export const EXPENSES_DEFAULT_PAGE_SIZE = 10;

export const EXPENSES_PAGE_SIZE_OPTIONS = [
  10,
  20,
  EXPENSES_MAX_PAGE_SIZE,
] as const;

export const ExpenseHelpers = {
  getAmount: (expense: Expense): number => Number(expense.amount),

  getImpactPercentage: (
    expense: Expense,
    envelope: Envelope,
  ): number | null => {
    const envelopeAmount = EnvelopeHelpers.getAmount(envelope);
    if (
      envelopeAmount === null ||
      !Number.isFinite(envelopeAmount) ||
      envelopeAmount <= 0
    ) {
      return null;
    }
    return (ExpenseHelpers.getAmount(expense) / envelopeAmount) * 100;
  },
};
