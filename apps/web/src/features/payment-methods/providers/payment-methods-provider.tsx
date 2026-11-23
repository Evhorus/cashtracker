"use client";

import { createContext, use } from "react";
import type { PaymentMethod } from "../types";

const PaymentMethodsContext = createContext<Promise<PaymentMethod[]> | null>(
  null,
);

/** The signed-in user's payment methods, fetched once in the dashboard
 * layout and passed as a promise - same pattern as CategoriesProvider. */
export function PaymentMethodsProvider({
  paymentMethods,
  children,
}: {
  paymentMethods: Promise<PaymentMethod[]>;
  children: React.ReactNode;
}) {
  return (
    <PaymentMethodsContext.Provider value={paymentMethods}>
      {children}
    </PaymentMethodsContext.Provider>
  );
}

export function usePaymentMethods(): PaymentMethod[] {
  const value = use(PaymentMethodsContext);
  if (value === null) {
    throw new Error(
      "usePaymentMethods must be used within a PaymentMethodsProvider",
    );
  }
  return use(value);
}
