"use client";

import { createContext, useContext } from "react";
import type { PaymentMethod } from "../types";

const PaymentMethodsContext = createContext<PaymentMethod[] | null>(null);

/** The signed-in user's payment methods, fetched once in the dashboard
 * layout - same pattern as CategoriesProvider. */
export function PaymentMethodsProvider({
  paymentMethods,
  children,
}: {
  paymentMethods: PaymentMethod[];
  children: React.ReactNode;
}) {
  return (
    <PaymentMethodsContext.Provider value={paymentMethods}>
      {children}
    </PaymentMethodsContext.Provider>
  );
}

export function usePaymentMethods(): PaymentMethod[] {
  const value = useContext(PaymentMethodsContext);
  if (value === null) {
    throw new Error(
      "usePaymentMethods must be used within a PaymentMethodsProvider",
    );
  }
  return value;
}
