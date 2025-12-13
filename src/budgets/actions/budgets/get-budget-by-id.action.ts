'use server';
import { BudgetResponse } from '@/budgets/types/budget-response';
import { authenticatedFetch } from '@/shared/lib/authenticated-fetch';
import { redirect } from 'next/navigation';

const URL = `${process.env.API_URL}/budgets`;

export const getBudgetByIdAction = async (id: string) => {
  try {
    const req = await authenticatedFetch(`${URL}/${id}`, {
      next: {
        tags: ['budget'],
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
