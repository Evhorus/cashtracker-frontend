import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { SignInForm } from "@/features/auth/components/sign-in-form";

// Without this the tab falls back to the root layout's `default`, which
// is the landing page's marketing title - so signing in used to read
// "CashTracker - Control de Finanzas Personales". The heading the form
// already renders is the right name for the tab too, so it reuses that
// key rather than introducing a second string to keep in sync.
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth.signIn");
  return { title: t("title") };
}

export default function SignInPage() {
  return <SignInForm />;
}
