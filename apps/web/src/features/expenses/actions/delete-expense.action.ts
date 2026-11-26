"use server";

import { auth } from "@clerk/nextjs/server";
import { getTranslations } from "next-intl/server";

import { refreshDashboard } from "@/features/dashboard/lib/refresh-dashboard";
import { createSafeAction } from "@/shared/lib/safe-action";
import { ExpensesService } from "@/features/expenses/services/expenses.service";

// Toast wording is resolved here via getTranslations because backend messages are hardcoded in Spanish.
// eslint-disable-next-line @clerk/next/require-auth-protection -- Protected inside createSafeAction wrapper by calling auth.protect() in the handler.
export const deleteExpenseAction = createSafeAction(
  async ({
    envelopeId,
    expenseId,
  }: {
    envelopeId: string;
    expenseId: string;
  }) => {
    await auth.protect();
    await ExpensesService.delete(envelopeId, expenseId);

    refreshDashboard();

    const t = await getTranslations("expenses.toast");

    return { successMessage: t("deleted") };
  },
);
