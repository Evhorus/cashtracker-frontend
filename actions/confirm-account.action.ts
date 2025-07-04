'use server';

import {
  ErrorResponseSchema,
  SuccessResponseSchema,
  TokenSchema,
} from '@/src/schemas';

type ConfirmAccountActionState = {
  errors: string[];
  success: string;
};
export const confirmAccount = async (
  _prevState: ConfirmAccountActionState,
  token: string,
): Promise<ConfirmAccountActionState> => {
  const confirmToken = TokenSchema.safeParse(token);

  if (!confirmToken.success) {
    return {
      errors: confirmToken.error.issues.map((issue) => issue.message),
      success: '',
    };
  }

  const url = `${process.env.API_URL}/auth/confirm-account`;
  try {
    const req = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: confirmToken.data,
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
