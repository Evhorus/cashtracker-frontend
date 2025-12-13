'use server';

import { BudgetFormValues } from '@/budgets/schemas/budget.schema';
import { authenticatedFetch } from '@/shared/lib/authenticated-fetch';
import { revalidateTag } from 'next/cache';

type CreateBudgetActionState = {
  errors: string[];
  success: string;
};

export const createUpdateBudgetAction = async (
  _prevState: CreateBudgetActionState,
  formData: BudgetFormValues & { id?: string }
): Promise<CreateBudgetActionState> => {
  const id = formData.id;

  const path = id ? `/budgets/${id}` : '/budgets';

  try {
    const req = await authenticatedFetch(path, {
      method: id ? 'PATCH' : 'POST',
      body: JSON.stringify({
        amount: +formData.amount,
        name: formData.name,
        category: formData.category,
      }),
    });

    const json = await req.json();

    if (!req.ok) {
      const errorMessage = json.message as string;

      return {
        success: '',
        errors: [errorMessage],
      };
    }

    const successMessage = json.message as string;
    revalidateTag('all-budgets', 'max');

    if (id) {
      revalidateTag('budget', 'max');
    }
    return {
      errors: [],
      success: successMessage,
    };
  } catch (error) {
    console.error('Error creando presupuesto:', error);
    return {
      errors: ['No se pudo conectar con el servidor. Intenta más tarde.'],
      success: '',
    };
  }
};
