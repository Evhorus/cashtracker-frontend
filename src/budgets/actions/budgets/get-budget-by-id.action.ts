'use server';
import { BudgetResponse } from '@/budgets/types/budget-response';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

const URL = `${process.env.API_URL}/budgets`;

export const getBudgetByIdAction = async (id: string) => {
  const { getToken } = await auth();
  const token = await getToken();

  try {
    const req = await fetch(`${URL}/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
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
