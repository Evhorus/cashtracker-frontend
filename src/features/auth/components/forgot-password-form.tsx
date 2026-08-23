"use client";

import { useState } from "react";
import Link from "next/link";

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
import { useForgotPassword } from "../hooks/use-forgot-password";

// Three-step reset flow (send code -> verify code -> set new password)
// on top of the useForgotPassword() hook (features/auth/hooks/
// use-forgot-password.ts) - see sign-in-form.tsx for the full reasoning
// behind keeping provider specifics out of this component.
export function ForgotPasswordForm() {
  const {
    isSubmitting,
    needsNewPassword,
    fieldErrors,
    globalErrors,
    sendResetCode,
    verifyResetCode,
    submitNewPassword,
  } = useForgotPassword();

  const [codeSent, setCodeSent] = useState(false);

  async function handleSendCode(formData: FormData) {
    const emailAddress = formData.get("email") as string;
    const { error } = await sendResetCode(emailAddress);
    if (error) return;

    setCodeSent(true);
  }

  async function handleVerifyCode(formData: FormData) {
    const code = formData.get("code") as string;
    await verifyResetCode(code);
  }

  async function handleSubmitNewPassword(formData: FormData) {
    const password = formData.get("password") as string;
    await submitNewPassword(password);
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Recupera tu contraseña</CardTitle>
        <CardDescription>
          {!codeSent
            ? "Te enviaremos un código a tu correo"
            : !needsNewPassword
              ? "Ingresa el código que recibiste"
              : "Elige una nueva contraseña"}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-y-4">
        {globalErrors.map((message, i) => (
          <ErrorMessage key={i}>{message}</ErrorMessage>
        ))}

        {!codeSent && (
          <form action={handleSendCode} className="grid gap-y-4">
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
              {fieldErrors.identifier && (
                <ErrorMessage>{fieldErrors.identifier}</ErrorMessage>
              )}
            </Field>
            <SubmitButton
              type="submit"
              isLoading={isSubmitting}
              className="w-full"
            >
              Enviar código
            </SubmitButton>
          </form>
        )}

        {codeSent && !needsNewPassword && (
          <form action={handleVerifyCode} className="grid gap-y-4">
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
              Verificar código
            </SubmitButton>
          </form>
        )}

        {needsNewPassword && (
          <form action={handleSubmitNewPassword} className="grid gap-y-4">
            <Field>
              <FieldLabel htmlFor="password">Nueva contraseña</FieldLabel>
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
              Guardar contraseña
            </SubmitButton>
          </form>
        )}
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        <p className="w-full text-center text-sm text-muted-foreground">
          <Link
            href="/sign-in"
            className="font-medium text-primary hover:underline"
          >
            Volver a iniciar sesión
          </Link>
        </p>
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
