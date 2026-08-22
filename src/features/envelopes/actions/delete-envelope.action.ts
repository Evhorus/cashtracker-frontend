"use server";

import { auth } from "@clerk/nextjs/server";
import { authenticatedFetch } from "@/lib/authenticated-fetch";
import { revalidatePath, revalidateTag } from "next/cache";

type DeleteEnvelopeActionState = {
  errors: string[];
  success: string;
};

export const deleteEnvelopeAction = async (
  prevState: DeleteEnvelopeActionState,
  envelopeId: string,
): Promise<DeleteEnvelopeActionState> => {
  await auth.protect();

  try {
    const req = await authenticatedFetch(`/budgets/${envelopeId}`, {
      method: "DELETE",
      next: {
        tags: ["all-envelopes"],
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
    revalidatePath("/dashboard/envelopes");
    revalidateTag("all-envelopes", "max");

    return {
      success: "Presupuesto eliminado correctamente.",
      errors: [],
    };
  } catch (error) {
    console.error("Error deleting envelope:", error);
    return {
      success: "",
      errors: ["No se pudo eliminar el presupuesto. Intenta más tarde."],
    };
  }
};
