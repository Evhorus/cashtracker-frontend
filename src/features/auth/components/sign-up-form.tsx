"use client";

import Link from "next/link";

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

// Custom-built sign-up UI on top of the useSignUp() hook (features/auth/
// hooks/use-sign-up.ts) - see the sibling sign-in form for the full
// reasoning. The signed-in redirect lives in the parent (auth)/
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

  async function handleSubmit(formData: FormData) {
    await signUpWithPassword({
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      emailAddress: formData.get("email") as string,
      password: formData.get("password") as string,
    });
  }

  async function handleVerify(formData: FormData) {
    const code = formData.get("code") as string;
    await verifyEmailCode(code);
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

            <form action={handleSubmit} className="grid gap-y-4">
              <div className="grid grid-cols-2 gap-x-3">
                <Field>
                  <FieldLabel htmlFor="firstName">Nombre</FieldLabel>
                  <Input
                    id="firstName"
                    name="firstName"
                    placeholder="Juan"
                    required
                    autoComplete="given-name"
                  />
                  {fieldErrors.firstName && (
                    <ErrorMessage>{fieldErrors.firstName}</ErrorMessage>
                  )}
                </Field>
                <Field>
                  <FieldLabel htmlFor="lastName">Apellido</FieldLabel>
                  <Input
                    id="lastName"
                    name="lastName"
                    placeholder="Pérez"
                    required
                    autoComplete="family-name"
                  />
                  {fieldErrors.lastName && (
                    <ErrorMessage>{fieldErrors.lastName}</ErrorMessage>
                  )}
                </Field>
              </div>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="tucorreo@ejemplo.com"
                  required
                  autoComplete="email"
                />
                {fieldErrors.emailAddress && (
                  <ErrorMessage>{fieldErrors.emailAddress}</ErrorMessage>
                )}
              </Field>
              <Field>
                <FieldLabel htmlFor="password">Contraseña</FieldLabel>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  autoComplete="new-password"
                />
                {fieldErrors.password && (
                  <ErrorMessage>{fieldErrors.password}</ErrorMessage>
                )}
              </Field>
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
          <form action={handleVerify} className="grid gap-y-4">
            <Field>
              <FieldLabel htmlFor="code">Código</FieldLabel>
              <Input
                id="code"
                name="code"
                placeholder="123456"
                required
                autoComplete="one-time-code"
              />
              {fieldErrors.code && (
                <ErrorMessage>{fieldErrors.code}</ErrorMessage>
              )}
            </Field>
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
