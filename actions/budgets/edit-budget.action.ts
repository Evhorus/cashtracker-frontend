'use server';
import {
  Budget,
  BudgetFormInputs,
  ErrorResponseSchema,
  SuccessResponseSchema,
} from '@/src/schemas';
import { getTokenFromCookies } from '@/src/auth/token';
import { revalidateTag } from 'next/cache';

type CreateBudgetActionState = {
  errors: string[];
  success: string;
};

export const editBudget = async (
  _prevState: CreateBudgetActionState,
  payload: BudgetFormInputs & { budgetId: Budget['id'] },
): Promise<CreateBudgetActionState> => {
  const token = await getTokenFromCookies();

  console.log(payload)

  const url = `${process.env.API_URL}/budgets/${payload.budgetId}`;
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

    revalidateTag('all-budgets');
    const success = SuccessResponseSchema.parse(json);
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
