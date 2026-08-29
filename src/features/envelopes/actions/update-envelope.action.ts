"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath, updateTag } from "next/cache";
import { EnvelopeFormValues } from "../schemas/envelope.schema";
import { EnvelopesService } from "../services/envelopes.service";
import { createSafeAction } from "@/lib/safe-action";

// eslint-disable-next-line @clerk/next/require-auth-protection -- Protected inside createSafeAction wrapper by calling auth.protect() in the handler.
export const updateEnvelopeAction = createSafeAction(
  async (formData: EnvelopeFormValues & { id: string }) => {
    await auth.protect();
    const { id, ...data } = formData;
    const response = await EnvelopesService.update(
      id,
      data as EnvelopeFormValues,
    );

    revalidatePath("/dashboard");
    // updateTag (not revalidateTag) - read-your-own-writes; see
    // categories/actions/delete-category.action.ts for the why.
    updateTag("all-envelopes");
    updateTag("envelope");
    updateTag("dashboard-summary");

    return { successMessage: response.message };
  },
);
