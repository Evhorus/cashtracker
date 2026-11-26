"use server";

import { auth } from "@clerk/nextjs/server";
import { getTranslations } from "next-intl/server";

import { refreshDashboard } from "@/features/dashboard/lib/refresh-dashboard";
import { createSafeAction } from "@/shared/lib/safe-action";
import { CategoriesService } from "@/features/categories/services/categories.service";

// Toast wording is resolved here via getTranslations because backend messages are hardcoded in Spanish.
// eslint-disable-next-line @clerk/next/require-auth-protection -- Protected inside createSafeAction wrapper by calling auth.protect() in the handler.
export const deleteCategoryAction = createSafeAction(async (id: string) => {
  await auth.protect();
  await CategoriesService.delete(id);

  // Refresh entire dashboard since envelopes and spending breakdowns embed this category.
  refreshDashboard();

  const t = await getTranslations("categories.toast");

  return { successMessage: t("deleted") };
});
