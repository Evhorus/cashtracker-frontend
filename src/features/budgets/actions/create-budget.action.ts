"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { BudgetFormValues } from "../schemas/budget.schema";
import { BudgetsService } from "../services/budgets.service";
import { createSafeAction } from "@/lib/safe-action";

// eslint-disable-next-line @clerk/next/require-auth-protection -- Protected inside createSafeAction wrapper by calling auth.protect() in the handler.
export const createBudgetAction = createSafeAction(
  async (formData: BudgetFormValues) => {
    await auth.protect();
    const data = await BudgetsService.create(formData);

    revalidatePath("/dashboard");
    revalidateTag("all-budgets", "max");

    return { successMessage: data.message };
  },
);
