"use server";

import { auth } from "@clerk/nextjs/server";
import { ExpensesService } from "../services/expenses.service";
import { getTranslations } from "next-intl/server";

import { createSafeAction } from "@/shared/lib/safe-action";
import { refreshDashboard } from "@/features/dashboard/lib/refresh-dashboard";

// Goes through ExpensesService + createSafeAction like every other
// mutation - see delete-envelope.action.ts for why the raw
// authenticatedFetch this used to use was worth removing.
//
// Unlike the envelope/category deletes, this endpoint really does
// return `{ message: 'Gasto eliminado' }` (expenses.service.ts's
// `remove()` in cashtracker-backend), so the backend's own wording is
// used when present - with a fallback so a future contract change can't
// silently leave the dialog open with no toast.
// The success toast is written here, not read off the API response.
// The backend's `{ message }` is Spanish and has no idea who's reading
// it - the same response has to be able to render in either language.
// Toast wording is presentation, so it belongs on this side of the
// wire; getTranslations resolves it against the caller's own locale.
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
