'use server';
import { BudgetsResponse } from '@/budgets/types/budget-response';
import { getTokenFromCookies } from '@/shared/lib/get-token-from-cookies';

const URL = `${process.env.API_URL}/budgets`;

export const getBudgetsAction = async () => {
  const TOKEN = await getTokenFromCookies();
  try {
    const req = await fetch(URL, {
      headers: {
        'Content-Type': 'application/json',
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
