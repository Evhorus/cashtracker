import "server-only";

import { cache } from "react";

import { PaymentMethodsService } from "@/features/payment-methods/services/payment-methods.service";

export const getPaymentMethods = cache(() => PaymentMethodsService.getAll());
