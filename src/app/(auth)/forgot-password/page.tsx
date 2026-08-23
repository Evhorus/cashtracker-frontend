"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSignIn } from "@clerk/nextjs";

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

// Three-step reset flow (send code -> verify code -> set new password)
// on top of Clerk's Core 3 useSignIn() hook's resetPasswordEmailCode API.
export default function ForgotPasswordPage() {
  const { signIn, errors, fetchStatus } = useSignIn();
  const router = useRouter();

  const [codeSent, setCodeSent] = useState(false);

  const isFetching = fetchStatus === "fetching";
  const needsNewPassword = signIn.status === "needs_new_password";

  async function handleSendCode(formData: FormData) {
    const emailAddress = formData.get("email") as string;

    const { error } = await signIn.create({ identifier: emailAddress });
    if (error) return;

    const { error: sendError } =
      await signIn.resetPasswordEmailCode.sendCode();
    if (sendError) return;

    setCodeSent(true);
  }

  async function handleVerifyCode(formData: FormData) {
    const code = formData.get("code") as string;
    await signIn.resetPasswordEmailCode.verifyCode({ code });
  }

  async function handleSubmitNewPassword(formData: FormData) {
    const password = formData.get("password") as string;

    const { error } = await signIn.resetPasswordEmailCode.submitPassword({
      password,
      signOutOfOtherSessions: true,
    });
    if (error) return;

    if (signIn.status === "complete") {
      await signIn.finalize({
        navigate: ({ session, decorateUrl }) => {
          if (session?.currentTask) return;
          const url = decorateUrl("/dashboard");
          if (url.startsWith("http")) {
            window.location.href = url;
          } else {
            router.push(url);
          }
        },
      });
    }
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
        {errors.global?.map((err, i) => (
          <ErrorMessage key={i}>{err.message}</ErrorMessage>
        ))}

        {!codeSent && (
          <form action={handleSendCode} className="grid gap-y-4">
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
              />
              {errors.fields.identifier?.message && (
                <ErrorMessage>
                  {errors.fields.identifier.message}
                </ErrorMessage>
              )}
            </Field>
            <SubmitButton
              type="submit"
              isLoading={isFetching}
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
                required
                autoComplete="one-time-code"
              />
              {errors.fields.code?.message && (
                <ErrorMessage>{errors.fields.code.message}</ErrorMessage>
              )}
            </Field>
            <SubmitButton
              type="submit"
              isLoading={isFetching}
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
                required
                autoComplete="new-password"
              />
              {errors.fields.password?.message && (
                <ErrorMessage>{errors.fields.password.message}</ErrorMessage>
              )}
            </Field>
            <SubmitButton
              type="submit"
              isLoading={isFetching}
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
