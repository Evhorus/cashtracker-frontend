import { fetchApi } from "@/lib/api-client";
import { Expense } from "@/features/expenses/types";
import {
  ExpenseFormValues,
  ExpenseAPIResponseSchema,
  ExpensesAPIResponseSchema,
  ExpenseApi,
  ExpensesResponseApi,
} from "../schemas/expense.schema";
import { ExpenseMapper } from "../mappers/expense.mapper";

export const ExpensesService = {
  getAll: async (envelopeId: string): Promise<Expense[]> => {
    const expenses = await fetchApi<ExpensesResponseApi>(
      `/envelopes/${envelopeId}/expenses`,
      {
        next: { tags: [`expenses-${envelopeId}`], revalidate: 60 },
      },
      ExpensesAPIResponseSchema,
    );

    return expenses.map(ExpenseMapper.fromApi);
  },

  getById: async (envelopeId: string, expenseId: string): Promise<Expense> => {
    const expense = await fetchApi<ExpenseApi>(
      `/envelopes/${envelopeId}/expenses/${expenseId}`,
      {
        next: { tags: ["expense"], revalidate: 60 },
      },
      ExpenseAPIResponseSchema,
    );

    return ExpenseMapper.fromApi(expense);
  },

  create: (envelopeId: string, data: ExpenseFormValues) => {
    return fetchApi<{ message: string }>(`/envelopes/${envelopeId}/expenses`, {
      method: "POST",
      body: JSON.stringify(ExpenseMapper.toApiRequest(data)),
    });
  },

  update: (envelopeId: string, expenseId: string, data: ExpenseFormValues) => {
    return fetchApi<{ message: string }>(
      `/envelopes/${envelopeId}/expenses/${expenseId}`,
      {
        method: "PATCH",
        body: JSON.stringify(ExpenseMapper.toApiRequest(data)),
      },
    );
  },

  delete: (envelopeId: string, expenseId: string) => {
    return fetchApi<{ message: string }>(
      `/envelopes/${envelopeId}/expenses/${expenseId}`,
      {
        method: "DELETE",
      },
    );
  },
};
