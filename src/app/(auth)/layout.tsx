import Image from "next/image";
import Link from "next/link";

import { ChevronLeft } from "lucide-react";
import { ClerkProvider } from "@clerk/nextjs";
import { getClerkLocalization } from "@/i18n/clerk-localization";
import { auth } from "@clerk/nextjs/server";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";

// Covers /sign-in, /sign-up and /forgot-password (sso-callback lives
// outside this group - see its own layout for why). Resource-level
// check per Clerk's current guidance, not middleware - see proxy.ts.
export default async function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const t = await getTranslations("auth");
  const clerkLocalization = await getClerkLocalization();
  const { isAuthenticated } = await auth();
  if (isAuthenticated) redirect("/dashboard");

  return (
    <ClerkProvider localization={clerkLocalization}>
      <div className="grid min-h-svh lg:grid-cols-2">
        <div className="relative hidden items-center justify-center overflow-hidden bg-linear-to-br from-primary/90 via-primary to-primary/80 px-10 lg:flex">
          {/* Decorative elements */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.08),transparent_50%)]" />

          <div className="relative z-10 max-w-md text-center">
            <div className="relative mb-8 w-full scale-110">
              <Image
                src="/logo.svg"
                alt={t("logoAlt")}
                width={0}
                height={0}
                className="w-full"
                priority
              />
            </div>

            <p className="text-lg leading-relaxed font-light text-primary-foreground/90">
              {t("tagline")}
            </p>
          </div>
        </div>

        <div className="relative flex flex-col overflow-y-auto bg-background px-4 py-10">
          {/* <ModeToggle className="absolute right-5 top-5" /> */}
          <div className="mx-auto mb-8 flex w-full max-w-xl items-center">
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ChevronLeft size={20} />
              {t("backHome")}
            </Link>
          </div>

          <div className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center">
            {children}
          </div>
        </div>
      </div>
    </ClerkProvider>
  );
}
