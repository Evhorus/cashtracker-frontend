"use client";

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
import { OAuthButtons } from "./oauth-buttons";
import { useSignUp } from "../hooks/use-sign-up";
import {
  type CodeFormValues,
  codeFormSchema,
  type SignUpFormValues,
  signUpFormSchema,
} from "../schemas/auth.schema";

// Custom-built sign-up UI on top of the useSignUp() hook (features/auth/
// hooks/use-sign-up.ts) - see the sibling sign-in form for the full
// reasoning, including why both react-hook-form's client errors and the
// hook's fieldErrors/globalErrors show up side by side. The signed-in
// redirect lives in the parent (auth)/layout.tsx (a resource-level
// check, not middleware), so an already-authenticated visitor never sees
// a blank flash of this page.
export function SignUpForm() {
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
    resolver: zodResolver(signUpFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const codeVerifyForm = useForm<CodeFormValues>({
    resolver: zodResolver(codeFormSchema),
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
          {awaitingVerification ? "Verifica tu email" : "Crea tu cuenta"}
        </CardTitle>
        <CardDescription>
          {awaitingVerification
            ? "Ingresa el código que enviamos a tu correo"
            : "Empieza a controlar tus finanzas gratis"}
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
              o
            </p>

            <form
              onSubmit={signUpForm.handleSubmit(onSubmit)}
              className="grid gap-y-4"
            >
              <div className="grid grid-cols-2 gap-x-3">
                <Controller
                  control={signUpForm.control}
                  name="firstName"
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel htmlFor="firstName">Nombre</FieldLabel>
                      <Input
                        id="firstName"
                        placeholder="Juan"
                        autoComplete="given-name"
                        {...field}
                        disabled={isSubmitting}
                      />
                      {(fieldState.error?.message ||
                        fieldErrors.firstName) && (
                        <ErrorMessage>
                          {fieldState.error?.message ?? fieldErrors.firstName}
                        </ErrorMessage>
                      )}
                    </Field>
                  )}
                />
                <Controller
                  control={signUpForm.control}
                  name="lastName"
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel htmlFor="lastName">Apellido</FieldLabel>
                      <Input
                        id="lastName"
                        placeholder="Pérez"
                        autoComplete="family-name"
                        {...field}
                        disabled={isSubmitting}
                      />
                      {(fieldState.error?.message ||
                        fieldErrors.lastName) && (
                        <ErrorMessage>
                          {fieldState.error?.message ?? fieldErrors.lastName}
                        </ErrorMessage>
                      )}
                    </Field>
                  )}
                />
              </div>
              <Controller
                control={signUpForm.control}
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
                    {(fieldState.error?.message ||
                      fieldErrors.emailAddress) && (
                      <ErrorMessage>
                        {fieldState.error?.message ??
                          fieldErrors.emailAddress}
                      </ErrorMessage>
                    )}
                  </Field>
                )}
              />
              <Controller
                control={signUpForm.control}
                name="password"
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel htmlFor="password">Contraseña</FieldLabel>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      autoComplete="new-password"
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
              <Controller
                control={signUpForm.control}
                name="confirmPassword"
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel htmlFor="confirmPassword">
                      Confirma tu contraseña
                    </FieldLabel>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      autoComplete="new-password"
                      {...field}
                      disabled={isSubmitting}
                    />
                    {fieldState.error?.message && (
                      <ErrorMessage>{fieldState.error.message}</ErrorMessage>
                    )}
                  </Field>
                )}
              />
              <SubmitButton
                type="submit"
                isLoading={isSubmitting}
                className="w-full"
              >
                Crear cuenta
              </SubmitButton>
            </form>
          </>
        ) : (
          <form
            onSubmit={codeVerifyForm.handleSubmit(onVerify)}
            className="grid gap-y-4"
          >
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
              Verificar y crear cuenta
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
      </CardContent>
      <CardFooter>
        <p className="w-full text-center text-sm text-muted-foreground">
          ¿Ya tienes cuenta?{" "}
          <Link
            href="/sign-in"
            className="font-medium text-primary hover:underline"
          >
            Inicia sesión
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
