import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";

import { ExpensesService } from "@/features/expenses/services/expenses.service";
import { ApiError } from "@/shared/lib/api-client";
import { isValidUuid } from "@/shared/utils/url-params";

/**
 * Request-deduped (`React.cache`) server read shared by `generateMetadata` and the page body.
 * Redirects to the parent envelope on 404 (prevents a 404 flash after deleting an expense); rethrows other errors for `error.tsx`.
 */
export const getExpenseById = cache(
  async (envelopeId: string, expenseId: string) => {
    if (!isValidUuid(envelopeId)) {
      redirect("/dashboard/envelopes");
    }
    if (!isValidUuid(expenseId)) {
      redirect(`/dashboard/envelope/${envelopeId}`);
    }
    try {
      return await ExpensesService.getById(envelopeId, expenseId);
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        redirect(`/dashboard/envelope/${envelopeId}`);
      }
      throw error;
    }
  },
);
