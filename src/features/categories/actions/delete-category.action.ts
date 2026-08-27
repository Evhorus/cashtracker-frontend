"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidateTag } from "next/cache";
import { CategoriesService } from "../services/categories.service";
import { createSafeAction } from "@/lib/safe-action";

// eslint-disable-next-line @clerk/next/require-auth-protection -- Protected inside createSafeAction wrapper by calling auth.protect() in the handler.
export const deleteCategoryAction = createSafeAction(async (id: string) => {
  await auth.protect();
  const data = await CategoriesService.delete(id);

  revalidateTag("all-categories", "max");

  return { successMessage: data.message };
});
