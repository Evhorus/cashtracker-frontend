'use server';
import { ExpenseResponse } from '@/budgets/types/budget-response';

import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export const getExpenseByIdAction = async (
  budgetId: string,
  expenseId: string
) => {
  const { getToken } = await auth();
  const token = await getToken();
  const URL = `${process.env.API_URL}/budgets/${budgetId}/expenses/${expenseId}`;

  try {
    const req = await fetch(URL, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      next: {
        tags: ['expense'],
      },
    });

    const json = await req.json();

    if (!req.ok) {
      redirect(`/dashboard/budget/${budgetId}`);
    }

    const expense: ExpenseResponse = json;

    return expense;
  } catch (error) {
    console.error('Error fetching budget by id:', error);
    throw error;
  }
};
