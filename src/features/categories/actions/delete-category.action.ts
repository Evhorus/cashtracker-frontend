"use server";

import { auth } from "@clerk/nextjs/server";
import { updateTag } from "next/cache";
import { CategoriesService } from "../services/categories.service";
import { createSafeAction } from "@/lib/safe-action";

// The success message is hardcoded rather than read off the response:
// unlike create/update (which return `{ message }`), the backend's
// DELETE returns the *removed entity* - see categories.service.ts's
// `remove()` in cashtracker-backend, which returns
// `categoriesRepository.remove(category)`. Reading `.message` off that
// gave `undefined`, and useActionWithToast only fires on a truthy
// `success` - so deleting a category showed no toast, left the dialog
// open, and never called router.refresh(), even though the delete had
// actually gone through.
// eslint-disable-next-line @clerk/next/require-auth-protection -- Protected inside createSafeAction wrapper by calling auth.protect() in the handler.
export const deleteCategoryAction = createSafeAction(async (id: string) => {
  await auth.protect();
  await CategoriesService.delete(id);

  // updateTag, not revalidateTag(tag, "max"): every one of these
  // mutations is a read-your-own-writes case - the user changes something
  // and the very next render has to show it. revalidateTag's "max" profile
  // is stale-while-revalidate, so it served the *old* data on that next
  // render and only refreshed in the background (observed: deleting a
  // category left the deleted row on screen until a manual reload).
  // updateTag expires the entry outright so the next request waits for
  // fresh data. It's Server-Action-only, which every action here is.
  updateTag("all-categories");
  // Deleting a category unclassifies its envelopes (ON DELETE SET NULL).
  updateTag("category-usage");

  return { successMessage: "Categoría eliminada correctamente." };
});
