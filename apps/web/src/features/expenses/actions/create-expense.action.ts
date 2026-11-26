"use server";

import { auth } from "@clerk/nextjs/server";
import { getTranslations } from "next-intl/server";

import { refreshDashboard } from "@/features/dashboard/lib/refresh-dashboard";
import { createSafeAction } from "@/shared/lib/safe-action";
import type { ExpenseActionPayload } from "@/features/expenses/mappers/expense.mapper";
import { ExpensesService } from "@/features/expenses/services/expenses.service";

// Localize success toasts here instead of returning the backend's Spanish `{ message }`.
// eslint-disable-next-line @clerk/next/require-auth-protection -- Protected inside createSafeAction wrapper by calling auth.protect() in the handler.
export const createExpenseAction = createSafeAction(
  async (formData: ExpenseActionPayload & { envelopeId: string }) => {
    await auth.protect();
    const { envelopeId, ...data } = formData;
    await ExpensesService.create(envelopeId, data);

    refreshDashboard();

    const t = await getTranslations("expenses.toast");

    return { successMessage: t("created") };
  },
);
