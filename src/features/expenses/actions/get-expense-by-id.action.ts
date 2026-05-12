'use server';
import { Expense } from '@/features/expenses/types';

import { authenticatedFetch } from '@/shared/lib/authenticated-fetch';
import { redirect } from 'next/navigation';

export const getExpenseByIdAction = async (
  budgetId: string,
  expenseId: string
) => {
  try {
    const req = await authenticatedFetch(
      `/budgets/${budgetId}/expenses/${expenseId}`,
      {
        next: {
          tags: ['expense'],
          revalidate: 60, // Revalidate every 60 seconds
        },
      }
    );

    const json = await req.json();

    if (!req.ok) {
      redirect(`/dashboard/budget/${budgetId}`);
    }

    const expense: Expense = json;

    return expense;
  } catch (error) {
    console.error('Error fetching budget by id:', error);
    throw error;
  }
};
