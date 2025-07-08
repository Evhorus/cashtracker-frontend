'use server';
import { getTokenFromCookies } from '@/src/auth/token';
import { revalidatePath } from 'next/cache';
import {
  Budget,
  BudgetFormInputs,
  ErrorResponseSchema,
  SuccessResponseSchema,
} from '@/src/schemas';

type CreateExpenseActionState = {
  errors: string[];
  success: string;
};

export const createExpense = async (
  _prevState: CreateExpenseActionState,
  payload: BudgetFormInputs & { budgetId: Budget['id'] },
): Promise<CreateExpenseActionState> => {
  const token = await getTokenFromCookies();

  const url = `${process.env.API_URL}/budgets/${payload.budgetId}/expenses`;
  try {
    const req = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        amount: payload.amount,
        name: payload.name,
      }),
    });

    const json = await req.json();

    if (!req.ok) {
      const { error } = ErrorResponseSchema.parse(json);
      return {
        success: '',
        errors: [error],
      };
    }

    const success = SuccessResponseSchema.parse(json);
    revalidatePath(`/admin/budgets/${payload.budgetId}`);
    return {
      errors: [],
      success,
    };
  } catch {
    return {
      errors: ['No se pudo conectar con el servidor. Intenta más tarde.'],
      success: '',
    };
  }
};
