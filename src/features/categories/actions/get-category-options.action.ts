"use server";
import { auth } from "@clerk/nextjs/server";
import { CategoriesService } from "@/features/categories/services/categories.service";

export const getCategoryOptionsAction = async () => {
  await auth.protect();

  try {
    return await CategoriesService.getOptions();
  } catch (error) {
    console.error("Error fetching category options:", error);
    throw error;
  }
};
