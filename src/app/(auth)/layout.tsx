import Image from 'next/image';
import Link from 'next/link';

import { ChevronLeft } from 'lucide-react';
import { Logo } from '@/shared/components/Logo';

export default async function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="grid lg:grid-cols-2 h-screen">
      <div className="hidden lg:flex justify-center items-center bg-linear-to-br from-primary/90 via-primary to-primary/80 px-10 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.08),transparent_50%)]" />

        <div className="text-center max-w-md relative z-10">
          <div className="relative w-full mb-8 scale-110">
            <Image
              src="/logo.svg"
              alt="Logo CashTracker"
              width={0}
              height={0}
              className="w-full"
              priority
            />
          </div>

          <p className="text-primary-foreground/90 text-lg leading-relaxed font-light">
            Tu app para controlar ingresos y gastos con facilidad, para
            administrar tu dinero de forma segura y práctica.
          </p>
        </div>
      </div>

      <div className="overflow-y-auto flex flex-col relative px-4 py-10 bg-background">
        {/* <ModeToggle className="absolute right-5 top-5" /> */}
        <div className="mb-8 flex items-center max-w-xl mx-auto w-full">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft size={20} />
            Volver al inicio
          </Link>
        </div>

        <div className="flex-1 max-w-xl mx-auto w-full flex flex-col justify-center">
          {children}
        </div>
      </div>
    </div>
  );
}
