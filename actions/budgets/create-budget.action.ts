'use server';
import {
  BudgetFormInputs,
  ErrorResponseSchema,
  SuccessResponseSchema,
} from '@/src/schemas';
import { getTokenFromCookies } from '@/src/auth/token';

type CreateBudgetActionState = {
  errors: string[];
  success: string;
};

export const createBudget = async (
  _prevState: CreateBudgetActionState,
  formData: BudgetFormInputs,
): Promise<CreateBudgetActionState> => {
  const token = await getTokenFromCookies();

  const url = `${process.env.API_URL}/budgets`;
  try {
    const req = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        amount: formData.amount,
        name: formData.name,
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
