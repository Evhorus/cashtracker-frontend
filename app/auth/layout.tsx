import { ToastContainer } from 'react-toastify';
import { Logo } from '@/components';

export default async function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <div className="lg:grid lg:grid-cols-2 lg:min-h-screen">
        <div className="flex justify-center bg-purple-950 lg:bg-[url('/grafico.svg')] lg:bg-size-[30rem] bg-no-repeat bg-left-bottom">
          <div className="w-96 py-10 lg:py-20">
            <Logo />
          </div>
        </div>

        <div className="p-10 lg:py-28 h-full">
          <div className="max-w-3xl mx-auto overflow-auto">{children}</div>
        </div>
      </div>
      <ToastContainer />
    </>
  );
}
