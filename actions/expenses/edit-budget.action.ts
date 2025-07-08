'use server';
import { getTokenFromCookies } from '@/src/auth/token';
import { revalidatePath } from 'next/cache';
import {
  Budget,
  BudgetFormInputs,
  ErrorResponseSchema,
  Expense,
  SuccessResponseSchema,
} from '@/src/schemas';

type EditExpenseActionState = {
  errors: string[];
  success: string;
};

type Params = {
  budgetId: Budget['id'];
  expenseId: Expense['id'];
};

export const editExpense = async (
  _prevState: EditExpenseActionState,
  payload: BudgetFormInputs & Params,
): Promise<EditExpenseActionState> => {
  const token = await getTokenFromCookies();

  const url = `${process.env.API_URL}/budgets/${payload.budgetId}/expenses/${payload.expenseId}`;
  try {
    const req = await fetch(url, {
      method: 'PUT',
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
