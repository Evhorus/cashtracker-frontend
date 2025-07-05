'use server';
import {
  SuccessResponseSchema,
  ErrorResponseSchema,
  RegisterFormInputs,
} from '@/src/schemas';

type RegisterActionState = {
  errors: string[];
  success: string;
};

export const registerAction = async (
  _prevState: RegisterActionState,
  formData: RegisterFormInputs,
): Promise<RegisterActionState> => {
  const url = `${process.env.API_URL}/auth/create-account`;

  try {
    const req = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: formData.name,
        password: formData.password,
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
