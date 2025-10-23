'use server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { LoginFormValues } from '../schemas/login.schema';
import { ErrorResponseSchema } from '../schemas/response-api.schema';

type LoginActionState = {
  errors: string[];
  success: string;
};

export const loginUserAction = async (
  _prevState: LoginActionState,
  formData: LoginFormValues
): Promise<LoginActionState> => {
  const url = `${process.env.API_URL}/auth/login`;
  try {
    const req = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: formData.email,
        password: formData.password,
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

    (await cookies()).set({
      name: 'AUTH_TOKEN',
      value: json,
      httpOnly: true,
      path: '/',
    });
    redirect('/dashboard');
  } catch {
    return {
      errors: ['No se pudo conectar con el servidor. Intenta más tarde.'],
      success: '',
    };
  }
};
