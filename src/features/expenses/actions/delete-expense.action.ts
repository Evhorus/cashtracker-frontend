"use server";

import { auth } from "@clerk/nextjs/server";
import { authenticatedFetch } from "@/lib/authenticated-fetch";
import { revalidatePath, revalidateTag } from "next/cache";

type DeleteBudgetActionState = {
  errors: string[];
  success: string;
};

export const deleteExpenseAction = async (
  prevState: DeleteBudgetActionState,
  { budgetId, expenseId }: { budgetId: string; expenseId: string },
): Promise<DeleteBudgetActionState> => {
  await auth.protect();

  try {
    const req = await authenticatedFetch(
      `/budgets/${budgetId}/expenses/${expenseId}`,
      {
        method: "DELETE",
        next: {
          tags: ["all-budgets"],
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
    revalidatePath(`/dashboard/budget/${budgetId}`);
    revalidateTag("all-budgets", "max");

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
