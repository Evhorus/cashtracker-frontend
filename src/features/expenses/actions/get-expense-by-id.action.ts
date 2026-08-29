"use server";
import { auth } from "@clerk/nextjs/server";
import { ExpensesService } from "@/features/expenses/services/expenses.service";
import { redirect } from "next/navigation";

export const getExpenseByIdAction = async (
  envelopeId: string,
  expenseId: string,
) => {
  await auth.protect();

  try {
    // Delegates to ExpensesService (fetchApi + Zod validation +
    // ExpenseMapper), instead of casting the raw API response directly -
    // same bug as get-envelope-by-id.action.ts used to have: the raw
    // cast silently produced an Expense with a string `date` instead of
    // a real Date, since it skipped the mapper entirely.
    return await ExpensesService.getById(envelopeId, expenseId);
  } catch (error) {
    console.error("Error fetching expense by id:", error);
    redirect(`/dashboard/envelope/${envelopeId}`);
  }
};
