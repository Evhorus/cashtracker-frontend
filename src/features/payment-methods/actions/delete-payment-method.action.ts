"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath, updateTag } from "next/cache";
import { getTranslations } from "next-intl/server";
import { createSafeAction } from "@/shared/lib/safe-action";
import { PaymentMethodsService } from "../services/payment-methods.service";
import { PAYMENT_METHOD_TAGS } from "../lib/cache-tags";

// eslint-disable-next-line @clerk/next/require-auth-protection -- Protected inside createSafeAction wrapper by calling auth.protect() in the handler.
export const deletePaymentMethodAction = createSafeAction(
  async ({ id }: { id: string }) => {
    await auth.protect();
    await PaymentMethodsService.delete(id);
    updateTag(PAYMENT_METHOD_TAGS.all);
    // Its expenses lose the tag (the backend sets it to null).
    revalidatePath("/dashboard", "layout");
    const t = await getTranslations("paymentMethods.toast");
    return { successMessage: t("deleted") };
  },
);
