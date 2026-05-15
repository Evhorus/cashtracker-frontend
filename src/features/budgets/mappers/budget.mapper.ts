import { BudgetFormValues } from '../schemas/budget.schema';
import { Budget } from '../types';
import { BudgetApi } from '../schemas/budget.schema';
import { ExpenseMapper } from '@/features/expenses/mappers/expense.mapper';

export const BudgetMapper = {
  /**
   * UI -> API (Outbound)
   * Handles Colombian currency formatting (removing dots) before converting to number
   */
  toApiRequest: (data: BudgetFormValues) => ({
    name: data.name,
    amount: Number(data.amount.replace(/\./g, '')),
    category: data.category,
  }),

  /**
   * API -> UI (Inbound)
   * Transforms raw API response into the domain model (Budget)
   */
  fromApi: (apiBudget: BudgetApi): Budget => {
    return {
      id: apiBudget.id,
      name: apiBudget.name,
      amount: apiBudget.amount,
      spent: apiBudget.spent,
      category: apiBudget.category,
      description: apiBudget.description,
      createdAt: new Date(apiBudget.createdAt),
      updatedAt: new Date(apiBudget.updatedAt),
      expenses: apiBudget.expenses.map(ExpenseMapper.fromApi),
    };
  },
};
