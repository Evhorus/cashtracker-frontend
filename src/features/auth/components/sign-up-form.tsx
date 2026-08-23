"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/common/submit-button";
import { ErrorMessage } from "@/components/common/error-message";
import { FormInput } from "@/components/common/form-input";
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
// reasoning, including why FormInput's serverError prop (fed from
// fieldErrors) and react-hook-form's own client errors share the same
// field slot. The signed-in redirect lives in the parent (auth)/
// layout.tsx (a resource-level check, not middleware), so an already-
// authenticated visitor never sees a blank flash of this page.
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
              <div className="grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-3 sm:gap-y-0">
                <FormInput
                  control={signUpForm.control}
                  name="firstName"
                  label="Nombre"
                  placeholder="Juan"
                  autoComplete="given-name"
                  disabled={isSubmitting}
                  serverError={fieldErrors.firstName}
                />
                <FormInput
                  control={signUpForm.control}
                  name="lastName"
                  label="Apellido"
                  placeholder="Pérez"
                  autoComplete="family-name"
                  disabled={isSubmitting}
                  serverError={fieldErrors.lastName}
                />
              </div>
              <FormInput
                control={signUpForm.control}
                name="email"
                label="Email"
                type="email"
                placeholder="tucorreo@ejemplo.com"
                autoComplete="email"
                disabled={isSubmitting}
                serverError={fieldErrors.emailAddress}
              />
              <FormInput
                control={signUpForm.control}
                name="password"
                label="Contraseña"
                type="password"
                placeholder="••••••••"
                autoComplete="new-password"
                disabled={isSubmitting}
                serverError={fieldErrors.password}
              />
              <FormInput
                control={signUpForm.control}
                name="confirmPassword"
                label="Confirma tu contraseña"
                type="password"
                placeholder="••••••••"
                autoComplete="new-password"
                disabled={isSubmitting}
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
            <FormInput
              control={codeVerifyForm.control}
              name="code"
              label="Código"
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
