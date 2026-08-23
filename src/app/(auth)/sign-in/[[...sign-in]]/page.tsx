"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSignIn } from "@clerk/nextjs";

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
import { FacebookIcon, GoogleIcon } from "@/components/common/icons";

type Method = "password" | "code";
type OAuthProvider = "oauth_google" | "oauth_facebook";

// Custom-built sign-in UI on top of Clerk's Core 3 useSignIn() hook -
// @clerk/elements is deprecated, so this hand-rolls the form instead of
// using <SignIn /> or the old Elements primitives. The hook owns all
// auth state/validation (errors, fetchStatus), same spirit as the rest
// of the app leaving submission state to its own data layer.
export default function SignInPage() {
  const { signIn, errors, fetchStatus } = useSignIn();
  const router = useRouter();

  const [method, setMethod] = useState<Method>("password");
  const [codeSent, setCodeSent] = useState(false);
  const [sentTo, setSentTo] = useState("");

  const isFetching = fetchStatus === "fetching";

  async function finalize() {
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

  async function handleSSO(strategy: OAuthProvider) {
    if (signIn.id) {
      // Known rough edge in Clerk's current hooks: signIn.sso() silently
      // no-ops (resolves with no error, no redirect - and no, reset()
      // doesn't fix it either) when the signIn already has a pending
      // password/email-code attempt on it. signIn.id only gets set once
      // create()/password()/emailCode.sendCode() has actually run, so
      // it's a reliable "is there a prior attempt on this resource" check
      // - unlike local React state, which resets on every remount while
      // the resource itself persists server-side. Calling create() with
      // the new strategy first properly transitions that prior attempt,
      // so the follow-up sso() call actually redirects.
      await signIn.create({
        strategy,
        redirectUrl: "/sso-callback",
        actionCompleteRedirectUrl: "/dashboard",
      });
    }
    await signIn.sso({
      strategy,
      redirectUrl: "/dashboard",
      redirectCallbackUrl: "/sso-callback",
    });
  }

  async function handlePasswordSubmit(formData: FormData) {
    const emailAddress = formData.get("email") as string;
    const password = formData.get("password") as string;

    const { error } = await signIn.password({ emailAddress, password });
    if (!error && signIn.status === "complete") await finalize();
    // needs_second_factor / needs_client_trust aren't handled by this UI
    // yet - if hit, the request just won't complete; errors.global below
    // still surfaces whatever Clerk reports.
  }

  async function handleSendCode(formData: FormData) {
    const emailAddress = formData.get("email") as string;

    const { error } = await signIn.create({ identifier: emailAddress });
    if (error) return;

    const { error: sendError } = await signIn.emailCode.sendCode();
    if (sendError) return;

    setSentTo(emailAddress);
    setCodeSent(true);
  }

  async function handleVerifyCode(formData: FormData) {
    const code = formData.get("code") as string;

    const { error } = await signIn.emailCode.verifyCode({ code });
    if (!error && signIn.status === "complete") await finalize();
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Inicia sesión</CardTitle>
        <CardDescription>Bienvenido de nuevo a CashTracker</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-y-4">
        <div className="grid grid-cols-2 gap-x-3">
          <Button
            type="button"
            variant="outline"
            disabled={isFetching}
            onClick={() => handleSSO("oauth_google")}
          >
            <GoogleIcon className="size-4" />
            Google
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={isFetching}
            onClick={() => handleSSO("oauth_facebook")}
          >
            <FacebookIcon className="size-4" />
            Facebook
          </Button>
        </div>

        <p className="flex items-center gap-x-3 text-sm text-muted-foreground before:h-px before:flex-1 before:bg-border after:h-px after:flex-1 after:bg-border">
          o
        </p>

        {errors.global?.map((err, i) => (
          <ErrorMessage key={i}>{err.message}</ErrorMessage>
        ))}

        <Tabs
          value={method}
          onValueChange={(value) => {
            setMethod(value as Method);
            setCodeSent(false);
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
                  required
                  autoComplete="email"
                />
                {errors.fields.identifier?.message && (
                  <ErrorMessage>
                    {errors.fields.identifier.message}
                  </ErrorMessage>
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
                  required
                  autoComplete="current-password"
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
                  Verificar
                </SubmitButton>
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  disabled={isFetching}
                  onClick={() => signIn.emailCode.sendCode()}
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
