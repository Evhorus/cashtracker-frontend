import { Metadata } from 'next';
import Link from 'next/link';
import { getTokenFromCookies } from '@/src/auth/token';
import { BudgetsAPIResponseSchema } from '@/src/schemas';
import { formatCurrency, formatDate } from '@/src/utils';
import { BudgetMenu, Button, DeleteBudgetModal } from '@/components';

export const metadata: Metadata = {
  title: 'CashTracker - Panel de administración',
  description: 'Panel de administración',
};

const getUserBudgets = async () => {
  const token = await getTokenFromCookies();
  const url = `${process.env.API_URL}/budgets`;

  try {
    const req = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      next: {
        tags: ['all-budgets'],
      },
    });

    const json = await req.json();

    const budgets = BudgetsAPIResponseSchema.parse(json);

    return budgets;
  } catch (error) {
    console.error('Error fetching budgets:', error);
    throw error;
  }
};

export default async function AdminPage() {
  const budgets = await getUserBudgets();
  return (
    <>
      <div className="flex flex-col-reverse md:flex-row md:justify-between items-center">
        <div className="w-full md:w-auto">
          <h1 className="font-black text-4xl text-purple-950 my-5">
            Mis Presupuestos
          </h1>
          <p className="text-xl font-bold">
            Maneja y administra tus {''}
            <span className="text-amber-500">presupuestos</span>
          </p>
        </div>

        <Link href={'/admin/budgets/new'}>
          <Button variant="secondary">Crear Presupuesto </Button>
        </Link>
      </div>
      {budgets?.length ? (
        <>
          <ul
            role="list"
            className="grid gap-6 divide-y divide-gray-300 border border-gray-300 shadow-lg mt-4"
          >
            {budgets.map((budget) => (
              <li key={budget.id} className="flex justify-between gap-x-6 p-5 ">
                <div className="flex-1 space-y-2">
                  <p className="text-sm font-semibold leading-6 text-gray-900">
                    <Link
                      href={`/admin/budgets/${budget.id}`}
                      className="hover:underline text-2xl font-bold"
                    >
                      {budget.name}
                    </Link>
                  </p>
                  <p className="text-xl font-bold text-amber-500">
                    {formatCurrency(+budget.amount)}
                  </p>
                  <p className="text-gray-500 text-sm">
                    Última actualización: {''}
                    <span className="font-bold">
                      {formatDate(budget.updatedAt)}
                    </span>
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-x-6">
                  <BudgetMenu budgetId={budget.id} />
                </div>
              </li>
            ))}
          </ul>
          <DeleteBudgetModal />
        </>
      ) : (
        <p className="text-center py-20">
          No hay presupuestos aún {''}
          <Link href="/admin/budgets/new" className="text-purple-950 font-bold">
            Comienza creando uno
          </Link>
        </p>
      )}
    </>
  );
}
