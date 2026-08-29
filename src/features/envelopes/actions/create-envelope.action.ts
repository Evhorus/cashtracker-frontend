"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath, updateTag } from "next/cache";
import { EnvelopeFormValues } from "../schemas/envelope.schema";
import { EnvelopesService } from "../services/envelopes.service";
import { createSafeAction } from "@/lib/safe-action";

// eslint-disable-next-line @clerk/next/require-auth-protection -- Protected inside createSafeAction wrapper by calling auth.protect() in the handler.
export const createEnvelopeAction = createSafeAction(
  async (formData: EnvelopeFormValues) => {
    await auth.protect();
    const data = await EnvelopesService.create(formData);

    revalidatePath("/dashboard");
    // updateTag (not revalidateTag) - read-your-own-writes; see
    // categories/actions/delete-category.action.ts for the why.
    updateTag("all-envelopes");
    updateTag("dashboard-summary");
    updateTag("dashboard-category-breakdown");

    return { successMessage: data.message };
  },
);
