"use server";

import { auth } from "@clerk/nextjs/server";
import { getTranslations } from "next-intl/server";

import { refreshDashboard } from "@/features/dashboard/lib/refresh-dashboard";
import { createSafeAction } from "@/shared/lib/safe-action";
import type { PaymentMethodFormValues } from "@/features/payment-methods/schemas/payment-method.schema";
import { PaymentMethodsService } from "@/features/payment-methods/services/payment-methods.service";

// eslint-disable-next-line @clerk/next/require-auth-protection -- Protected inside createSafeAction wrapper by calling auth.protect() in the handler.
export const createPaymentMethodAction = createSafeAction(
  async (values: PaymentMethodFormValues) => {
    await auth.protect();
    const created = await PaymentMethodsService.create(values);
    refreshDashboard();
    const t = await getTranslations("paymentMethods.toast");
    return { data: { id: created.id }, successMessage: t("created") };
  },
);
