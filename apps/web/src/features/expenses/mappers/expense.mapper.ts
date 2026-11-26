import type { z } from "zod";

import {
  parseDateInput,
  parseCalendarDate,
  formatCalendarDateForApi,
  toFormCalendarDate,
} from "@/shared/utils/date-helpers";
import type { ExpenseFormValues } from "@/features/expenses/schemas/expense.schema";
import type { ExpenseAPIResponseSchema } from "@/features/expenses/schemas/expense.schema";
import type { Expense } from "@/features/expenses/types";

type ApiExpense = z.infer<typeof ExpenseAPIResponseSchema>;

/** Client -> Server Action payload with `date` pre-formatted as "yyyy-MM-dd" to avoid UTC server day shifts. */
export type ExpenseActionPayload = Omit<ExpenseFormValues, "date"> & {
  date: string;
};

export const ExpenseMapper = {
  /** Formats client/form data for the API (`date` as a "yyyy-MM-dd" calendar string). */
  toApiRequest: (data: ExpenseActionPayload | ExpenseFormValues) => ({
    name: data.name,
    amount: Number(data.amount),
    currency: data.currency,
    date:
      typeof data.date === "string"
        ? data.date
        : formatCalendarDateForApi(data.date),
    description: data.description,
    // null clears it on an edit; the backend checks ownership.
    paymentMethodId: data.paymentMethodId || null,
  }),

  fromApi: (apiExpense: ApiExpense): Expense => {
    return {
      id: apiExpense.id,
      name: apiExpense.name,
      amount: apiExpense.amount,
      date: parseCalendarDate(apiExpense.date),
      description: apiExpense.description ?? undefined,
      paymentMethod: apiExpense.paymentMethod ?? null,
      createdAt: parseDateInput(apiExpense.createdAt),
      updatedAt: parseDateInput(apiExpense.updatedAt),
    };
  },

  /** Converts UTC-anchored `expense.date` to a browser-local Date for react-day-picker (client-only). */
  toFormValues: (
    expense: Expense,
  ): Pick<
    ExpenseFormValues,
    "name" | "amount" | "description" | "date" | "paymentMethodId"
  > => ({
    name: expense.name,
    amount: expense.amount,
    description: expense.description ?? "",
    date: toFormCalendarDate(expense.date),
    paymentMethodId: expense.paymentMethod?.id ?? "",
  }),
};
