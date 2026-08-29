"use server";

import { auth } from "@clerk/nextjs/server";
import { updateTag } from "next/cache";
import { CategoriesService } from "../services/categories.service";
import { getTranslations } from "next-intl/server";

import { createSafeAction } from "@/lib/safe-action";

// The success toast is written here, not read off the API response.
// The backend's `{ message }` is Spanish and has no idea who's reading
// it - the same response has to be able to render in either language.
// Toast wording is presentation, so it belongs on this side of the
// wire; getTranslations resolves it against the caller's own locale.
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

  const t = await getTranslations("categories.toast");

  return { successMessage: t("deleted") };
});
