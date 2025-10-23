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
      <div className="hidden lg:flex justify-center items-center bg-secondary-foreground px-10">
        <div className="text-center max-w-sm relative">
          <div className="relative w-full">
            <Logo />
          </div>

          <p className="text-indigo-300 text-base leading-relaxed">
            Tu app para controlar ingresos y gastos con facilidad, para
            administrar tu dinero de forma segura y práctica.
          </p>
        </div>
      </div>
      <div className="overflow-y-auto flex flex-col relative px-4 py-10">
        {/* <ModeToggle className="absolute right-5 top-5" /> */}
        <div className="mb-8 flex items-center max-w-xl mx-auto w-full">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-gray-700 dark:text-gray-300 hover:underline"
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
