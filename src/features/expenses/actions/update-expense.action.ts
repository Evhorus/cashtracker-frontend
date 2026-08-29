"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath, updateTag } from "next/cache";
import { ExpenseFormValues } from "../schemas/expense.schema";
import { ExpensesService } from "../services/expenses.service";
import { createSafeAction } from "@/lib/safe-action";

// eslint-disable-next-line @clerk/next/require-auth-protection -- Protected inside createSafeAction wrapper by calling auth.protect() in the handler.
export const updateExpenseAction = createSafeAction(
  async (
    formData: ExpenseFormValues & { envelopeId: string; expenseId: string },
  ) => {
    await auth.protect();
    const { envelopeId, expenseId, ...data } = formData;
    const response = await ExpensesService.update(
      envelopeId,
      expenseId,
      data as ExpenseFormValues,
    );

    revalidatePath("/dashboard");
    revalidatePath(`/dashboard/envelope/${envelopeId}`);
    // updateTag (not revalidateTag) - read-your-own-writes; see
    // categories/actions/delete-category.action.ts for the why.
    updateTag("all-envelopes");
    updateTag("expense");
    updateTag("dashboard-summary");
    updateTag("dashboard-category-breakdown");
    updateTag("dashboard-recent-expenses");

    return { successMessage: response.message };
  },
);
