'use server';
import { BudgetResponse } from '@/budgets/types/budget-response';
import { authenticatedFetch } from '@/shared/lib/authenticated-fetch';
import { redirect } from 'next/navigation';

export const getBudgetByIdAction = async (id: string) => {
  try {
    const req = await authenticatedFetch(`/budgets/${id}`, {
      next: {
        tags: ['budget'],
        revalidate: 60, // Revalidate every 60 seconds
      },
    });

    if (!req.ok) {
      redirect('/dashboard');
    }

    const json = await req.json();

    const budget: BudgetResponse = json;

    return budget;
  } catch (error) {
    console.error('Error fetching budget by id:', error);
    throw error;
  }
};
