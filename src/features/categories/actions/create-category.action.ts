"use server";

import { auth } from "@clerk/nextjs/server";
import { updateTag } from "next/cache";
import { CategoryFormValues } from "../schemas/category.schema";
import { CategoriesService } from "../services/categories.service";
import { getTranslations } from "next-intl/server";

import { createSafeAction } from "@/lib/safe-action";

// The success toast is written here, not read off the API response.
// The backend's `{ message }` is Spanish and has no idea who's reading
// it - the same response has to be able to render in either language.
// Toast wording is presentation, so it belongs on this side of the
// wire; getTranslations resolves it against the caller's own locale.
// eslint-disable-next-line @clerk/next/require-auth-protection -- Protected inside createSafeAction wrapper by calling auth.protect() in the handler.
export const createCategoryAction = createSafeAction(
  async (formData: CategoryFormValues) => {
    await auth.protect();
    await CategoriesService.create(formData);

    // updateTag (not revalidateTag) - read-your-own-writes; see
    // categories/actions/delete-category.action.ts for the why.
    updateTag("all-categories");

    const t = await getTranslations("categories.toast");

    return { successMessage: t("created") };
  },
);
