import { fetchApi } from '@/shared/lib/api-client';
import { Expense } from "@/features/expenses/types";
import { ExpenseFormValues, ExpenseAPIResponseSchema, ExpensesAPIResponseSchema, ExpenseApi, ExpensesResponseApi } from '../schemas/expense.schema';
import { ExpenseMapper } from '../mappers/expense.mapper';

export const ExpensesService = {
  getAll: async (budgetId: string): Promise<Expense[]> => {
    const expenses = await fetchApi<ExpensesResponseApi>(`/budgets/${budgetId}/expenses`, {
      next: { tags: [`expenses-${budgetId}`], revalidate: 60 },
    }, ExpensesAPIResponseSchema);

    return expenses.map(ExpenseMapper.fromApi);
  },

  getById: async (budgetId: string, expenseId: string): Promise<Expense> => {
    const expense = await fetchApi<ExpenseApi>(`/budgets/${budgetId}/expenses/${expenseId}`, {
      next: { tags: ['expense'], revalidate: 60 },
    }, ExpenseAPIResponseSchema);

    return ExpenseMapper.fromApi(expense);
  },

  create: (budgetId: string, data: ExpenseFormValues) => {
    return fetchApi<{ message: string }>(`/budgets/${budgetId}/expenses`, {
      method: 'POST',
      body: JSON.stringify(ExpenseMapper.toApiRequest(data)),
    });
  },

  update: (budgetId: string, expenseId: string, data: ExpenseFormValues) => {
    return fetchApi<{ message: string }>(`/budgets/${budgetId}/expenses/${expenseId}`, {
      method: 'PATCH',
      body: JSON.stringify(ExpenseMapper.toApiRequest(data)),
    });
  },

  delete: (budgetId: string, expenseId: string) => {
    return fetchApi<{ message: string }>(`/budgets/${budgetId}/expenses/${expenseId}`, {
      method: 'DELETE',
    });
  },
};
