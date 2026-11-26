"use server";

import { auth } from "@clerk/nextjs/server";
import { getTranslations } from "next-intl/server";

import { refreshDashboard } from "@/features/dashboard/lib/refresh-dashboard";
import { createSafeAction } from "@/shared/lib/safe-action";
import type { EnvelopeFormValues } from "@/features/envelopes/schemas/envelope.schema";
import { EnvelopesService } from "@/features/envelopes/services/envelopes.service";

// Localize success toasts here instead of returning the backend's Spanish `{ message }`.
// eslint-disable-next-line @clerk/next/require-auth-protection -- Protected inside createSafeAction wrapper by calling auth.protect() in the handler.
export const createEnvelopeAction = createSafeAction(
  async (formData: EnvelopeFormValues) => {
    await auth.protect();
    await EnvelopesService.create(formData);

    refreshDashboard();

    const t = await getTranslations("envelopes.toast");

    return { successMessage: t("created") };
  },
);
