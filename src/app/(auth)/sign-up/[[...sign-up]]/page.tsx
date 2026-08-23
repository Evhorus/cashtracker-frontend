"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSignUp } from "@clerk/nextjs";

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
import { FacebookIcon, GoogleIcon } from "@/components/common/icons";

type OAuthProvider = "oauth_google" | "oauth_facebook";

// Custom-built sign-up UI on top of Clerk's Core 3 useSignUp() hook -
// see the sibling sign-in page for why (Elements is deprecated). The
// signed-in redirect lives in the parent (auth)/layout.tsx (a resource-
// level check, not middleware), so an already-authenticated visitor
// never sees a blank flash of this page.
export default function SignUpPage() {
  const { signUp, errors, fetchStatus } = useSignUp();
  const router = useRouter();

  const isFetching = fetchStatus === "fetching";

  const awaitingVerification =
    signUp.status === "missing_requirements" &&
    signUp.unverifiedFields.includes("email_address") &&
    signUp.missingFields.length === 0;

  async function finalize() {
    await signUp.finalize({
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
    if (signUp.id) {
      // Known rough edge in Clerk's current hooks: signUp.sso() silently
      // no-ops (resolves with no error, no redirect - and no, reset()
      // doesn't fix it either) when the signUp already has a pending
      // password attempt on it (even a failed one). signUp.id only gets
      // set once create()/password() has actually run, so it's a
      // reliable "is there a prior attempt on this resource" check -
      // unlike local React state, which resets on every remount while
      // the resource itself persists server-side. Calling create() with
      // the new strategy first properly transitions that prior attempt,
      // so the follow-up sso() call actually redirects.
      await signUp.create({ strategy });
    }
    // Both params point at /sso-callback (not straight to /dashboard):
    // on Clerk dev instances the session is synced back via a
    // __clerk_db_jwt query param that client-side JS has to process
    // before the server recognizes the session. A short flow (one
    // already-authorized Google account) completes that fast enough that
    // redirecting straight to a server-protected route mostly gets away
    // with it; a longer one (choosing between multiple Google accounts,
    // re-confirming consent) takes longer and loses that race more often
    // - lands on /dashboard before the sync lands, bounces back to
    // /sign-in, needs a manual reload. <AuthenticateWithRedirectCallback/>
    // on /sso-callback (see its signInUrl/signUpUrl props) finishes that
    // sync client-side first and only then navigates on its own.
    await signUp.sso({
      strategy,
      redirectUrl: "/sso-callback",
      redirectCallbackUrl: "/sso-callback",
    });
  }

  async function handleSubmit(formData: FormData) {
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const emailAddress = formData.get("email") as string;
    const password = formData.get("password") as string;

    const { error } = await signUp.password({
      firstName,
      lastName,
      emailAddress,
      password,
    });
    if (error) return;

    await signUp.verifications.sendEmailCode();
  }

  async function handleVerify(formData: FormData) {
    const code = formData.get("code") as string;

    const { error } = await signUp.verifications.verifyEmailCode({ code });
    if (!error && signUp.status === "complete") await finalize();
  }

  if (signUp.status === "complete") return null;

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
            for custom sign-up flows, must exist before signUp.password()/
            .sso() runs or Clerk falls back to invisible CAPTCHA with a
            console warning. Usually renders invisibly. */}
        <div id="clerk-captcha" />

        {errors.global?.map((err, i) => (
          <ErrorMessage key={i}>{err.message}</ErrorMessage>
        ))}

        {!awaitingVerification ? (
          <>
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

            <form action={handleSubmit} className="grid gap-y-4">
              <div className="grid grid-cols-2 gap-x-3">
                <Field>
                  <FieldLabel htmlFor="firstName">Nombre</FieldLabel>
                  <Input
                    id="firstName"
                    name="firstName"
                    required
                    autoComplete="given-name"
                  />
                  {errors.fields.firstName?.message && (
                    <ErrorMessage>
                      {errors.fields.firstName.message}
                    </ErrorMessage>
                  )}
                </Field>
                <Field>
                  <FieldLabel htmlFor="lastName">Apellido</FieldLabel>
                  <Input
                    id="lastName"
                    name="lastName"
                    required
                    autoComplete="family-name"
                  />
                  {errors.fields.lastName?.message && (
                    <ErrorMessage>
                      {errors.fields.lastName.message}
                    </ErrorMessage>
                  )}
                </Field>
              </div>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                />
                {errors.fields.emailAddress?.message && (
                  <ErrorMessage>
                    {errors.fields.emailAddress.message}
                  </ErrorMessage>
                )}
              </Field>
              <Field>
                <FieldLabel htmlFor="password">Contraseña</FieldLabel>
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
              Verificar y crear cuenta
            </SubmitButton>
            <Button
              type="button"
              variant="link"
              size="sm"
              disabled={isFetching}
              onClick={() => signUp.verifications.sendEmailCode()}
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
