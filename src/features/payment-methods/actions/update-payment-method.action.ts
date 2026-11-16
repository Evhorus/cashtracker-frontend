"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath, updateTag } from "next/cache";
import { getTranslations } from "next-intl/server";
import { createSafeAction } from "@/shared/lib/safe-action";
import { PaymentMethodsService } from "../services/payment-methods.service";
import type { PaymentMethodFormValues } from "../schemas/payment-method.schema";
import { PAYMENT_METHOD_TAGS } from "../lib/cache-tags";

// eslint-disable-next-line @clerk/next/require-auth-protection -- Protected inside createSafeAction wrapper by calling auth.protect() in the handler.
export const updatePaymentMethodAction = createSafeAction(
  async ({ id, ...values }: PaymentMethodFormValues & { id: string }) => {
    await auth.protect();
    await PaymentMethodsService.update(id, values);
    updateTag(PAYMENT_METHOD_TAGS.all);
    // Expenses embed the name and colour, so every page showing them
    // has to re-read.
    revalidatePath("/dashboard", "layout");
    const t = await getTranslations("paymentMethods.toast");
    return { successMessage: t("updated") };
  },
);
