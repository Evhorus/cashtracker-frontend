import { z } from "zod";

import type { ValidationTranslator } from "@/lib/validation";

/**
 * Auth form schemas. Every export is a factory taking the `validation`
 * translator - see ValidationTranslator for why these can't be plain
 * module constants.
 */

// z.email() (not the deprecated .string().email()) covers "required" and
// "valid format" in one message - an empty string already fails it, so
// there's no separate .min(1) needed on top.
const emailSchema = (t: ValidationTranslator) =>
  z.email({ message: t("emailInvalid") });

// Doesn't enforce Clerk's actual password policy (that's server-side and
// configurable in the Dashboard) - just a sane client-side floor so
// obviously-too-short passwords never round-trip to the API at all.
const newPasswordSchema = (t: ValidationTranslator) =>
  z.string().min(8, { message: t("passwordMin") });

const confirmPasswordSchema = (t: ValidationTranslator) =>
  z.string().min(1, { message: t("passwordConfirm") });

// Exported - features/account/schemas/account.schema.ts reuses this for
// the reverification dialog's email_code step, same 6-digit shape, one
// definition instead of two.
export const codeSchema = (t: ValidationTranslator) =>
  z
    .string()
    .min(1, { message: t("codeRequired") })
    .regex(/^\d{6}$/, { message: t("codeSixDigits") });

/*
 * Sign in
 */

export const buildEmailFormSchema = (t: ValidationTranslator) =>
  z.object({
    email: emailSchema(t),
  });
export type EmailFormValues = z.infer<ReturnType<typeof buildEmailFormSchema>>;

export const buildSignInPasswordFormSchema = (t: ValidationTranslator) =>
  z.object({
    email: emailSchema(t),
    password: z.string().min(1, { message: t("passwordRequired") }),
  });
export type SignInPasswordFormValues = z.infer<
  ReturnType<typeof buildSignInPasswordFormSchema>
>;

export const buildCodeFormSchema = (t: ValidationTranslator) =>
  z.object({
    code: codeSchema(t),
  });
export type CodeFormValues = z.infer<ReturnType<typeof buildCodeFormSchema>>;

/*
 * Sign up
 */

export const buildSignUpFormSchema = (t: ValidationTranslator) =>
  z
    .object({
      firstName: z
        .string()
        .min(1, { message: t("firstNameRequired") })
        .transform((val) => val.trim()),
      lastName: z
        .string()
        .min(1, { message: t("lastNameRequired") })
        .transform((val) => val.trim()),
      email: emailSchema(t),
      password: newPasswordSchema(t),
      confirmPassword: confirmPasswordSchema(t),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("passwordsDontMatch"),
      path: ["confirmPassword"],
    });
export type SignUpFormValues = z.infer<
  ReturnType<typeof buildSignUpFormSchema>
>;

/*
 * Forgot password
 */

export const buildNewPasswordFormSchema = (t: ValidationTranslator) =>
  z
    .object({
      password: newPasswordSchema(t),
      confirmPassword: confirmPasswordSchema(t),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("passwordsDontMatch"),
      path: ["confirmPassword"],
    });
export type NewPasswordFormValues = z.infer<
  ReturnType<typeof buildNewPasswordFormSchema>
>;
