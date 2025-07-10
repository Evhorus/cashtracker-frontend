import { Header } from '@/components';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-amber-100 to-white">
      <Header />
      <main className="max-w-2xl mx-auto  p-0 sm:p-8">
        <div className="bg-white/90 rounded-3xl shadow-2xl px-6 py-10 flex flex-col items-center gap-6">
          <h1 className="font-black text-5xl md:text-6xl text-purple-900 text-center drop-shadow-lg">
            CashTracker
          </h1>
          <p className="text-xl md:text-2xl font-semibold text-gray-700 text-center">
            Domina tus{' '}
            <span className="text-amber-500 font-black">finanzas</span> con estilo
            y facilidad
          </p>
          <p className="text-base md:text-lg text-gray-500 text-center max-w-xl">
            Simplifica la gestión de tus ingresos y egresos en un solo lugar, de
            manera intuitiva y eficiente. Toma el control total de tus finanzas
            personales o empresariales con nuestra plataforma fácil de usar.
          </p>

          <h2 className="font-black text-3xl text-purple-800 mt-4 mb-2 text-center">
            Ventajas de CashTracker
          </h2>

          <ol className="grid grid-cols-1 gap-4 w-full">
            <li className="flex items-start gap-3 p-4 rounded-xl bg-purple-50 shadow-md">
              <span className="text-2xl">🗂️</span>
              <div>
                <span className="text-purple-900 font-bold">
                  Organización sin Esfuerzo:{' '}
                </span>
                <span className="text-gray-700">
                  Clasifica y visualiza tus gastos de forma clara y ordenada, sin
                  complicaciones con nuestro panel amigable y fácil de usar.
                </span>
              </div>
            </li>
            <li className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 shadow-md">
              <span className="text-2xl">🎯</span>
              <div>
                <span className="text-amber-600 font-bold">
                  Presupuestación Inteligente:{' '}
                </span>
                <span className="text-gray-700">
                  Establece objetivos financieros realistas y sigue tu progreso
                  con nuestras herramientas de presupuestación inteligente.
                </span>
              </div>
            </li>
            <li className="flex items-start gap-3 p-4 rounded-xl bg-blue-50 shadow-md">
              <span className="text-2xl">🌍</span>
              <div>
                <span className="text-blue-700 font-bold">
                  Acceso en cualquier lugar:{' '}
                </span>
                <span className="text-gray-700">
                  Gestiona tus finanzas desde donde te encuentres, en cualquier
                  dispositivo.
                </span>
              </div>
            </li>
            <li className="flex items-start gap-3 p-4 rounded-xl bg-green-50 shadow-md">
              <span className="text-2xl">🔒</span>
              <div>
                <span className="text-green-700 font-bold">
                  Seguridad Garantizada:{' '}
                </span>
                <span className="text-gray-700">
                  Protegemos tus datos con los más altos estándares de seguridad,
                  para que puedas utilizar nuestra plataforma con total
                  tranquilidad.
                </span>
              </div>
            </li>
          </ol>
        </div>
      </main>
    </div>
  );
}
