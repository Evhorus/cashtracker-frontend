'use server';
import { BudgetsResponse } from '@/budgets/types/budget-response';
import { auth } from '@clerk/nextjs/server';

const URL = `${process.env.API_URL}/budgets`;

export const getBudgetsAction = async () => {
  const { getToken } = await auth();
  const token = await getToken();

  try {
    const req = await fetch(URL, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      next: {
        tags: ['all-budgets'],
      },
    });

    const json = await req.json();

    if (!req.ok) {
      throw new Error('Failed to fetch budgets');
    }

    const budgets: BudgetsResponse = json;

    return budgets;
  } catch (error) {
    console.error('Error fetching budgets:', error);
    throw error;
  }
};
