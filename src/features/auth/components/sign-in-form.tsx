"use client";

import { useState } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OAuthButtons } from "./oauth-buttons";
import { useSignIn } from "../hooks/use-sign-in";

type Method = "password" | "code";

// Custom-built sign-in UI on top of the useSignIn() hook (features/auth/
// hooks/use-sign-in.ts) - that hook owns all provider-specific auth
// state/validation; this component only ever calls its methods and
// reads fieldErrors/globalErrors, same spirit as the rest of the app
// leaving submission state to its own data layer.
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

  async function handlePasswordSubmit(formData: FormData) {
    const emailAddress = formData.get("email") as string;
    const password = formData.get("password") as string;
    await signInWithPassword(emailAddress, password);
  }

  async function handleSendCode(formData: FormData) {
    const emailAddress = formData.get("email") as string;
    const { error } = await sendEmailCode(emailAddress);
    if (error) return;

    setSentTo(emailAddress);
    setCodeSent(true);
  }

  async function handleVerifyCode(formData: FormData) {
    const code = formData.get("code") as string;
    await verifyEmailCode(code);
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
            <form action={handlePasswordSubmit} className="grid gap-y-4">
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
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
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
                Iniciar sesión
              </SubmitButton>
            </form>
          </TabsContent>

          <TabsContent value="code">
            {!codeSent ? (
              <form action={handleSendCode} className="grid gap-y-4">
                <Field>
                  <FieldLabel htmlFor="code-email">Email</FieldLabel>
                  <Input
                    id="code-email"
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
            ) : (
              <form action={handleVerifyCode} className="grid gap-y-4">
                <p className="text-sm text-muted-foreground">
                  Enviamos un código a{" "}
                  <span className="font-medium text-foreground">
                    {sentTo}
                  </span>
                </p>
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
