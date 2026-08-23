"use client";

import { useState } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

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
import {
  type CodeFormValues,
  codeFormSchema,
  type EmailFormValues,
  emailFormSchema,
  type NewPasswordFormValues,
  newPasswordFormSchema,
} from "../schemas/auth.schema";

// Three-step reset flow (send code -> verify code -> set new password) on
// top of the useForgotPassword() hook (features/auth/hooks/
// use-forgot-password.ts) - see sign-in-form.tsx for the full reasoning
// behind keeping provider specifics out of this component. The last step
// asks for the new password twice (schema-enforced match via
// newPasswordFormSchema) so a mistyped password doesn't lock the user out
// of the account they're actively trying to recover.
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

  const emailForm = useForm<EmailFormValues>({
    resolver: zodResolver(emailFormSchema),
    defaultValues: { email: "" },
  });

  const codeForm = useForm<CodeFormValues>({
    resolver: zodResolver(codeFormSchema),
    defaultValues: { code: "" },
  });

  const newPasswordForm = useForm<NewPasswordFormValues>({
    resolver: zodResolver(newPasswordFormSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  async function onSendCode(values: EmailFormValues) {
    const { error } = await sendResetCode(values.email);
    if (error) return;

    setCodeSent(true);
  }

  async function onVerifyCode(values: CodeFormValues) {
    await verifyResetCode(values.code);
  }

  async function onSubmitNewPassword(values: NewPasswordFormValues) {
    await submitNewPassword(values.password);
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
          <form
            onSubmit={emailForm.handleSubmit(onSendCode)}
            className="grid gap-y-4"
          >
            <Controller
              control={emailForm.control}
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
          <form
            onSubmit={codeForm.handleSubmit(onVerifyCode)}
            className="grid gap-y-4"
          >
            <Controller
              control={codeForm.control}
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
              Verificar código
            </SubmitButton>
          </form>
        )}

        {needsNewPassword && (
          <form
            onSubmit={newPasswordForm.handleSubmit(onSubmitNewPassword)}
            className="grid gap-y-4"
          >
            <Controller
              control={newPasswordForm.control}
              name="password"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor="password">Nueva contraseña</FieldLabel>
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
              control={newPasswordForm.control}
              name="confirmPassword"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor="confirmPassword">
                    Confirma tu nueva contraseña
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
