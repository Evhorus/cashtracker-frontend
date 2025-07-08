import { z } from 'zod';

// Register
export const RegisterFormSchema = z
  .object({
    email: z.string().min(1, { message: 'El correo electrónico es obligatorio.' }).email({ message: 'Ingresa un correo electrónico válido.' }),
    name: z.string().min(1, { message: 'El nombre no puede estar vacío' }),
    password: z.string().min(8, { message: 'La contraseña debe tener al menos 8 caracteres.' }),
    passwordConfirmation: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: 'Las contraseñas no coinciden.',
    path: ['passwordConfirmation'],
  });

export type RegisterFormInputs = z.infer<typeof RegisterFormSchema>;

// Login
export const LoginFormSchema = z.object({
  email: z.string().min(1, { message: 'El Email es Obligatorio' }).email({ message: 'Email no válido' }),
  password: z.string().min(1, { message: 'La contraseña no puede ir vacía' }),
});

export type LoginFormInputs = z.infer<typeof LoginFormSchema>;

// Forgot Password
export const ForgotPasswordFormSchema = z.object({
  email: z.string().min(1, { message: 'El Email es Obligatorio' }).email({ message: 'Email no válido' }),
});

export type ForgotPasswordFormInputs = z.infer<typeof ForgotPasswordFormSchema>;

// Reset Password
export const ResetPasswordFormSchema = z
  .object({
    password: z.string().min(8, { message: 'La contraseña debe ser de al menos 8 caracteres' }),
    passwordConfirmation: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: 'Las contraseñas no son iguales',
    path: ['passwordConfirmation'],
  });

export type ResetPasswordFormInputs = z.infer<typeof ResetPasswordFormSchema>;
