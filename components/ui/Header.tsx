import Link from 'next/link';
import { Logo } from './Logo';
import { verifySession } from '@/src/auth/dal';
import { logout } from '@/actions';
import { Button } from './Button';

export const Header: React.FC = async () => {
  const { isAuth } = await verifySession();

  return (
    <header className=" bg-purple-950 p-4 rounded-b-3xl sm:rounded-none">
      <div className="max-w-3xl mx-auto flex flex-col lg:flex-row items-center">
        <div className="w-96 lg:w-[500px]">
          <Logo />
        </div>

        <nav className="flex flex-col lg:flex-row lg:justify-end gap-6 w-full">
          {isAuth ? (
            <div className="flex items-center gap-4">
              <span className="text-white/80 text-sm">Bienvenido</span>
              <Link
                href="/admin"
                className="bg-amber-500 hover:bg-amber-600 text-black font-semibold px-4 py-2 rounded-lg transition-all duration-200 uppercase text-sm text-center shadow-lg hover:shadow-xl"
              >
                Mi panel
              </Link>
              <button
                className="text-white/80 hover:text-white text-sm cursor-pointer"
                onClick={logout}
                type="button"
              >
                Cerrar Sesión
              </button>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-4">
              <Link href="/auth/login">
                <Button variant="outline-secondary" className="w-full">
                  Iniciar Sesión
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button variant="secondary" className="w-full">
                  Registrarme
                </Button>
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};
