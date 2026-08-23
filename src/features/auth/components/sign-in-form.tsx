"use client";

import { useState } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/common/submit-button";
import { ErrorMessage } from "@/components/common/error-message";
import { Field, FieldLabel } from "@/components/ui/field";
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
  codeFormSchema,
  type EmailFormValues,
  emailFormSchema,
  type SignInPasswordFormValues,
  signInPasswordFormSchema,
} from "../schemas/auth.schema";

type Method = "password" | "code";

// Custom-built sign-in UI on top of the useSignIn() hook (features/auth/
// hooks/use-sign-in.ts) - that hook owns all provider-specific auth
// state/validation; this component only ever calls its methods and reads
// fieldErrors/globalErrors, same spirit as the rest of the app leaving
// submission state to its own data layer. Client-side validation (schema-
// driven, react-hook-form + zodResolver) follows the same pattern as
// envelope-form.tsx/expense-form.tsx - it catches shape problems (empty
// fields, malformed email) before ever calling Clerk; fieldErrors/
// globalErrors below are what Clerk itself reports once a request is
// actually made (wrong password, no such account, etc.), so both are
// shown - they cover different failure points.
export function SignInForm() {
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
    resolver: zodResolver(signInPasswordFormSchema),
    defaultValues: { email: "", password: "" },
  });

  const codeRequestForm = useForm<EmailFormValues>({
    resolver: zodResolver(emailFormSchema),
    defaultValues: { email: "" },
  });

  const codeVerifyForm = useForm<CodeFormValues>({
    resolver: zodResolver(codeFormSchema),
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
        <CardTitle>Inicia sesión</CardTitle>
        <CardDescription>Bienvenido de nuevo a CashTracker</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-y-4">
        <OAuthButtons disabled={isSubmitting} onSelect={signInWithOAuth} />

        <p className="flex items-center gap-x-3 text-sm text-muted-foreground before:h-px before:flex-1 before:bg-border after:h-px after:flex-1 after:bg-border">
          o
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
              Contraseña
            </TabsTrigger>
            <TabsTrigger value="code" className="flex-1">
              Código por email
            </TabsTrigger>
          </TabsList>

          <TabsContent value="password">
            <form
              onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
              className="grid gap-y-4"
            >
              <Controller
                control={passwordForm.control}
                name="email"
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <Input
                      id="email"
                      type="email"
                      placeholder="tucorreo@ejemplo.com"
                      autoComplete="email"
                      {...field}
                      disabled={isSubmitting}
                    />
                    {(fieldState.error?.message || fieldErrors.identifier) && (
                      <ErrorMessage>
                        {fieldState.error?.message ?? fieldErrors.identifier}
                      </ErrorMessage>
                    )}
                  </Field>
                )}
              />
              <Controller
                control={passwordForm.control}
                name="password"
                render={({ field, fieldState }) => (
                  <Field>
                    <div className="flex items-center justify-between">
                      <FieldLabel htmlFor="password">Contraseña</FieldLabel>
                      <Link
                        href="/forgot-password"
                        className="text-sm text-primary hover:underline"
                      >
                        ¿Olvidaste tu contraseña?
                      </Link>
                    </div>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      autoComplete="current-password"
                      {...field}
                      disabled={isSubmitting}
                    />
                    {(fieldState.error?.message || fieldErrors.password) && (
                      <ErrorMessage>
                        {fieldState.error?.message ?? fieldErrors.password}
                      </ErrorMessage>
                    )}
                  </Field>
                )}
              />
              <SubmitButton
                type="submit"
                isLoading={isSubmitting}
                className="w-full"
              >
                Iniciar sesión
              </SubmitButton>
            </form>
          </TabsContent>

          <TabsContent value="code">
            {!codeSent ? (
              <form
                onSubmit={codeRequestForm.handleSubmit(onSendCode)}
                className="grid gap-y-4"
              >
                <Controller
                  control={codeRequestForm.control}
                  name="email"
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel htmlFor="code-email">Email</FieldLabel>
                      <Input
                        id="code-email"
                        type="email"
                        placeholder="tucorreo@ejemplo.com"
                        autoComplete="email"
                        {...field}
                        disabled={isSubmitting}
                      />
                      {(fieldState.error?.message ||
                        fieldErrors.identifier) && (
                        <ErrorMessage>
                          {fieldState.error?.message ??
                            fieldErrors.identifier}
                        </ErrorMessage>
                      )}
                    </Field>
                  )}
                />
                <SubmitButton
                  type="submit"
                  isLoading={isSubmitting}
                  className="w-full"
                >
                  Enviar código
                </SubmitButton>
              </form>
            ) : (
              <form
                onSubmit={codeVerifyForm.handleSubmit(onVerifyCode)}
                className="grid gap-y-4"
              >
                <p className="text-sm text-muted-foreground">
                  Enviamos un código a{" "}
                  <span className="font-medium text-foreground">
                    {sentTo}
                  </span>
                </p>
                <Controller
                  control={codeVerifyForm.control}
                  name="code"
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel htmlFor="code">Código</FieldLabel>
                      <Input
                        id="code"
                        placeholder="123456"
                        autoComplete="one-time-code"
                        {...field}
                        disabled={isSubmitting}
                      />
                      {(fieldState.error?.message || fieldErrors.code) && (
                        <ErrorMessage>
                          {fieldState.error?.message ?? fieldErrors.code}
                        </ErrorMessage>
                      )}
                    </Field>
                  )}
                />
                <SubmitButton
                  type="submit"
                  isLoading={isSubmitting}
                  className="w-full"
                >
                  Verificar
                </SubmitButton>
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  disabled={isSubmitting}
                  onClick={() => resendEmailCode()}
                >
                  Reenviar código
                </Button>
              </form>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter>
        <p className="w-full text-center text-sm text-muted-foreground">
          ¿No tienes cuenta?{" "}
          <Link
            href="/sign-up"
            className="font-medium text-primary hover:underline"
          >
            Crea una
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
