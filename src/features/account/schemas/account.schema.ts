import { z } from "zod";

import { codeSchema } from "@/features/auth/schemas/auth.schema";

// Mirrors the floor set in features/auth/schemas/auth.schema.ts - not
// Clerk's actual password policy (server-side, configurable in the
// Dashboard), just enough to stop an obviously-too-short password from
// round-tripping to the API at all.
const newPasswordSchema = z
  .string()
  .min(8, { message: "Debe tener al menos 8 caracteres" });

const confirmPasswordSchema = z
  .string()
  .min(1, { message: "Confirma tu contraseña" });

/*
 * Profile
 */

export const profileFormSchema = z.object({
  firstName: z
    .string()
    .min(1, { message: "El nombre es obligatorio" })
    .transform((val) => val.trim()),
  lastName: z
    .string()
    .min(1, { message: "El apellido es obligatorio" })
    .transform((val) => val.trim()),
});
export type ProfileFormValues = z.infer<typeof profileFormSchema>;

/*
 * Password
 */

export const passwordFormSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, { message: "Ingresa tu contraseña actual" }),
    newPassword: newPasswordSchema,
    confirmPassword: confirmPasswordSchema,
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });
export type PasswordFormValues = z.infer<typeof passwordFormSchema>;

/*
 * Reverification (ReverificationDialog - see use-reverification-flow.ts)
 */

export const reverificationPasswordFormSchema = z.object({
  password: z.string().min(1, { message: "Ingresa tu contraseña" }),
});
export type ReverificationPasswordFormValues = z.infer<
  typeof reverificationPasswordFormSchema
>;

export const reverificationCodeFormSchema = z.object({
  code: codeSchema,
});
export type ReverificationCodeFormValues = z.infer<
  typeof reverificationCodeFormSchema
>;
