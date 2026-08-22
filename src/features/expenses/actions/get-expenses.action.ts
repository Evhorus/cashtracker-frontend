"use server";

import { auth } from "@clerk/nextjs/server";
import {
  ExpensesService,
  type GetExpensesParams,
  type ExpensesResponse,
} from "@/features/expenses/services/expenses.service";

const EMPTY_RESPONSE: ExpensesResponse = {
  data: [],
  meta: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  },
};

export const getExpensesAction = async (
  envelopeId: string,
  params: GetExpensesParams,
): Promise<ExpensesResponse> => {
  await auth.protect();

  try {
    // Delegates to ExpensesService (fetchApi + Zod validation +
    // ExpenseMapper) instead of an unchecked raw fetch, so a malformed
    // API response fails loudly here instead of reaching the UI as
    // `undefined` fields.
    return await ExpensesService.getAll(envelopeId, params);
  } catch (error) {
    console.error("Error fetching filtered expenses:", error);
    return {
      ...EMPTY_RESPONSE,
      meta: { ...EMPTY_RESPONSE.meta, limit: params.limit ?? 10 },
    };
  }
};
