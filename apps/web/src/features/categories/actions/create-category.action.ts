"use server";

import { auth } from "@clerk/nextjs/server";
import { CategoryFormValues } from "../schemas/category.schema";
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
export const createCategoryAction = createSafeAction(
  async (formData: CategoryFormValues) => {
    await auth.protect();
    const created = await CategoriesService.create(formData);

    // The category is also embedded in envelopes and the dashboard
    // breakdown, so refresh the whole dashboard, not just this list.
    refreshDashboard();

    const t = await getTranslations("categories.toast");

    return { data: { id: created.id }, successMessage: t("created") };
  },
);
