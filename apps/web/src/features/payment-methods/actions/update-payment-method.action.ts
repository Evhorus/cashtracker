"use server";

import { auth } from "@clerk/nextjs/server";
import { getTranslations } from "next-intl/server";

import { refreshDashboard } from "@/features/dashboard/lib/refresh-dashboard";
import { createSafeAction } from "@/shared/lib/safe-action";
import type { PaymentMethodFormValues } from "../schemas/payment-method.schema";
import { PaymentMethodsService } from "../services/payment-methods.service";

// eslint-disable-next-line @clerk/next/require-auth-protection -- Protected inside createSafeAction wrapper by calling auth.protect() in the handler.
export const updatePaymentMethodAction = createSafeAction(
  async ({ id, ...values }: PaymentMethodFormValues & { id: string }) => {
    await auth.protect();
    await PaymentMethodsService.update(id, values);
    refreshDashboard();
    const t = await getTranslations("paymentMethods.toast");
    return { successMessage: t("updated") };
  },
);
