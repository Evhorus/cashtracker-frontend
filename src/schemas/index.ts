import { z } from 'zod';

// ====================
// Form Schemas
// ====================

// Register
export const RegisterSchema = z
  .object({
    email: z
      .string()
      .min(1, { message: 'El correo electrónico es obligatorio.' })
      .email({ message: 'Ingresa un correo electrónico válido.' }),
    name: z.string().min(1, { message: 'El nombre no puede estar vacío.' }),
    password: z
      .string()
      .min(8, { message: 'La contraseña debe tener al menos 8 caracteres.' }),
    passwordConfirmation: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: 'Las contraseñas no coinciden.',
    path: ['passwordConfirmation'],
  });

// Login
export const LoginSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'El Email es Obligatorio' })
    .email({ message: 'Email no válido' }),
  password: z.string().min(1, { message: 'El Password no puede ir vacio' }),
});

// Forgot Password
export const ForgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'El Email es Obligatorio' })
    .email({ message: 'Email no válido' }),
});

// Reset Password
export const ResetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, { message: 'El Password debe ser de al menos 8 caracteres' }),
    passwordConfirmation: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: 'Los Passwords no son iguales',
    path: ['passwordConfirmation'],
  });

// ====================
// Validation & Response Schemas
// ====================

// Token
export const TokenSchema = z
  .string({ message: 'Token no válido' })
  .length(6, { message: 'Token no válido' });

// Success & Error Responses
export const SuccessResponseSchema = z
  .string()
  .min(1, { message: 'Valor no válido.' });

export const ErrorResponseSchema = z.object({
  error: z.string(),
});

// ====================
// User Schemas & Types
// ====================

export const UserSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
});

export type User = z.infer<typeof UserSchema>;

// ====================
// Form Types
// ====================

export type RegisterFormInputs = z.infer<typeof RegisterSchema>;
export type LoginFormInputs = z.infer<typeof LoginSchema>;
export type ForgotPasswordFormInputs = z.infer<typeof ForgotPasswordSchema>;

export type ResetPasswordFormInputs = z.infer<typeof ResetPasswordSchema>;

export type ResetPasswordFormInputsWithToken = z.infer<
  typeof ResetPasswordSchema
>;
