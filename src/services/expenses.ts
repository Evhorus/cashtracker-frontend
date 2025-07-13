import { cache } from 'react';
import { getTokenFromCookies } from '../auth/token';
import { notFound } from 'next/navigation';
import { ExpenseAPIResponseSchema } from '../schemas';

export const getExpenseById = cache(
  async (budgetId: string, expenseId: string) => {
    const token = await getTokenFromCookies();
    const url = `${process.env.API_URL}/budgets/${budgetId}/expenses/${expenseId}`;

    try {
      const req = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const json = await req.json();
      if (!req.ok) {
        notFound();
      }
      const budget = ExpenseAPIResponseSchema.parse(json);
      return budget;
    } catch (error) {
      console.error('Error fetching budget:', error);
      throw error;
    }
  },
);
