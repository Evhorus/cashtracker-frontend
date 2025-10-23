'use server';

import { BudgetFormValues } from '@/budgets/schemas/budget.schema';
import { auth } from '@clerk/nextjs/server';
import { revalidateTag } from 'next/cache';

type CreateBudgetActionState = {
  errors: string[];
  success: string;
};

export const createUpdateBudgetAction = async (
  _prevState: CreateBudgetActionState,
  formData: BudgetFormValues & { id?: string }
): Promise<CreateBudgetActionState> => {
  const { getToken } = await auth();
  const token = await getToken();

  const id = formData.id;

  const url = id
    ? `${process.env.API_URL}/budgets/${id}`
    : `${process.env.API_URL}/budgets`;

  try {
    const req = await fetch(url, {
      method: id ? 'PATCH' : 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
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
    revalidateTag('all-budgets');

    if (id) {
      revalidateTag('budget');
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
