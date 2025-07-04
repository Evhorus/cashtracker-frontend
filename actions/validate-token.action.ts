'use server';

import {
  ErrorResponseSchema,
  SuccessResponseSchema,
  TokenSchema,
} from '@/src/schemas';

type validateTokenActionState = {
  errors: string[];
  success: string;
};
export const validateToken = async (
  _prevState: validateTokenActionState,
  token: string,
): Promise<validateTokenActionState> => {
  const resetPasswordToken = TokenSchema.safeParse(token);

  if (!resetPasswordToken.success) {
    return {
      errors: resetPasswordToken.error.issues.map((issue) => issue.message),
      success: '',
    };
  }

  const url = `${process.env.API_URL}/auth/validate-token`;
  try {
    const req = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: resetPasswordToken.data,
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
