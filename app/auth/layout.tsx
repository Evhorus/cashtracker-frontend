import { Logo, ToastNotification } from '@/components';
import { verifySession } from '@/src/auth/dal';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isAuth } = await verifySession();

  if (isAuth) {
    redirect('/admin');
  }

  return (
    <>
      <div className="lg:grid lg:grid-cols-2 lg:h-screen">
        <div className="flex justify-center bg-purple-950 lg:bg-[url('/grafico.svg')] lg:bg-size-[30rem] bg-no-repeat bg-left-bottom">
          <div className="w-96 py-10 lg:py-20">
            <Link href="/">
              <Logo />
            </Link>
          </div>
        </div>

        <div className="p-4 sm:p-10 lg:py-28 overflow-y-auto">
          <div className="max-w-3xl mx-auto">{children}</div>
        </div>
      </div>
      <ToastNotification />
    </>
  );
}
