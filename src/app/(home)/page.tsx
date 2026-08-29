import { features } from "./_data/features";
import { LandingHeader } from "@/components/common/landing-header";
import { Button } from "@/components/ui/button";
import { auth } from "@clerk/nextjs/server";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Check, Sparkles, Wallet } from "lucide-react";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { redirect } from "next/navigation";
import Link from "next/link";

// metadataBase is inherited from the root layout (it used to be
// declared here, pointing at port 3000 while the dev server runs on
// 3001). Everything below is landing-page specific and stays.
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("home.meta");

  return {
    title: t("title"),
    description: t("description"),
    keywords: t("keywords").split(", "),
    authors: [{ name: "CashTracker Team" }],
    openGraph: {
      title: t("ogTitle"),
      description: t("ogDescription"),
      type: "website",
      locale: t("ogLocale"),
      siteName: "CashTracker",
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: t("title"),
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("twitterDescription"),
      images: ["/og-image.png"],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}
// Resource-level check (not middleware - see proxy.ts) so a signed-in
// visitor is redirected to /dashboard instead of seeing the marketing
// page again. auth() reads the already-verified session (no network
// call, unlike currentUser()), so this is cheap even though it does
// mean the route can no longer prerender as fully static.
export default async function Home() {
  const t = await getTranslations("home");
  const { isAuthenticated } = await auth();
  if (isAuthenticated) redirect("/dashboard");

  return (
    <div className="min-h-svh bg-background">
      <LandingHeader />

      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 py-20 text-center md:py-32">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 flex justify-center"
        >
          <div className="mt-[-10rem] h-[28rem] w-[28rem] rounded-full bg-primary/20 blur-3xl md:h-[36rem] md:w-[36rem]" />
        </div>

        <div className="container mx-auto max-w-4xl animate-fade-in space-y-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            <Sparkles className="h-4 w-4" />
            {t("badge")}
          </span>
          <h1 className="text-4xl leading-tight font-bold md:text-6xl">
            {t.rich("heroTitle", {
              accent: (chunks) => (
                <span className="text-primary">{chunks}</span>
              ),
            })}
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground md:text-xl">
            {t("heroBody")}
          </p>
          <div className="flex flex-col items-center justify-center gap-4 pt-4 sm:flex-row">
            <Link href="/sign-in">
              <Button size="lg" className="w-full sm:w-auto">
                {t("ctaStart")}
              </Button>
            </Link>

            {/* <Link href="/demo">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Ver Demo
              </Button>
            </Link> */}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto bg-muted/30 px-4 py-20">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">
            {t("featuresTitle")}
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            {t("featuresBody")}
          </p>
        </div>

        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <Card
              key={feature.key}
              className="animate-fade-in border-border/50 transition-all duration-300 hover:border-primary/50 hover:shadow-lg"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">
                  {t(`features.${feature.key}Title`)}
                </CardTitle>
                <CardDescription className="text-base">
                  {t(`features.${feature.key}Body`)}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="mx-auto max-w-4xl">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold md:text-4xl">
                {t("benefitsTitle")}
              </h2>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-success/20">
                    <Check className="h-4 w-4 text-success" />
                  </div>
                  <div>
                    <h3 className="mb-1 font-semibold">{t("benefit1Title")}</h3>
                    <p className="text-muted-foreground">{t("benefit1Body")}</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-success/20">
                    <Check className="h-4 w-4 text-success" />
                  </div>
                  <div>
                    <h3 className="mb-1 font-semibold">{t("benefit2Title")}</h3>
                    <p className="text-muted-foreground">{t("benefit2Body")}</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-success/20">
                    <Check className="h-4 w-4 text-success" />
                  </div>
                  <div>
                    <h3 className="mb-1 font-semibold">{t("benefit3Title")}</h3>
                    <p className="text-muted-foreground">{t("benefit3Body")}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="rounded-2xl bg-primary p-8 text-center text-white shadow-xl">
              <div className="space-y-6">
                <div>
                  <p className="text-5xl font-bold">100%</p>
                  <p className="mt-2 text-white/80">{t("freeLabel")}</p>
                </div>
                <div className="border-t border-white/20 pt-6">
                  <p className="mb-2 text-lg font-semibold">
                    {t("readyTitle")}
                  </p>
                  <p className="mb-6 text-white/80">{t("readyBody")}</p>
                  <Link href="/sign-in">
                    <Button size="lg" variant="secondary" className="w-full">
                      {t("ctaCreateAccount")}
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto bg-muted/30 px-4 py-20">
        <div className="mx-auto max-w-3xl space-y-6 text-center">
          <h2 className="text-3xl font-bold md:text-4xl">{t("finalTitle")}</h2>
          <p className="text-lg text-muted-foreground">{t("finalBody")}</p>
          <Link href="/sign-in">
            <Button size="lg" className="mt-6">
              {t("ctaNow")}
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8">
        <div className="container mx-auto flex flex-col items-center gap-3 px-4 text-center text-muted-foreground">
          <div className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-primary" />
            <span className="font-semibold">CashTracker</span>
          </div>
          <p className="text-sm">
            &copy; {new Date().getFullYear()} CashTracker. {t("footer")}
          </p>
        </div>
      </footer>
    </div>
  );
}
