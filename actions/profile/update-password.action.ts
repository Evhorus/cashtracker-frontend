'use server';
import { getTokenFromCookies } from '@/src/auth/token';
import {
  ErrorResponseSchema,
  SuccessResponseSchema,
  UpdatePasswordFormInputs,
} from '@/src/schemas';

type UpdatePasswordActionState = {
  errors: string[];
  success: string;
};

export const updatePassword = async (
  _prevState: UpdatePasswordActionState,
  payload: UpdatePasswordFormInputs,
): Promise<UpdatePasswordActionState> => {
  const token = await getTokenFromCookies();

  const url = `${process.env.API_URL}/auth/update-password`;
  try {
    const req = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        currentPassword: payload.currentPassword,
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
