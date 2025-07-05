'use server';
import {
  Budget,
  ErrorResponseSchema,
  PasswordValidationFormInputs,
  SuccessResponseSchema,
} from '@/src/schemas';
import { getTokenFromCookies } from '@/src/auth/token';
import { revalidateTag } from 'next/cache';

type DeleteBudgetActionState = {
  errors: string[];
  success: string;
};

export const deleteBudget = async (
  _prevState: DeleteBudgetActionState,
  payload: PasswordValidationFormInputs & { budgetId: Budget['id'] },
): Promise<DeleteBudgetActionState> => {
  const token = await getTokenFromCookies();

  const checkPasswordUrl = `${process.env.API_URL}/auth/check-password`;
  const deleteBudgetUrl = `${process.env.API_URL}/budgets/${payload.budgetId}`;

  try {
    const checkPasswordReq = await fetch(checkPasswordUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        password: payload.password,
      }),
    });

    const checkPasswordJson = await checkPasswordReq.json();

    if (!checkPasswordReq.ok) {
      const { error } = ErrorResponseSchema.parse(checkPasswordJson);
      return {
        success: '',
        errors: [error],
      };
    }

    const deleteBudgetReq = await fetch(deleteBudgetUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const deleteBudgetJson = await deleteBudgetReq.json();

    if (!deleteBudgetReq.ok) {
      const { error } = ErrorResponseSchema.parse(deleteBudgetJson);
      return {
        success: '',
        errors: [error],
      };
    }

    revalidateTag('all-budgets');
    const success = SuccessResponseSchema.parse(deleteBudgetJson);
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
