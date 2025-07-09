import { Metadata } from 'next';
import Link from 'next/link';
import { ForgotPasswordForm } from '@/components';

export const metadata: Metadata = {
  title: 'CashTracker - Olvidé mi password',
  description: 'CashTracker - Olvidé mi password',
};

export default function ForgotPasswordPage() {
  return (
    <>
      <h1 className="font-black text-4xl sm:text-6xl text-purple-950">
        ¿Olvidaste tu contraseña?
      </h1>
      <p className="text-2xl sm:text-3xl font-bold">
        aquí puedes <span className="text-amber-500">restablecerla</span>
      </p>
      <ForgotPasswordForm />
      <nav className="mt-10 flex flex-col space-y-4">
        <Link href="/auth/login" className="text-center text-gray-500">
          ¿Ya tienes cuenta? Iniciar sesión
        </Link>
      </nav>
    </>
  );
}
