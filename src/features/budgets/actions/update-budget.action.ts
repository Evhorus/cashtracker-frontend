"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { BudgetFormValues } from "../schemas/budget.schema";
import { BudgetsService } from "../services/budgets.service";
import { createSafeAction } from "@/shared/lib/safe-action";

// eslint-disable-next-line @clerk/next/require-auth-protection -- Protected inside createSafeAction wrapper by calling auth.protect() in the handler.
export const updateBudgetAction = createSafeAction(
  async (formData: BudgetFormValues & { id: string }) => {
    await auth.protect();
    const { id, ...data } = formData;
    const response = await BudgetsService.update(id, data as BudgetFormValues);

    revalidatePath("/dashboard");
    revalidateTag("all-budgets", "max");
    revalidateTag("budget", "max");

    return { successMessage: response.message };
  },
);
