import { fetchApi } from '@/shared/lib/api-client';
import { BudgetFormValues } from '../schemas/budget.schema';
import { Budget, BudgetsResponse } from '../types';

export const BudgetsService = {
  getAll: () => {
    return fetchApi<BudgetsResponse>('/budgets', {
      next: { tags: ['all-budgets'], revalidate: 60 },
    });
  },

  getById: (id: string) => {
    return fetchApi<Budget>(`/budgets/${id}`, {
      next: { tags: ['budget'], revalidate: 60 },
    });
  },

  create: (data: BudgetFormValues) => {
    return fetchApi<{ message: string }>('/budgets', {
      method: 'POST',
      body: JSON.stringify({
        amount: +data.amount,
        name: data.name,
        category: data.category,
      }),
    });
  },

  update: (id: string, data: BudgetFormValues) => {
    return fetchApi<{ message: string }>(`/budgets/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        amount: +data.amount,
        name: data.name,
        category: data.category,
      }),
    });
  },

  delete: (id: string) => {
    return fetchApi<{ message: string }>(`/budgets/${id}`, {
      method: 'DELETE',
    });
  },
};
