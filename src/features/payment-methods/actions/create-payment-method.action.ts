"use server";

import { auth } from "@clerk/nextjs/server";
import { updateTag } from "next/cache";
import { getTranslations } from "next-intl/server";
import { createSafeAction } from "@/shared/lib/safe-action";
import { PaymentMethodsService } from "../services/payment-methods.service";
import type { PaymentMethodFormValues } from "../schemas/payment-method.schema";
import { PAYMENT_METHOD_TAGS } from "../lib/cache-tags";

// eslint-disable-next-line @clerk/next/require-auth-protection -- Protected inside createSafeAction wrapper by calling auth.protect() in the handler.
export const createPaymentMethodAction = createSafeAction(
  async (values: PaymentMethodFormValues) => {
    await auth.protect();
    await PaymentMethodsService.create(values);
    updateTag(PAYMENT_METHOD_TAGS.all);
    const t = await getTranslations("paymentMethods.toast");
    return { successMessage: t("created") };
  },
);
