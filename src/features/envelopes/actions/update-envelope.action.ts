"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath, updateTag } from "next/cache";
import { EnvelopeFormValues } from "../schemas/envelope.schema";
import { EnvelopesService } from "../services/envelopes.service";
import { getTranslations } from "next-intl/server";

import { createSafeAction } from "@/lib/safe-action";

// The success toast is written here, not read off the API response.
// The backend's `{ message }` is Spanish and has no idea who's reading
// it - the same response has to be able to render in either language.
// Toast wording is presentation, so it belongs on this side of the
// wire; getTranslations resolves it against the caller's own locale.
// eslint-disable-next-line @clerk/next/require-auth-protection -- Protected inside createSafeAction wrapper by calling auth.protect() in the handler.
export const updateEnvelopeAction = createSafeAction(
  async (formData: EnvelopeFormValues & { id: string }) => {
    await auth.protect();
    const { id, ...data } = formData;
    await EnvelopesService.update(id, data as EnvelopeFormValues);

    revalidatePath("/dashboard");
    // updateTag (not revalidateTag) - read-your-own-writes; see
    // categories/actions/delete-category.action.ts for the why.
    updateTag("all-envelopes");
    // Per-category envelope counts change with any envelope write.
    updateTag("category-usage");
    updateTag("envelope");
    updateTag("dashboard-summary");
    updateTag("dashboard-category-breakdown");
    updateTag("dashboard-envelope-breakdown");
    updateTag("dashboard-name-breakdown");
    updateTag("dashboard-breakdown-total");

    const t = await getTranslations("envelopes.toast");

    return { successMessage: t("updated") };
  },
);
