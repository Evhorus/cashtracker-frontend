"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { ExpenseFormValues } from "../schemas/expense.schema";
import { ExpensesService } from "../services/expenses.service";
import { createSafeAction } from "@/lib/safe-action";

// eslint-disable-next-line @clerk/next/require-auth-protection -- Protected inside createSafeAction wrapper by calling auth.protect() in the handler.
export const createExpenseAction = createSafeAction(
  async (formData: ExpenseFormValues & { budgetId: string }) => {
    await auth.protect();
    const { budgetId, ...data } = formData;
    const response = await ExpensesService.create(
      budgetId,
      data as ExpenseFormValues,
    );

    revalidatePath("/dashboard");
    revalidatePath(`/dashboard/budget/${budgetId}`);
    revalidateTag("all-budgets", "max");

    return { successMessage: response.message };
  },
);
