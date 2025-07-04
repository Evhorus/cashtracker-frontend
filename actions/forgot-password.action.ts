'use server';

import {
  ErrorResponseSchema,
  ForgotPasswordFormInputs,
  SuccessResponseSchema,
} from '@/src/schemas';

type ForgotPasswordActionState = {
  errors: string[];
  success: string;
};

export const forgotPassword = async (
  _prevState: ForgotPasswordActionState,
  formData: ForgotPasswordFormInputs,
): Promise<ForgotPasswordActionState> => {
  const url = `${process.env.API_URL}/auth/forgot-password`;

  try {
    const req = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: formData.email,
      }),
    });

    const json = await req.json();

    if (!req.ok) {
      const error = ErrorResponseSchema.parse(json);
      return {
        success: '',
        errors: [error.error],
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
