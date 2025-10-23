// export const RegisterFormSchema = z
//   .object({
//     email: z
//       .string()
//       .min(1, { message: 'El correo electrónico es obligatorio.' })
//       .email({ message: 'Ingresa un correo electrónico válido.' }),
//     name: z
//       .string()
//       .min(1, { message: 'El nombre no puede estar vacío' })
//       .regex(/^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]+$/, {
//         message: 'El nombre solo puede contener letras y espacios.',
//       }),
//     password: z
//       .string()
//       .min(8, { message: 'La contraseña debe tener al menos 8 caracteres.' }),
//     passwordConfirmation: z.string(),
//   })
//   .refine((data) => data.password === data.passwordConfirmation, {
//     message: 'Las contraseñas no coinciden.',
//     path: ['passwordConfirmation'],
//   });

// export type RegisterFormInputs = z.infer<typeof RegisterFormSchema>;
