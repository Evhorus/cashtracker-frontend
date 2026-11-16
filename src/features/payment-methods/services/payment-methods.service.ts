import { fetchApi } from "@/shared/lib/api-client";
import {
  PaymentMethodsAPIResponseSchema,
  toPaymentMethodRequest,
  type PaymentMethodFormValues,
} from "../schemas/payment-method.schema";
import type { PaymentMethod } from "../types";
import { PAYMENT_METHOD_TAGS } from "../lib/cache-tags";

export const PaymentMethodsService = {
  getAll: (): Promise<PaymentMethod[]> =>
    fetchApi<PaymentMethod[]>(
      "/payment-methods",
      { next: { tags: [PAYMENT_METHOD_TAGS.all], revalidate: 60 } },
      PaymentMethodsAPIResponseSchema,
    ),

  create: (values: PaymentMethodFormValues) =>
    fetchApi<{ message: string }>("/payment-methods", {
      method: "POST",
      body: JSON.stringify(toPaymentMethodRequest(values)),
    }),

  update: (id: string, values: PaymentMethodFormValues) =>
    fetchApi<{ message: string }>(`/payment-methods/${id}`, {
      method: "PATCH",
      body: JSON.stringify(toPaymentMethodRequest(values)),
    }),

  delete: (id: string) =>
    fetchApi<{ message: string }>(`/payment-methods/${id}`, {
      method: "DELETE",
    }),
};
