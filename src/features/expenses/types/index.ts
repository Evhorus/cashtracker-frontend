export interface Expense {
  id: string;
  name: string;
  amount: string;
  date: Date;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}
