"use server";
import { auth } from "@clerk/nextjs/server";
import { CategoriesService } from "@/features/categories/services/categories.service";

export const getCategoriesAction = async () => {
  await auth.protect();

  try {
    // Delegates to CategoriesService (fetchApi + Zod validation +
    // CategoryMapper) instead of an unchecked raw fetch, same as
    // getEnvelopesAction.
    return await CategoriesService.getAll();
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
};
