import Link from 'next/link';
import { AdminMenu, Logo, ToastNotification } from '@/components';
import { verifySession } from '@/src/auth/dal';
import { redirect } from 'next/navigation';

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isAuth, user } = await verifySession();

  if (!isAuth) {
    redirect('/');
  }

  return (
    <>
      <header className="bg-purple-950 py-5">
        <div className="max-w-5xl mx-auto flex flex-col lg:flex-row justify-between items-center">
          <div className="w-96">
            <Link href={'/admin'}>
              <Logo />
            </Link>
          </div>
          {user && <AdminMenu user={user} />}
        </div>
      </header>
      <section className="max-w-5xl mx-auto p-2 py-10">{children}</section>
      <ToastNotification />
      <footer className="py-5">
        <p className="text-center">
          Todos los Derechos Reservados {new Date().getFullYear()}
        </p>
      </footer>
    </>
  );
}
