'use server';
import {
  ErrorResponseSchema,
  ResetPasswordFormInputs,
  SuccessResponseSchema,
} from '@/src/schemas';

type ResetPasswordActionState = {
  errors: string[];
  success: string;
};

export const resetPassword = async (
  _prevState: ResetPasswordActionState,
  payload: ResetPasswordFormInputs & { token: string },
): Promise<ResetPasswordActionState> => {
  console.log(payload.token);
  const url = `${process.env.API_URL}/auth/reset-password/${payload.token}`;
  try {
    const req = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        password: payload.password,
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
