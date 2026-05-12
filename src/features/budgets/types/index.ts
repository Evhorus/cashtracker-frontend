import { Expense } from '@/features/expenses/types';

export interface BudgetsResponse {
  count: number;
  data: Budget[];
}

export interface Budget {
  id: string;
  name: string;
  amount: string;
  spent: string;
  category?: string;
  description?: string;
  expenses: Expense[];
  createdAt: Date;
  updatedAt: Date;
}

