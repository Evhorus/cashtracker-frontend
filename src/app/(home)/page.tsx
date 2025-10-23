import { features } from '@/constants/features';
import { CustomHeader } from '@/shared/components/CustomHeader';
import { Button } from '@/shared/components/ui/button';
import { currentUser } from '@clerk/nextjs/server';

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function Home() {
  const user = await currentUser();

  if (user) redirect('/dashboard');

  return (
    <div className="min-h-screen bg-background">
      <CustomHeader />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32 text-center">
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
          <h2 className="text-4xl md:text-6xl font-bold text-foreground leading-tight">
            Toma el control de tus{' '}
            <span className="text-primary">finanzas personales</span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            CashTracker te ayuda a gestionar tus gastos, crear presupuestos
            inteligentes y alcanzar tus metas financieras con una interfaz
            moderna y fácil de usar.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Link href="/sig-in">
              <Button size="lg" className="w-full sm:w-auto">
                Comenzar Gratis
              </Button>
            </Link>

            <Link href="/demo">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Ver Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20 bg-muted/30">
        <div className="text-center mb-16">
          <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Todo lo que necesitas para gestionar tu dinero
          </h3>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Herramientas poderosas diseñadas para simplificar tu vida financiera
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
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
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h3 className="text-3xl md:text-4xl font-bold text-foreground">
                Simplifica tu economía personal
              </h3>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center">
                    <span className="text-success text-sm font-bold">✓</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">
                      Sin complicaciones
                    </h4>
                    <p className="text-muted-foreground">
                      Interfaz intuitiva que cualquiera puede usar desde el
                      primer día
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center ">
                    <span className="text-success text-sm font-bold">✓</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">
                      Acceso multiplataforma
                    </h4>
                    <p className="text-muted-foreground">
                      Úsalo desde tu computadora, tablet o smartphone sin
                      problemas
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center ">
                    <span className="text-success text-sm font-bold">✓</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">
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
            <div className="bg-primary rounded-2xl p-8 text-center text-white shadow-xl">
              <div className="space-y-6">
                <div>
                  <p className="text-5xl font-bold">100%</p>
                  <p className="text-white/80 mt-2">Gratis para empezar</p>
                </div>
                <div className="border-t border-white/20 pt-6">
                  <p className="text-lg font-semibold mb-2">
                    ¿Listo para comenzar?
                  </p>
                  <p className="text-white/80 mb-6">
                    Únete a miles de personas que ya controlan sus finanzas
                  </p>
                  <Link href="/sig-in">
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
      <section className="container mx-auto px-4 py-20 bg-muted/30">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h3 className="text-3xl md:text-4xl font-bold text-foreground">
            Empieza a gestionar tu dinero hoy mismo
          </h3>
          <p className="text-lg text-muted-foreground">
            No necesitas tarjeta de crédito. Comienza gratis en menos de 2
            minutos.
          </p>
          <Link href="/sig-in">
            <Button size="lg" className="mt-6">
              Comenzar Ahora
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()} CashTracker. Control de gastos
            personales.
          </p>
        </div>
      </footer>
    </div>
  );
}
