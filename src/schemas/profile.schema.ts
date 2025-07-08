import z from 'zod';

export const UpdatePasswordFormSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, { message: 'El Password no puede ir vació' }),
    password: z.string().min(8, {
      message: 'El nuevo password debe ser de al menos 8 caracteres',
    }),
    passwordConfirmation: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: 'Los Passwords no son iguales',
    path: ['passwordConfirmation'],
  });

export const UpdateProfileFormSchema = z.object({
  name: z.string().min(1, { message: 'El nombre no puede estar vacío.' }),
  email: z
    .string()
    .min(1, { message: 'El Email es Obligatorio' })
    .email({ message: 'Email no válido' }),
});

export type UpdatePasswordFormInputs = z.infer<typeof UpdatePasswordFormSchema>;
export type UpdateProfileFormInputs = z.infer<typeof UpdateProfileFormSchema>;
