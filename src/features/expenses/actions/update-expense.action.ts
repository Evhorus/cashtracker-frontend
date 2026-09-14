"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath, updateTag } from "next/cache";
import { ExpenseFormValues } from "../schemas/expense.schema";
import { ExpensesService } from "../services/expenses.service";
import { getTranslations } from "next-intl/server";

import { createSafeAction } from "@/shared/lib/safe-action";
import { EXPENSE_TAGS } from "../lib/cache-tags";
import { ENVELOPE_TAGS } from "@/features/envelopes/lib/cache-tags";
import { DASHBOARD_EXPENSE_WRITE_TAGS } from "@/features/dashboard/lib/cache-tags";

// The success toast is written here, not read off the API response.
// The backend's `{ message }` is Spanish and has no idea who's reading
// it - the same response has to be able to render in either language.
// Toast wording is presentation, so it belongs on this side of the
// wire; getTranslations resolves it against the caller's own locale.
// eslint-disable-next-line @clerk/next/require-auth-protection -- Protected inside createSafeAction wrapper by calling auth.protect() in the handler.
export const updateExpenseAction = createSafeAction(
  async (
    formData: ExpenseFormValues & { envelopeId: string; expenseId: string },
  ) => {
    await auth.protect();
    const { envelopeId, expenseId, ...data } = formData;
    await ExpensesService.update(
      envelopeId,
      expenseId,
      data as ExpenseFormValues,
    );

    revalidatePath("/dashboard");
    revalidatePath(`/dashboard/envelope/${envelopeId}`);
    // updateTag (not revalidateTag) - read-your-own-writes; see
    // categories/actions/delete-category.action.ts for the why.
    updateTag(ENVELOPE_TAGS.all);
    updateTag(EXPENSE_TAGS.detail(expenseId));
    DASHBOARD_EXPENSE_WRITE_TAGS.forEach((tag) => updateTag(tag));

    const t = await getTranslations("expenses.toast");

    return { successMessage: t("updated") };
  },
);
