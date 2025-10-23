'use server';

import { auth } from '@clerk/nextjs/server';
import { revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';

type DeleteBudgetActionState = {
  errors: string[];
  success: string;
};

export const deleteBudgetAction = async (
  prevState: DeleteBudgetActionState,
  id: string
): Promise<DeleteBudgetActionState> => {
  const { getToken } = await auth();
  const token = await getToken();
  const URL = `${process.env.API_URL}/budgets/${id}`;
  try {
    const req = await fetch(URL, {
      method: 'DELETE',
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
      const errorMessage = json.message as string;
      return {
        success: '',
        errors: [errorMessage],
      };
    }

    revalidateTag('all-budgets');
    redirect('/dashboard');
  } catch (error) {
    console.error('Error fetching budgets:', error);
    throw error;
  }
};
