import { fetchApi } from "@/shared/lib/api-client";
import {
  PaymentMethodsAPIResponseSchema,
  toPaymentMethodRequest,
  type PaymentMethodFormValues,
} from "@/features/payment-methods/schemas/payment-method.schema";
import type { PaymentMethod } from "@/features/payment-methods/types";

export const PaymentMethodsService = {
  getAll: (): Promise<PaymentMethod[]> =>
    fetchApi<PaymentMethod[]>(
      "/payment-methods",
      undefined,
      PaymentMethodsAPIResponseSchema,
    ),

  create: (values: PaymentMethodFormValues) =>
    fetchApi<{ id: string; message: string }>("/payment-methods", {
      method: "POST",
      body: JSON.stringify(toPaymentMethodRequest(values)),
    }),

  update: (id: string, values: PaymentMethodFormValues) =>
    fetchApi<{ message: string }>(
      `/payment-methods/${encodeURIComponent(id)}`,
      {
        method: "PATCH",
        body: JSON.stringify(toPaymentMethodRequest(values)),
      },
    ),

  delete: (id: string) =>
    fetchApi<{ message: string }>(
      `/payment-methods/${encodeURIComponent(id)}`,
      {
        method: "DELETE",
      },
    ),
};
