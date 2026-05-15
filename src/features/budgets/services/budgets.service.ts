import { fetchApi } from '@/shared/lib/api-client';
import { BudgetFormValues, BudgetAPIResponseSchema, BudgetsAPIResponseSchema, BudgetApi, BudgetsResponseApi } from '../schemas/budget.schema';
import { Budget, BudgetsResponse } from '../types';
import { BudgetMapper } from '../mappers/budget.mapper';

export const BudgetsService = {
  getAll: async (): Promise<BudgetsResponse> => {
    const response = await fetchApi<BudgetsResponseApi>('/budgets', {
      next: { tags: ['all-budgets'], revalidate: 60 },
    }, BudgetsAPIResponseSchema);

    return {
      count: response.count,
      data: response.data.map(BudgetMapper.fromApi),
    };
  },

  getById: async (id: string): Promise<Budget> => {
    const budget = await fetchApi<BudgetApi>(`/budgets/${id}`, {
      next: { tags: ['budget'], revalidate: 60 },
    }, BudgetAPIResponseSchema);

    return BudgetMapper.fromApi(budget);
  },

  create: (data: BudgetFormValues) => {
    return fetchApi<{ message: string }>('/budgets', {
      method: 'POST',
      body: JSON.stringify(BudgetMapper.toApiRequest(data)),
    });
  },

  update: (id: string, data: BudgetFormValues) => {
    return fetchApi<{ message: string }>(`/budgets/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(BudgetMapper.toApiRequest(data)),
    });
  },

  delete: (id: string) => {
    return fetchApi<{ message: string }>(`/budgets/${id}`, {
      method: 'DELETE',
    });
  },
};
