'use server';

import { revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';

type DeleteBudgetActionState = {
  errors: string[];
  success: string;
};

export const deleteExpenseAction = async (
  prevState: DeleteBudgetActionState,
  { budgetId, expenseId }: { budgetId: string; expenseId: string }
): Promise<DeleteBudgetActionState> => {
  const URL = `${process.env.API_URL}/budgets/${budgetId}/expenses/${expenseId}`;
  try {
    const req = await fetch(URL, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
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
    redirect(`/dashboard/budget/${budgetId}`);
  } catch (error) {
    console.error('Error fetching budgets:', error);
    throw error;
  }
};
