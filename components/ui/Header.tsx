import Link from 'next/link';
import { Logo } from './Logo';
import { verifySession } from '@/src/auth/dal';
import { logout } from '@/actions';

export const Header: React.FC = async () => {
  const { isAuth } = await verifySession();

  return (
    <header className=" bg-purple-950 py-5">
      <div className="max-w-3xl mx-auto flex flex-col lg:flex-row items-center">
        <div className="w-96 lg:w-[500px]">
          <Logo />
        </div>

        <nav className="flex flex-col lg:flex-row lg:justify-end gap-6 w-full">
          {isAuth ? (
            <div className="flex items-center gap-4">
              <span className="text-white/80 text-sm">Bienvenido</span>
              <Link
                href="/dashboard"
                className="bg-amber-500 hover:bg-amber-600 text-black font-semibold px-4 py-2 rounded-lg transition-all duration-200 uppercase text-sm text-center shadow-lg hover:shadow-xl"
              >
                Ir a Admin
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
              <Link
                href="/auth/login"
                className="border-2 border-white/30 hover:border-amber-500 text-white hover:text-amber-500 font-semibold px-6 py-2 rounded-lg transition-all duration-200 uppercase text-sm text-center backdrop-blur-sm"
              >
                Iniciar Sesión
              </Link>
              <Link
                href="/auth/register"
                className="bg-amber-500 hover:bg-amber-600 text-black font-semibold px-6 py-2 rounded-lg transition-all duration-200 uppercase text-sm text-center shadow-lg hover:shadow-xl"
              >
                Registrarme
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};
