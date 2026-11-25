"use server";

import { auth } from "@clerk/nextjs/server";
import { getTranslations } from "next-intl/server";

import { refreshDashboard } from "@/features/dashboard/lib/refresh-dashboard";
import { createSafeAction } from "@/shared/lib/safe-action";
import { EnvelopesService } from "@/features/envelopes/services/envelopes.service";

// DELETE returns the removed entity (no `{ message }`), and toast copy is localized via getTranslations.
// eslint-disable-next-line @clerk/next/require-auth-protection -- Protected inside createSafeAction wrapper by calling auth.protect() in the handler.
export const deleteEnvelopeAction = createSafeAction(
  async (envelopeId: string) => {
    await auth.protect();
    await EnvelopesService.delete(envelopeId);

    refreshDashboard();

    const t = await getTranslations("envelopes.toast");

    return { successMessage: t("deleted") };
  },
);
