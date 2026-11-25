import { parseCalendarDate } from "@/shared/utils/date-helpers";
import type { CurrencyCode } from "@/shared/utils/format-currency";
import type { DashboardRecentExpenseApi } from "@/features/dashboard/schemas/dashboard.schema";
import type { DashboardRecentExpense } from "@/features/dashboard/types";

export const DashboardMapper = {
  recentExpenseFromApi: (
    apiExpense: DashboardRecentExpenseApi,
  ): DashboardRecentExpense => ({
    id: apiExpense.id,
    name: apiExpense.name,
    amount: apiExpense.amount,
    currency: apiExpense.currency as CurrencyCode,
    date: parseCalendarDate(apiExpense.date),
    envelopeId: apiExpense.envelopeId,
    envelopeName: apiExpense.envelopeName,
  }),
};
