import { fetchApi } from '@/shared/lib/api-client';
import { Expense } from "@/features/expenses/types";
import { ExpenseFormValues } from '../schemas/expense.schema';

export const ExpensesService = {
  getAll: (budgetId: string) => {
    return fetchApi<Expense[]>(`/budgets/${budgetId}/expenses`, {
      next: { tags: [`expenses-${budgetId}`], revalidate: 60 },
    });
  },

  getById: (budgetId: string, expenseId: string) => {
    return fetchApi<Expense>(`/budgets/${budgetId}/expenses/${expenseId}`, {
      next: { tags: ['expense'], revalidate: 60 },
    });
  },

  create: (budgetId: string, data: ExpenseFormValues) => {
    return fetchApi<{ message: string }>(`/budgets/${budgetId}/expenses`, {
      method: 'POST',
      body: JSON.stringify({
        amount: +data.amount,
        name: data.name,
        date: data.date,
        description: data.description,
      }),
    });
  },

  update: (budgetId: string, expenseId: string, data: ExpenseFormValues) => {
    return fetchApi<{ message: string }>(`/budgets/${budgetId}/expenses/${expenseId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        amount: +data.amount,
        name: data.name,
        date: data.date,
        description: data.description,
      }),
    });
  },

  delete: (budgetId: string, expenseId: string) => {
    return fetchApi<{ message: string }>(`/budgets/${budgetId}/expenses/${expenseId}`, {
      method: 'DELETE',
    });
  },
};
