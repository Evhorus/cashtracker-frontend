"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidateTag } from "next/cache";
import { CategoryFormValues } from "../schemas/category.schema";
import { CategoriesService } from "../services/categories.service";
import { createSafeAction } from "@/lib/safe-action";

// eslint-disable-next-line @clerk/next/require-auth-protection -- Protected inside createSafeAction wrapper by calling auth.protect() in the handler.
export const createCategoryAction = createSafeAction(
  async (formData: CategoryFormValues) => {
    await auth.protect();
    const data = await CategoriesService.create(formData);

    revalidateTag("all-categories", "max");

    return { successMessage: data.message };
  },
);
