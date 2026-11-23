"use server";

import { auth } from "@clerk/nextjs/server";
import { ExpenseFormValues } from "../schemas/expense.schema";
import { ExpensesService } from "../services/expenses.service";
import { getTranslations } from "next-intl/server";

import { createSafeAction } from "@/shared/lib/safe-action";
import { refreshDashboard } from "@/features/dashboard/lib/refresh-dashboard";

// The success toast is written here, not read off the API response.
// The backend's `{ message }` is Spanish and has no idea who's reading
// it - the same response has to be able to render in either language.
// Toast wording is presentation, so it belongs on this side of the
// wire; getTranslations resolves it against the caller's own locale.
// eslint-disable-next-line @clerk/next/require-auth-protection -- Protected inside createSafeAction wrapper by calling auth.protect() in the handler.
export const updateExpenseAction = createSafeAction(
  async (
    formData: ExpenseFormValues & { envelopeId: string; expenseId: string },
  ) => {
    await auth.protect();
    const { envelopeId, expenseId, ...data } = formData;
    await ExpensesService.update(
      envelopeId,
      expenseId,
      data as ExpenseFormValues,
    );

    refreshDashboard();

    const t = await getTranslations("expenses.toast");

    return { successMessage: t("updated") };
  },
);
