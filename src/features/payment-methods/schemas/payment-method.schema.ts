import { z } from "zod";
import type { ValidationTranslator } from "@/shared/lib/validation";
import { PAYMENT_METHOD_TYPES } from "../types";

export const PaymentMethodAPIResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(PAYMENT_METHOD_TYPES),
  color: z.string(),
  cutDay: z.number().nullable(),
});

export const PaymentMethodsAPIResponseSchema = z.array(
  PaymentMethodAPIResponseSchema,
);

export const ExpensePaymentMethodAPISchema = z.object({
  id: z.string(),
  name: z.string(),
  color: z.string(),
});

/** Form shape: cutDay is the raw text of a number input ("" = none). */
export const buildPaymentMethodFormSchema = (t: ValidationTranslator) =>
  z.object({
    name: z
      .string()
      .trim()
      .min(1, { message: t("paymentMethodNameRequired") })
      .max(50, { message: t("paymentMethodNameTooLong") }),
    type: z.enum(PAYMENT_METHOD_TYPES),
    color: z.string().min(1),
    cutDay: z
      .string()
      .refine(
        (value) =>
          value === "" ||
          (Number.isInteger(Number(value)) &&
            Number(value) >= 1 &&
            Number(value) <= 31),
        { message: t("cutDayRange") },
      ),
  });

export type PaymentMethodFormValues = z.infer<
  ReturnType<typeof buildPaymentMethodFormSchema>
>;

/** Form -> API. The backend drops cutDay for non-credit types anyway;
 * sending null keeps the request honest. */
export const toPaymentMethodRequest = (values: PaymentMethodFormValues) => ({
  name: values.name,
  type: values.type,
  color: values.color,
  cutDay:
    values.type === "credit_card" && values.cutDay !== ""
      ? Number(values.cutDay)
      : null,
});
