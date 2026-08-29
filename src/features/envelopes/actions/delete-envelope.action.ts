"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath, updateTag } from "next/cache";
import { EnvelopesService } from "../services/envelopes.service";
import { createSafeAction } from "@/lib/safe-action";

// Goes through EnvelopesService + createSafeAction like every other
// mutation, instead of the raw authenticatedFetch + hand-rolled
// try/catch this used to be - that bypass meant no ApiError, no
// consistent error shape, and left EnvelopesService.delete dead code.
//
// The success message is hardcoded here rather than read off the
// response: unlike create/update (which return `{ message }`), the
// backend's DELETE returns the *removed entity* - see
// envelopes.service.ts's `remove()` in cashtracker-backend, which
// returns `envelopesRepository.remove(envelope)`. Reading a `.message`
// off that would be `undefined`, which useActionWithToast treats as "no
// success" - no toast, and the dialog never closes.
// eslint-disable-next-line @clerk/next/require-auth-protection -- Protected inside createSafeAction wrapper by calling auth.protect() in the handler.
export const deleteEnvelopeAction = createSafeAction(
  async (envelopeId: string) => {
    await auth.protect();
    await EnvelopesService.delete(envelopeId);

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/envelopes");
    // updateTag (not revalidateTag) - read-your-own-writes; see
    // categories/actions/delete-category.action.ts for the why.
    updateTag("all-envelopes");
    // Per-category envelope counts change with any envelope write.
    updateTag("category-usage");
    // Also the detail-endpoint tag: without it a deleted envelope's own
    // cached detail response stayed servable. (That tag is global rather
    // than per-id today - see the note in envelopes.service.ts.)
    updateTag("envelope");
    updateTag("dashboard-summary");
    updateTag("dashboard-category-breakdown");

    return { successMessage: "Sobre eliminado correctamente." };
  },
);
