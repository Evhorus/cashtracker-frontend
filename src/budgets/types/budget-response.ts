export interface BudgetsResponse {
  count: number;
  data: BudgetResponse[];
}

export interface BudgetResponse {
  id: string;
  name: string;
  amount: string;
  spent: string;
  category?: string;
  description?: string;
  expenses: ExpenseResponse[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ExpenseResponse {
  id: string;
  name: string;
  amount: string;
  date: Date;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}
