"use client";

import { useState } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import { SubmitButton } from "@/components/common/submit-button";
import { ErrorMessage } from "@/components/common/error-message";
import { FormInput } from "@/components/common/form-input";
import { OtpInput } from "@/components/common/otp-input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
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
// behind FormInput/serverError. The last step asks for the new password
// twice (schema-enforced match via newPasswordFormSchema) so a mistyped
// password doesn't lock the user out of the account they're actively
// trying to recover.
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
            <FormInput
              control={emailForm.control}
              name="email"
              label="Email"
              type="email"
              placeholder="tucorreo@ejemplo.com"
              autoComplete="email"
              disabled={isSubmitting}
              serverError={fieldErrors.identifier}
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
              render={({ field, fieldState }) => {
                const message = fieldState.error?.message ?? fieldErrors.code;
                return (
                  <Field>
                    <FieldLabel htmlFor="code">Código</FieldLabel>
                    <OtpInput
                      id="code"
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      disabled={isSubmitting}
                      autoFocus
                      aria-invalid={fieldState.invalid || !!fieldErrors.code}
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
              Verificar código
            </SubmitButton>
          </form>
        )}

        {needsNewPassword && (
          <form
            onSubmit={newPasswordForm.handleSubmit(onSubmitNewPassword)}
            className="grid gap-y-4"
          >
            <FormInput
              control={newPasswordForm.control}
              name="password"
              label="Nueva contraseña"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              disabled={isSubmitting}
              serverError={fieldErrors.password}
            />
            <FormInput
              control={newPasswordForm.control}
              name="confirmPassword"
              label="Confirma tu nueva contraseña"
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
