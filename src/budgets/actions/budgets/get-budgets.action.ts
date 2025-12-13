'use server';
import { BudgetsResponse } from '@/budgets/types/budget-response';
import { authenticatedFetch } from '@/shared/lib/authenticated-fetch';

export const getBudgetsAction = async () => {
  try {
    const req = await authenticatedFetch('/budgets', {
      next: {
        tags: ['all-budgets'],
        revalidate: 60, // Revalidate every 60 seconds
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
