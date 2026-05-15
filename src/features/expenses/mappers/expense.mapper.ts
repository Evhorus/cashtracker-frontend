import { ExpenseFormValues } from '../schemas/expense.schema';
import { Expense } from '../types';
import { ExpenseAPIResponseSchema } from '../schemas/expense.schema';
import { z } from 'zod';

type ApiExpense = z.infer<typeof ExpenseAPIResponseSchema>;

export const ExpenseMapper = {
  /**
   * UI -> API (Outbound)
   * Handles Colombian currency formatting (removing dots) before converting to number
   */
  toApiRequest: (data: ExpenseFormValues) => ({
    name: data.name,
    amount: Number(data.amount.replace(/\./g, '')),
    date: data.date,
    description: data.description,
  }),

  /**
   * API -> UI (Inbound)
   * Transforms raw API response into the domain model (Expense)
   */
  fromApi: (apiExpense: ApiExpense): Expense => {
    return {
      id: apiExpense.id,
      name: apiExpense.name,
      amount: apiExpense.amount,
      date: new Date(apiExpense.date),
      description: apiExpense.description,
      createdAt: new Date(apiExpense.createdAt),
      updatedAt: new Date(apiExpense.updatedAt),
    };
  },
};
