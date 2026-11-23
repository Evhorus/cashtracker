"use server";

import { auth } from "@clerk/nextjs/server";
import { CategoriesService } from "../services/categories.service";
import { getTranslations } from "next-intl/server";

import { createSafeAction } from "@/shared/lib/safe-action";
import { refreshDashboard } from "@/features/dashboard/lib/refresh-dashboard";

// The success toast is written here, not read off the API response.
// The backend's `{ message }` is Spanish and has no idea who's reading
// it - the same response has to be able to render in either language.
// Toast wording is presentation, so it belongs on this side of the
// wire; getTranslations resolves it against the caller's own locale.
// eslint-disable-next-line @clerk/next/require-auth-protection -- Protected inside createSafeAction wrapper by calling auth.protect() in the handler.
export const deleteCategoryAction = createSafeAction(async (id: string) => {
  await auth.protect();
  await CategoriesService.delete(id);

  // Envelopes using the category lose it, and the dashboard breakdown
  // moves their spending to "no category" - refreshDashboard covers every
  // page that shows either.
  refreshDashboard();

  const t = await getTranslations("categories.toast");

  return { successMessage: t("deleted") };
});
