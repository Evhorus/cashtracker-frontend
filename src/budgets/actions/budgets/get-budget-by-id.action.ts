'use server';
import { BudgetResponse } from '@/budgets/types/budget-response';
import { getTokenFromCookies } from '@/shared/lib/get-token-from-cookies';

const URL = `${process.env.API_URL}/budgets`;

export const getBudgetByIdAction = async (id: string) => {
  const TOKEN = await getTokenFromCookies();
  try {
    const req = await fetch(`${URL}/${id}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      next: {
        tags: ['budget'],
      },
    });

    const json = await req.json();

    if (!req.ok) {
      throw new Error('Failed to fetch budgets');
    }

    const budget: BudgetResponse = json;

    return budget;
  } catch (error) {
    console.error('Error fetching budget by id:', error);
    throw error;
  }
};
