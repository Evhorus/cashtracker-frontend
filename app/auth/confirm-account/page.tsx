import { ConfirmAccountForm } from '@/components';

type ConfirmAccountPageProps = {
  searchParams: Promise<{ email_verification_token: string }>;
};

export default async function ConfirmAccountPage({
  searchParams,
}: ConfirmAccountPageProps) {
  const emailVerificationToken = (await searchParams).email_verification_token;

  return (
    <>
      <h1 className="font-black text-4xl sm:text-6xl text-purple-950">
        Confirma tu cuenta
      </h1>
      <p className="text-2xl sm:text-3xl font-bold">
        Ingresa el código que recibiste{' '}
        <span className="text-amber-500">por email</span>
      </p>
      <ConfirmAccountForm emailVerificationToken={emailVerificationToken}/>
    </>
  );
}
