import { ExpenseMapper } from "@/features/expenses/mappers/expense.mapper";
import type { Expense } from "@/features/expenses/types";
import { parseCalendarDate } from "@/shared/utils/date-helpers";
import type { CurrencyCode } from "@/shared/utils/format-currency";
import { EnvelopeFormValues } from "../schemas/envelope.schema";
import { EnvelopeApi } from "../schemas/envelope.schema";
import { Envelope } from "../types";

/** List endpoint reports the range; detail endpoint embeds expenses so derive it from them. */
function expenseDateRange(
  apiEnvelope: EnvelopeApi,
  expenses: Expense[],
): Envelope["expenseDateRange"] {
  if (apiEnvelope.firstExpenseDate && apiEnvelope.lastExpenseDate) {
    return {
      first: parseCalendarDate(apiEnvelope.firstExpenseDate),
      last: parseCalendarDate(apiEnvelope.lastExpenseDate),
    };
  }
  if (expenses.length === 0) return null;
  const times = expenses.map((expense) => expense.date.getTime());
  return {
    first: new Date(Math.min(...times)),
    last: new Date(Math.max(...times)),
  };
}

export const EnvelopeMapper = {
  toApiRequest: (data: EnvelopeFormValues) => ({
    name: data.name,
    amount: data.hasLimit ? Number(data.amount) : null,
    currency: data.currency,
    // Empty string from cleared picker means "no category" (API expects null).
    categoryId: data.categoryId || null,
  }),

  fromApi: (apiEnvelope: EnvelopeApi): Envelope => {
    // Only the detail endpoint embeds expenses; list endpoint omits them.
    const expenses = apiEnvelope.expenses?.map(ExpenseMapper.fromApi) ?? [];
    return {
      id: apiEnvelope.id,
      name: apiEnvelope.name,
      amount: apiEnvelope.amount,
      // Narrow loose API string to CurrencyCode (values originate from this app's selector).
      currency: apiEnvelope.currency as CurrencyCode,
      spent: apiEnvelope.spent,
      status: apiEnvelope.status,
      category: apiEnvelope.category,
      description: apiEnvelope.description ?? undefined,
      createdAt: new Date(apiEnvelope.createdAt),
      updatedAt: new Date(apiEnvelope.updatedAt),
      expenses,
      expenseDateRange: expenseDateRange(apiEnvelope, expenses),
    };
  },
};
