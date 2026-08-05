"use server";

import { auth } from "@clerk/nextjs/server";
import { authenticatedFetch } from "@/shared/lib/authenticated-fetch";
import { revalidatePath, revalidateTag } from "next/cache";

type DeleteBudgetActionState = {
  errors: string[];
  success: string;
};

export const deleteBudgetAction = async (
  prevState: DeleteBudgetActionState,
  budgetId: string,
): Promise<DeleteBudgetActionState> => {
  await auth.protect();

  try {
    const req = await authenticatedFetch(`/budgets/${budgetId}`, {
      method: "DELETE",
      next: {
        tags: ["all-budgets"],
      },
    });

    const json = await req.json();

    if (!req.ok) {
      const errorMessage = json.message as string;
      return {
        success: "",
        errors: [errorMessage],
      };
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/budgets");
    revalidateTag("all-budgets", "max");

    return {
      success: "Presupuesto eliminado correctamente.",
      errors: [],
    };
  } catch (error) {
    console.error("Error deleting budget:", error);
    return {
      success: "",
      errors: ["No se pudo eliminar el presupuesto. Intenta más tarde."],
    };
  }
};
