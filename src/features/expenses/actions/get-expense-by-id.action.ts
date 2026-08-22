"use server";
import { auth } from "@clerk/nextjs/server";
import { Expense } from "@/features/expenses/types";

import { authenticatedFetch } from "@/lib/authenticated-fetch";
import { redirect } from "next/navigation";

export const getExpenseByIdAction = async (
  envelopeId: string,
  expenseId: string,
) => {
  await auth.protect();

  try {
    const req = await authenticatedFetch(
      `/budgets/${envelopeId}/expenses/${expenseId}`,
      {
        next: {
          tags: ["expense"],
          revalidate: 60, // Revalidate every 60 seconds
        },
      },
    );

    const json = await req.json();

    if (!req.ok) {
      redirect(`/dashboard/envelope/${envelopeId}`);
    }

    const expense: Expense = json;

    return expense;
  } catch (error) {
    console.error("Error fetching envelope by id:", error);
    throw error;
  }
};
