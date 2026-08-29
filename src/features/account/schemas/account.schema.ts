import { z } from "zod";

import { codeSchema } from "@/features/auth/schemas/auth.schema";
import type { ValidationTranslator } from "@/lib/validation";

// Mirrors the floor set in features/auth/schemas/auth.schema.ts - not
// Clerk's actual password policy (server-side, configurable in the
// Dashboard), just enough to stop an obviously-too-short password from
// round-tripping to the API at all.
const newPasswordSchema = (t: ValidationTranslator) =>
  z.string().min(8, { message: t("passwordMin") });

const confirmPasswordSchema = (t: ValidationTranslator) =>
  z.string().min(1, { message: t("passwordConfirm") });

/*
 * Profile
 */

export const buildProfileFormSchema = (t: ValidationTranslator) =>
  z.object({
    firstName: z
      .string()
      .min(1, { message: t("firstNameRequired") })
      .transform((val) => val.trim()),
    lastName: z
      .string()
      .min(1, { message: t("lastNameRequired") })
      .transform((val) => val.trim()),
  });
export type ProfileFormValues = z.infer<
  ReturnType<typeof buildProfileFormSchema>
>;

/*
 * Password
 */

export const buildPasswordFormSchema = (t: ValidationTranslator) =>
  z
    .object({
      currentPassword: z
        .string()
        .min(1, { message: t("currentPasswordRequired") }),
      newPassword: newPasswordSchema(t),
      confirmPassword: confirmPasswordSchema(t),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: t("passwordsDontMatch"),
      path: ["confirmPassword"],
    });
export type PasswordFormValues = z.infer<
  ReturnType<typeof buildPasswordFormSchema>
>;

/*
 * Reverification (ReverificationDialog - see use-reverification-flow.ts)
 */

export const buildReverificationPasswordFormSchema = (
  t: ValidationTranslator,
) =>
  z.object({
    password: z.string().min(1, { message: t("passwordRequired") }),
  });
export type ReverificationPasswordFormValues = z.infer<
  ReturnType<typeof buildReverificationPasswordFormSchema>
>;

export const buildReverificationCodeFormSchema = (t: ValidationTranslator) =>
  z.object({
    code: codeSchema(t),
  });
export type ReverificationCodeFormValues = z.infer<
  ReturnType<typeof buildReverificationCodeFormSchema>
>;
