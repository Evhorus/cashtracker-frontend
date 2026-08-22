"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { ExpenseFormValues } from "../schemas/expense.schema";
import { ExpensesService } from "../services/expenses.service";
import { createSafeAction } from "@/lib/safe-action";

// eslint-disable-next-line @clerk/next/require-auth-protection -- Protected inside createSafeAction wrapper by calling auth.protect() in the handler.
export const createExpenseAction = createSafeAction(
  async (formData: ExpenseFormValues & { envelopeId: string }) => {
    await auth.protect();
    const { envelopeId, ...data } = formData;
    const response = await ExpensesService.create(
      envelopeId,
      data as ExpenseFormValues,
    );

    revalidatePath("/dashboard");
    revalidatePath(`/dashboard/envelope/${envelopeId}`);
    revalidateTag("all-envelopes", "max");
    revalidateTag("dashboard-summary", "max");

    return { successMessage: response.message };
  },
);
