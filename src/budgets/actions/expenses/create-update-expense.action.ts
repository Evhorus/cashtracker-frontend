'use server';
import { ExpenseFormValues } from '@/budgets/schemas/expense.schema';
import { authenticatedFetch } from '@/shared/lib/authenticated-fetch';
import { revalidatePath, revalidateTag } from 'next/cache';

type CreateExpenseActionState = {
  errors: string[];
  success: string;
};

export const createUpdateExpenseAction = async (
  _prevState: CreateExpenseActionState,
  formData: ExpenseFormValues & { budgetId: string; expenseId?: string }
): Promise<CreateExpenseActionState> => {
  const budgetId = formData.budgetId;

  const expenseId = formData.expenseId;

  const path = expenseId
    ? `/budgets/${budgetId}/expenses/${expenseId}`
    : `/budgets/${budgetId}/expenses`;

  try {
    const req = await authenticatedFetch(path, {
      method: expenseId ? 'PATCH' : 'POST',
      body: JSON.stringify({
        amount: +formData.amount,
        name: formData.name,
        date: formData.date,
        description: formData.description,
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
    revalidatePath('/dashboard');
    revalidatePath(`/dashboard/budget/${budgetId}`);
    revalidateTag('all-budgets', 'max');

    if (expenseId) {
      revalidateTag('expense', 'max');
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
