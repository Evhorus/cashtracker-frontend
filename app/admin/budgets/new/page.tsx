import Link from 'next/link';
import { Button, CreateBudgetForm } from '@/components';

export default function CreateBudgetPage() {
  return (
    <>
      <div className="flex flex-col-reverse md:flex-row md:justify-between items-center">
        <div className="w-full md:w-auto">
          <h1 className="font-black text-4xl text-purple-950 my-5">
            Nuevo Presupuesto
          </h1>
          <p className="text-xl font-bold">
            Llena el formulario y crea un nuevo {''}
            <span className="text-amber-500">presupuesto</span>
          </p>
        </div>

        <Link href="/admin">
          <Button variant="secondary">Volver</Button>
        </Link>
      </div>

      <div className="p-5 sm:p-10 mt-5 shadow-lg border border-gray-300">
        <CreateBudgetForm />
      </div>
    </>
  );
}
