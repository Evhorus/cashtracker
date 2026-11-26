"use server";

import { auth } from "@clerk/nextjs/server";
import { getTranslations } from "next-intl/server";

import { refreshDashboard } from "@/features/dashboard/lib/refresh-dashboard";
import { createSafeAction } from "@/shared/lib/safe-action";
import { PaymentMethodsService } from "@/features/payment-methods/services/payment-methods.service";

// eslint-disable-next-line @clerk/next/require-auth-protection -- Protected inside createSafeAction wrapper by calling auth.protect() in the handler.
export const deletePaymentMethodAction = createSafeAction(
  async ({ id }: { id: string }) => {
    await auth.protect();
    await PaymentMethodsService.delete(id);
    refreshDashboard();
    const t = await getTranslations("paymentMethods.toast");
    return { successMessage: t("deleted") };
  },
);
