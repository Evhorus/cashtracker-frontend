import Link from 'next/link';
import { Metadata } from 'next';
import { Button, EditBudgetForm } from '@/components';
import { getBudgetById } from '@/src/services/budgets';

type EditBudgetPageProps = {
  params: Promise<{ id: string }>;
};

export const generateMetadata = async ({
  params,
}: EditBudgetPageProps): Promise<Metadata> => {
  const { id } = await params;
  const budget = await getBudgetById(id);
  return {
    title: `CashTracker - ${budget.name}`,
    description: `CashTracker - ${budget.name}`,
  };
};

export default async function EditBudgetPage({ params }: EditBudgetPageProps) {
  const { id } = await params;

  const budget = await getBudgetById(id);

  return (
    <>
      <div className="flex flex-col-reverse md:flex-row md:justify-between items-center">
        <div className="w-full md:w-auto">
          <h1 className="font-black text-4xl text-purple-950 my-5">
            Editar Presupuesto: {budget.name}
          </h1>
          <p className="text-xl font-bold">
            Llena el formulario y crea un nuevo {''}
            <span className="text-amber-500">presupuesto</span>
          </p>
        </div>
        <Link href={'/admin'}>
          <Button variant="secondary">Volver</Button>
        </Link>
      </div>
      <div className="p-10 mt-10  shadow-lg border ">
        <EditBudgetForm budget={budget} />
      </div>
    </>
  );
}
