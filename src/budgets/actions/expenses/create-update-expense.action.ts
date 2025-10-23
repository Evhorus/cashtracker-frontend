'use server';
import { ExpenseFormValues } from '@/budgets/schemas/expense.schema';
import { revalidateTag } from 'next/cache';

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

  const URL = expenseId
    ? `${process.env.API_URL}/budgets/${budgetId}/expenses/${expenseId}`
    : `${process.env.API_URL}/budgets/${budgetId}/expenses`;

  try {
    const req = await fetch(URL, {
      method: expenseId ? 'PATCH' : 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
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
    revalidateTag('all-budgets');

    if (expenseId) {
      revalidateTag('expense');
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
