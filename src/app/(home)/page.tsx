import { features } from "./_data/features";
import { CustomHeader } from "@/components/common/custom-header";
import { Button } from "@/components/ui/button";
import { currentUser } from "@clerk/nextjs/server";
import { Metadata } from "next";
import { Check, Sparkles, Wallet } from "lucide-react";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { redirect } from "next/navigation";
import Link from "next/link";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_URL || "http://localhost:3000"),
  title: "CashTracker - Control de Finanzas Personales",
  description:
    "Gestiona tus gastos, crea sobres inteligentes y alcanza tus metas financieras con CashTracker. Interfaz moderna y fácil de usar. 100% gratis para empezar.",
  keywords: [
    "finanzas personales",
    "control de gastos",
    "sobres",
    "ahorro",
    "gestión financiera",
    "cashtracker",
  ],
  authors: [{ name: "CashTracker Team" }],
  openGraph: {
    title: "CashTracker - Toma el control de tus finanzas personales",
    description:
      "Gestiona tus gastos, crea sobres inteligentes y alcanza tus metas financieras. 100% gratis para empezar.",
    type: "website",
    locale: "es_ES",
    siteName: "CashTracker",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "CashTracker - Control de Finanzas Personales",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CashTracker - Control de Finanzas Personales",
    description:
      "Gestiona tus gastos, crea sobres inteligentes y alcanza tus metas financieras. 100% gratis.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function Home() {
  const user = await currentUser();

  if (user) redirect("/dashboard");

  return (
    <div className="min-h-dvh bg-background">
      <CustomHeader />

      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 py-20 text-center md:py-32">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 flex justify-center"
        >
          <div className="mt-[-10rem] h-[28rem] w-[28rem] rounded-full bg-primary/20 blur-3xl md:h-[36rem] md:w-[36rem]" />
        </div>

        <div className="container mx-auto max-w-4xl animate-fade-in space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            <Sparkles className="h-4 w-4" />
            100% gratis para empezar
          </div>
          <h2 className="text-4xl leading-tight font-bold text-foreground md:text-6xl">
            Toma el control de tus{" "}
            <span className="text-primary">finanzas personales</span>
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground md:text-xl">
            CashTracker te ayuda a gestionar tus gastos, crear sobres
            inteligentes y alcanzar tus metas financieras con una interfaz
            moderna y fácil de usar.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 pt-4 sm:flex-row">
            <Link href="/sign-in">
              <Button size="lg" className="w-full sm:w-auto">
                Comenzar Gratis
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
          <h3 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
            Todo lo que necesitas para gestionar tu dinero
          </h3>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Herramientas poderosas diseñadas para simplificar tu vida financiera
          </p>
        </div>

        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="animate-fade-in border-border/50 transition-all duration-300 hover:border-primary/50 hover:shadow-lg"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
                <CardDescription className="text-base">
                  {feature.description}
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
              <h3 className="text-3xl font-bold text-foreground md:text-4xl">
                Simplifica tu economía personal
              </h3>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-success/20">
                    <Check className="h-4 w-4 text-success" />
                  </div>
                  <div>
                    <h4 className="mb-1 font-semibold text-foreground">
                      Sin complicaciones
                    </h4>
                    <p className="text-muted-foreground">
                      Interfaz intuitiva que cualquiera puede usar desde el
                      primer día
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-success/20">
                    <Check className="h-4 w-4 text-success" />
                  </div>
                  <div>
                    <h4 className="mb-1 font-semibold text-foreground">
                      Acceso multiplataforma
                    </h4>
                    <p className="text-muted-foreground">
                      Úsalo desde tu computadora, tablet o smartphone sin
                      problemas
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-success/20">
                    <Check className="h-4 w-4 text-success" />
                  </div>
                  <div>
                    <h4 className="mb-1 font-semibold text-foreground">
                      Resultados inmediatos
                    </h4>
                    <p className="text-muted-foreground">
                      Comienza a ver patrones y optimizar tus gastos desde el
                      primer mes
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="rounded-2xl bg-primary p-8 text-center text-white shadow-xl">
              <div className="space-y-6">
                <div>
                  <p className="text-5xl font-bold">100%</p>
                  <p className="mt-2 text-white/80">Gratis para empezar</p>
                </div>
                <div className="border-t border-white/20 pt-6">
                  <p className="mb-2 text-lg font-semibold">
                    ¿Listo para comenzar?
                  </p>
                  <p className="mb-6 text-white/80">
                    Únete a miles de personas que ya controlan sus finanzas
                  </p>
                  <Link href="/sign-in">
                    <Button size="lg" variant="secondary" className="w-full">
                      Crear Cuenta Gratis
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
          <h3 className="text-3xl font-bold text-foreground md:text-4xl">
            Empieza a gestionar tu dinero hoy mismo
          </h3>
          <p className="text-lg text-muted-foreground">
            No necesitas tarjeta de crédito. Comienza gratis en menos de 2
            minutos.
          </p>
          <Link href="/sign-in">
            <Button size="lg" className="mt-6">
              Comenzar Ahora
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8">
        <div className="container mx-auto flex flex-col items-center gap-3 px-4 text-center text-muted-foreground">
          <div className="flex items-center gap-2 text-foreground">
            <Wallet className="h-5 w-5 text-primary" />
            <span className="font-semibold">CashTracker</span>
          </div>
          <p className="text-sm">
            &copy; {new Date().getFullYear()} CashTracker. Control de gastos
            personales.
          </p>
        </div>
      </footer>
    </div>
  );
}
