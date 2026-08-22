"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { EnvelopeFormValues } from "../schemas/envelope.schema";
import { EnvelopesService } from "../services/envelopes.service";
import { createSafeAction } from "@/lib/safe-action";

// eslint-disable-next-line @clerk/next/require-auth-protection -- Protected inside createSafeAction wrapper by calling auth.protect() in the handler.
export const createEnvelopeAction = createSafeAction(
  async (formData: EnvelopeFormValues) => {
    await auth.protect();
    const data = await EnvelopesService.create(formData);

    revalidatePath("/dashboard");
    revalidateTag("all-envelopes", "max");
    revalidateTag("dashboard-summary", "max");

    return { successMessage: data.message };
  },
);
