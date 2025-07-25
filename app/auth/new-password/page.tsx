import { PasswordResetHandler } from '@/components';

export default function NewPasswordPage() {
  return (
    <>
      <h1 className="font-black text-4xl sm:text-6xl text-purple-950">
        Restablecer Password
      </h1>
      <p className="text-2xl sm:text-3xl font-bold">
        Ingresa el código que recibiste
        <span className="text-amber-500"> por email</span>
      </p>
      <PasswordResetHandler />
    </>
  );
}
