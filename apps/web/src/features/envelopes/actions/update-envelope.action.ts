"use server";

import { auth } from "@clerk/nextjs/server";
import { getTranslations } from "next-intl/server";

import { refreshDashboard } from "@/features/dashboard/lib/refresh-dashboard";
import { createSafeAction } from "@/shared/lib/safe-action";
import { EnvelopeFormValues } from "../schemas/envelope.schema";
import { EnvelopesService } from "../services/envelopes.service";

// Localize success toasts here instead of returning the backend's Spanish `{ message }`.
// eslint-disable-next-line @clerk/next/require-auth-protection -- Protected inside createSafeAction wrapper by calling auth.protect() in the handler.
export const updateEnvelopeAction = createSafeAction(
  async (formData: EnvelopeFormValues & { id: string }) => {
    await auth.protect();
    const { id, ...data } = formData;
    await EnvelopesService.update(id, data as EnvelopeFormValues);

    refreshDashboard();

    const t = await getTranslations("envelopes.toast");

    return { successMessage: t("updated") };
  },
);
