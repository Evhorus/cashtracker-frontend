"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/common/submit-button";
import { ErrorMessage } from "@/components/common/error-message";
import { FormInput } from "@/components/common/form-input";
import { Text } from "@/components/common/typography";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { OAuthButtons } from "./oauth-buttons";
import { useSignUp } from "../hooks/use-sign-up";
import {
  type CodeFormValues,
  buildCodeFormSchema,
  type SignUpFormValues,
  buildSignUpFormSchema,
} from "../schemas/auth.schema";

// Custom-built sign-up UI on top of the useSignUp() hook (features/auth/
// hooks/use-sign-up.ts) - see the sibling sign-in form for the full
// reasoning, including why FormInput's serverError prop (fed from
// fieldErrors) and react-hook-form's own client errors share the same
// field slot. The signed-in redirect lives in the parent (auth)/
// layout.tsx (a resource-level check, not middleware), so an already-
// authenticated visitor never sees a blank flash of this page.
export function SignUpForm() {
  const t = useTranslations("auth.signUp");
  const tCommon = useTranslations("common");
  const tValidation = useTranslations("validation");
  const {
    isSubmitting,
    isComplete,
    awaitingVerification,
    fieldErrors,
    globalErrors,
    signUpWithPassword,
    resendEmailCode,
    verifyEmailCode,
    signUpWithOAuth,
  } = useSignUp();

  const signUpForm = useForm<SignUpFormValues>({
    resolver: zodResolver(buildSignUpFormSchema(tValidation)),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const codeVerifyForm = useForm<CodeFormValues>({
    resolver: zodResolver(buildCodeFormSchema(tValidation)),
    defaultValues: { code: "" },
  });

  async function onSubmit(values: SignUpFormValues) {
    await signUpWithPassword({
      firstName: values.firstName,
      lastName: values.lastName,
      emailAddress: values.email,
      password: values.password,
    });
  }

  async function onVerify(values: CodeFormValues) {
    await verifyEmailCode(values.code);
  }

  if (isComplete) return null;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>
          {awaitingVerification ? t("verifyTitle") : t("title")}
        </CardTitle>
        <CardDescription>
          {awaitingVerification ? t("verifySubtitle") : t("subtitle")}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-y-4">
        {/* Clerk's bot sign-up protection widget - required placeholder
            for custom sign-up flows, must exist before signUpWithPassword()/
            signUpWithOAuth() runs or Clerk falls back to invisible CAPTCHA
            with a console warning. Usually renders invisibly. */}
        <div id="clerk-captcha" />

        {globalErrors.map((message, i) => (
          <ErrorMessage key={i}>{message}</ErrorMessage>
        ))}

        {!awaitingVerification ? (
          <>
            <OAuthButtons disabled={isSubmitting} onSelect={signUpWithOAuth} />

            <p className="flex items-center gap-x-3 text-sm text-muted-foreground before:h-px before:flex-1 before:bg-border after:h-px after:flex-1 after:bg-border">
              {tCommon("or")}
            </p>

            <form
              onSubmit={signUpForm.handleSubmit(onSubmit)}
              className="grid gap-y-4"
            >
              <div className="grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-3 sm:gap-y-0">
                <FormInput
                  control={signUpForm.control}
                  name="firstName"
                  label={tCommon("name")}
                  placeholder={t("firstNamePlaceholder")}
                  autoComplete="given-name"
                  disabled={isSubmitting}
                  serverError={fieldErrors.firstName}
                />
                <FormInput
                  control={signUpForm.control}
                  name="lastName"
                  label={tCommon("lastName")}
                  placeholder={t("lastNamePlaceholder")}
                  autoComplete="family-name"
                  disabled={isSubmitting}
                  serverError={fieldErrors.lastName}
                />
              </div>
              <FormInput
                control={signUpForm.control}
                name="email"
                label={tCommon("email")}
                type="email"
                placeholder={tCommon("emailPlaceholder")}
                autoComplete="email"
                disabled={isSubmitting}
                serverError={fieldErrors.emailAddress}
              />
              <FormInput
                control={signUpForm.control}
                name="password"
                label={tCommon("password")}
                type="password"
                placeholder={tCommon("passwordPlaceholder")}
                autoComplete="new-password"
                disabled={isSubmitting}
                serverError={fieldErrors.password}
              />
              <FormInput
                control={signUpForm.control}
                name="confirmPassword"
                label={t("confirmPassword")}
                type="password"
                placeholder={tCommon("passwordPlaceholder")}
                autoComplete="new-password"
                disabled={isSubmitting}
              />
              <SubmitButton
                type="submit"
                isLoading={isSubmitting}
                className="w-full"
              >
                {t("submit")}
              </SubmitButton>
            </form>
          </>
        ) : (
          <form
            onSubmit={codeVerifyForm.handleSubmit(onVerify)}
            className="grid gap-y-4"
          >
            <FormInput
              control={codeVerifyForm.control}
              name="code"
              label={tCommon("code")}
              placeholder="123456"
              autoComplete="one-time-code"
              disabled={isSubmitting}
              serverError={fieldErrors.code}
            />
            <SubmitButton
              type="submit"
              isLoading={isSubmitting}
              className="w-full"
            >
              {t("verifySubmit")}
            </SubmitButton>
            <Button
              type="button"
              variant="link"
              size="sm"
              disabled={isSubmitting}
              onClick={() => resendEmailCode()}
            >
              {t("resendCode")}
            </Button>
          </form>
        )}
      </CardContent>
      <CardFooter>
        <Text className="w-full text-center">
          {t("haveAccount")}{" "}
          <Link
            href="/sign-in"
            className="font-medium text-primary hover:underline"
          >
            {t("signInLink")}
          </Link>
        </Text>
      </CardFooter>
    </Card>
  );
}
