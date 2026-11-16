import type { ExpensePaymentMethod } from "@/features/payment-methods/types";

export interface Expense {
  id: string;
  name: string;
  amount: string;
  date: Date;
  description?: string;
  /** What it was paid with, or null. */
  paymentMethod: ExpensePaymentMethod | null;
  createdAt: Date;
  updatedAt: Date;
}
