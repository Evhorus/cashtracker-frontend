'use server';

import { authenticatedFetch } from '@/shared/lib/authenticated-fetch';
import { revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';

type DeleteBudgetActionState = {
  errors: string[];
  success: string;
};

export const deleteBudgetAction = async (
  prevState: DeleteBudgetActionState,
  budgetId: string
): Promise<DeleteBudgetActionState> => {
  try {
    const req = await authenticatedFetch(`/budgets/${budgetId}`, {
      method: 'DELETE',
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

    // Revalidate cache before redirect
    revalidateTag('all-budgets', 'max');
  } catch (error) {
    console.error('Error deleting budget:', error);
    return {
      success: '',
      errors: ['No se pudo eliminar el presupuesto. Intenta más tarde.'],
    };
  }

  // Redirect outside try-catch to avoid catching the redirect error
  redirect('/dashboard');
};
