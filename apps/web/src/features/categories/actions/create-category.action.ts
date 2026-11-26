"use server";

import { auth } from "@clerk/nextjs/server";
import { getTranslations } from "next-intl/server";

import { refreshDashboard } from "@/features/dashboard/lib/refresh-dashboard";
import { createSafeAction } from "@/shared/lib/safe-action";
import type { CategoryFormValues } from "@/features/categories/schemas/category.schema";
import { CategoriesService } from "@/features/categories/services/categories.service";

// Toast wording is resolved here via getTranslations because backend messages are hardcoded in Spanish.
// eslint-disable-next-line @clerk/next/require-auth-protection -- Protected inside createSafeAction wrapper by calling auth.protect() in the handler.
export const createCategoryAction = createSafeAction(
  async (formData: CategoryFormValues) => {
    await auth.protect();
    const created = await CategoriesService.create(formData);

    // Refresh entire dashboard since envelopes and spending breakdowns embed categories.
    refreshDashboard();

    const t = await getTranslations("categories.toast");

    return { data: { id: created.id }, successMessage: t("created") };
  },
);
