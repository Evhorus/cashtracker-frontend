'use server';
import { cookies } from 'next/headers';
import { ErrorResponseSchema, LoginFormInputs } from '@/src/schemas';
import { redirect } from 'next/navigation';

type LoginActionState = {
  errors: string[];
  success: string;
};

export const authenticate = async (
  _prevState: LoginActionState,
  formData: LoginFormInputs,
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
      name: 'CASHTRACKER_TOKEN',
      value: json,
      httpOnly: true,
      path: '/',
    });
  } catch {
    return {
      errors: ['No se pudo conectar con el servidor. Intenta más tarde.'],
      success: '',
    };
  }
  redirect('/admin');
};
