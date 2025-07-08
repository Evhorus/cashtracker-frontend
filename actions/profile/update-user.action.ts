'use server';
import { revalidatePath } from 'next/cache';
import { getTokenFromCookies } from '@/src/auth/token';
import {
  ErrorResponseSchema,
  SuccessResponseSchema,
  UpdateProfileFormInputs,
} from '@/src/schemas';

type UpdateProfileActionState = {
  errors: string[];
  success: string;
};

export const updateUser = async (
  _prevState: UpdateProfileActionState,
  payload: UpdateProfileFormInputs,
): Promise<UpdateProfileActionState> => {
  const token = await getTokenFromCookies();

  const url = `${process.env.API_URL}/auth/user`;
  try {
    const req = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: payload.name,
        email: payload.email,
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

    revalidatePath(`/auth/user`);
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
