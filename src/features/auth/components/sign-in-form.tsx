"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/common/submit-button";
import { ErrorMessage } from "@/components/common/error-message";
import { FormInput } from "@/components/common/form-input";
import { Text } from "@/components/common/typography";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OAuthButtons } from "./oauth-buttons";
import { useSignIn } from "../hooks/use-sign-in";
import {
  type CodeFormValues,
  buildCodeFormSchema,
  type EmailFormValues,
  buildEmailFormSchema,
  type SignInPasswordFormValues,
  buildSignInPasswordFormSchema,
} from "../schemas/auth.schema";

type Method = "password" | "code";

// Custom-built sign-in UI on top of the useSignIn() hook (features/auth/
// hooks/use-sign-in.ts) - that hook owns all provider-specific auth
// state/validation; this component only ever calls its methods and reads
// fieldErrors/globalErrors, same spirit as the rest of the app leaving
// submission state to its own data layer. Client-side validation (schema-
// driven, react-hook-form + zodResolver + FormInput) follows the same
// pattern as envelope-form.tsx/expense-form.tsx - it catches shape
// problems (empty fields, malformed email) before ever calling Clerk;
// fieldErrors (passed to FormInput as serverError) is whatever Clerk
// itself reports once a request is actually made (wrong password, no
// such account, etc.) - both share the same field slot, client-side
// taking priority since it means the request was never sent.
export function SignInForm() {
  const t = useTranslations("auth.signIn");
  const tCommon = useTranslations("common");
  const tValidation = useTranslations("validation");
  const {
    isSubmitting,
    fieldErrors,
    globalErrors,
    signInWithPassword,
    sendEmailCode,
    resendEmailCode,
    verifyEmailCode,
    signInWithOAuth,
    clearErrors,
  } = useSignIn();

  const [method, setMethod] = useState<Method>("password");
  const [codeSent, setCodeSent] = useState(false);
  const [sentTo, setSentTo] = useState("");

  const passwordForm = useForm<SignInPasswordFormValues>({
    resolver: zodResolver(buildSignInPasswordFormSchema(tValidation)),
    defaultValues: { email: "", password: "" },
  });

  const codeRequestForm = useForm<EmailFormValues>({
    resolver: zodResolver(buildEmailFormSchema(tValidation)),
    defaultValues: { email: "" },
  });

  const codeVerifyForm = useForm<CodeFormValues>({
    resolver: zodResolver(buildCodeFormSchema(tValidation)),
    defaultValues: { code: "" },
  });

  async function onPasswordSubmit(values: SignInPasswordFormValues) {
    await signInWithPassword(values.email, values.password);
  }

  async function onSendCode(values: EmailFormValues) {
    const { error } = await sendEmailCode(values.email);
    if (error) return;

    setSentTo(values.email);
    setCodeSent(true);
  }

  async function onVerifyCode(values: CodeFormValues) {
    await verifyEmailCode(values.code);
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("subtitle")}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-y-4">
        <OAuthButtons disabled={isSubmitting} onSelect={signInWithOAuth} />

        <p className="flex items-center gap-x-3 text-sm text-muted-foreground before:h-px before:flex-1 before:bg-border after:h-px after:flex-1 after:bg-border">
          {tCommon("or")}
        </p>

        {globalErrors.map((message, i) => (
          <ErrorMessage key={i}>{message}</ErrorMessage>
        ))}

        <Tabs
          value={method}
          onValueChange={(value) => {
            setMethod(value as Method);
            setCodeSent(false);
            void clearErrors();
            passwordForm.reset();
            codeRequestForm.reset();
            codeVerifyForm.reset();
          }}
        >
          <TabsList className="w-full">
            <TabsTrigger value="password" className="flex-1">
              {tCommon("password")}
            </TabsTrigger>
            <TabsTrigger value="code" className="flex-1">
              {t("emailCode")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="password">
            <form
              onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
              className="grid gap-y-4"
            >
              <FormInput
                control={passwordForm.control}
                name="email"
                label={tCommon("email")}
                type="email"
                placeholder={tCommon("emailPlaceholder")}
                autoComplete="email"
                disabled={isSubmitting}
                serverError={fieldErrors.identifier}
              />
              {/* Password needs a "forgot password?" link next to its
                  label, so it stays a manual Controller instead of
                  FormInput. */}
              <Controller
                control={passwordForm.control}
                name="password"
                render={({ field, fieldState }) => {
                  const message =
                    fieldState.error?.message ?? fieldErrors.password;
                  return (
                    <Field>
                      <div className="flex items-center justify-between">
                        <FieldLabel htmlFor="password">
                          {tCommon("password")}
                        </FieldLabel>
                        <Link
                          href="/forgot-password"
                          className="text-sm text-primary hover:underline"
                        >
                          {t("forgotPassword")}
                        </Link>
                      </div>
                      <Input
                        id="password"
                        type="password"
                        placeholder={tCommon("passwordPlaceholder")}
                        autoComplete="current-password"
                        {...field}
                        aria-invalid={
                          fieldState.invalid || !!fieldErrors.password
                        }
                        disabled={isSubmitting}
                      />
                      {message && <FieldError>{message}</FieldError>}
                    </Field>
                  );
                }}
              />
              <SubmitButton
                type="submit"
                isLoading={isSubmitting}
                className="w-full"
              >
                {t("submit")}
              </SubmitButton>
            </form>
          </TabsContent>

          <TabsContent value="code">
            {!codeSent ? (
              <form
                onSubmit={codeRequestForm.handleSubmit(onSendCode)}
                className="grid gap-y-4"
              >
                <FormInput
                  control={codeRequestForm.control}
                  name="email"
                  label={tCommon("email")}
                  type="email"
                  placeholder={tCommon("emailPlaceholder")}
                  autoComplete="email"
                  disabled={isSubmitting}
                  serverError={fieldErrors.identifier}
                />
                <SubmitButton
                  type="submit"
                  isLoading={isSubmitting}
                  className="w-full"
                >
                  {t("sendCode")}
                </SubmitButton>
              </form>
            ) : (
              <form
                onSubmit={codeVerifyForm.handleSubmit(onVerifyCode)}
                className="grid gap-y-4"
              >
                <Text>
                  {t.rich("codeSentTo", {
                    email: () => (
                      <span className="font-medium text-foreground">
                        {sentTo}
                      </span>
                    ),
                  })}
                </Text>
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
                  {t("verify")}
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
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter>
        <Text className="w-full text-center">
          {t("noAccount")}{" "}
          <Link
            href="/sign-up"
            className="font-medium text-primary hover:underline"
          >
            {t("createOne")}
          </Link>
        </Text>
      </CardFooter>
    </Card>
  );
}
