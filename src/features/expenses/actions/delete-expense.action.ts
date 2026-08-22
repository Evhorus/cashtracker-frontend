"use server";

import { auth } from "@clerk/nextjs/server";
import { authenticatedFetch } from "@/lib/authenticated-fetch";
import { revalidatePath, revalidateTag } from "next/cache";

// Previously misnamed `DeleteBudgetActionState` (copy-paste from the
// envelope delete action) - this state actually belongs to deleting an
// expense, not an envelope.
type DeleteExpenseActionState = {
  errors: string[];
  success: string;
};

export const deleteExpenseAction = async (
  prevState: DeleteExpenseActionState,
  { envelopeId, expenseId }: { envelopeId: string; expenseId: string },
): Promise<DeleteExpenseActionState> => {
  await auth.protect();

  try {
    const req = await authenticatedFetch(
      `/budgets/${envelopeId}/expenses/${expenseId}`,
      {
        method: "DELETE",
        next: {
          tags: ["all-envelopes"],
        },
      },
    );

    const json = await req.json();

    if (!req.ok) {
      const errorMessage = json.message as string;
      return {
        success: "",
        errors: [errorMessage],
      };
    }

    revalidatePath("/dashboard");
    revalidatePath(`/dashboard/envelope/${envelopeId}`);
    revalidateTag("all-envelopes", "max");

    return {
      success: "Gasto eliminado correctamente.",
      errors: [],
    };
  } catch (error) {
    console.error("Error deleting expense:", error);
    return {
      success: "",
      errors: ["No se pudo eliminar el gasto. Intenta más tarde."],
    };
  }
};
