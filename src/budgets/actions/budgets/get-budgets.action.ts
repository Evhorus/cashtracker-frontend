'use server';
import { BudgetsResponse } from '@/budgets/types/budget-response';
import { authenticatedFetch } from '@/shared/lib/authenticated-fetch';

const URL = `${process.env.API_URL}/budgets`;

export const getBudgetsAction = async () => {
  try {
    const req = await authenticatedFetch(URL, {
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
