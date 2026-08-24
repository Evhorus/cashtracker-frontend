import { z } from "zod";

// z.email() (not the deprecated .string().email()) covers "required" and
// "valid format" in one message - an empty string already fails it, so
// there's no separate .min(1) needed on top.
const emailSchema = z.email({ message: "Ingresa un email válido" });

// Doesn't enforce Clerk's actual password policy (that's server-side and
// configurable in the Dashboard) - just a sane client-side floor so
// obviously-too-short passwords never round-trip to the API at all.
const newPasswordSchema = z
  .string()
  .min(8, { message: "Debe tener al menos 8 caracteres" });

const confirmPasswordSchema = z
  .string()
  .min(1, { message: "Confirma tu contraseña" });

// Exported - features/account/schemas/account.schema.ts reuses this for
// the reverification dialog's email_code step, same 6-digit shape, one
// definition instead of two.
export const codeSchema = z
  .string()
  .min(1, { message: "Ingresa el código" })
  .regex(/^\d{6}$/, { message: "El código debe tener 6 dígitos" });

/*
 * Sign in
 */

export const emailFormSchema = z.object({
  email: emailSchema,
});
export type EmailFormValues = z.infer<typeof emailFormSchema>;

export const signInPasswordFormSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, { message: "Ingresa tu contraseña" }),
});
export type SignInPasswordFormValues = z.infer<typeof signInPasswordFormSchema>;

export const codeFormSchema = z.object({
  code: codeSchema,
});
export type CodeFormValues = z.infer<typeof codeFormSchema>;

/*
 * Sign up
 */

export const signUpFormSchema = z
  .object({
    firstName: z
      .string()
      .min(1, { message: "El nombre es obligatorio" })
      .transform((val) => val.trim()),
    lastName: z
      .string()
      .min(1, { message: "El apellido es obligatorio" })
      .transform((val) => val.trim()),
    email: emailSchema,
    password: newPasswordSchema,
    confirmPassword: confirmPasswordSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });
export type SignUpFormValues = z.infer<typeof signUpFormSchema>;

/*
 * Forgot password
 */

export const newPasswordFormSchema = z
  .object({
    password: newPasswordSchema,
    confirmPassword: confirmPasswordSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });
export type NewPasswordFormValues = z.infer<typeof newPasswordFormSchema>;
