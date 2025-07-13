import {
  AddExpenseButton,
  Amount,
  ExpenseMenu,
  Modal,
  ProgressBar,
} from '@/components';
import { ModalContent } from '@/components/expenses/modal/ModalContent';
import { getBudgetById } from '@/src/services/budgets';
import { getExpenseById } from '@/src/services/expenses';
import { formatCurrency, formatDate } from '@/src/utils';
import { Metadata } from 'next';

type BudgetDetailsPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ showModal: boolean; editExpenseId: string }>;
};

export const generateMetadata = async ({
  params,
}: BudgetDetailsPageProps): Promise<Metadata> => {
  const { id } = await params;
  const budget = await getBudgetById(id);
  return {
    title: `CashTracker - ${budget.name}`,
    description: `CashTracker - ${budget.name}`,
  };
};

export default async function BudgetDetailsPage({
  params,
  searchParams,
}: BudgetDetailsPageProps) {
  const { id } = await params;

  let expense = null;

  const { editExpenseId, showModal } = await searchParams;

  if (editExpenseId && showModal) {
    expense = await getExpenseById(id, editExpenseId);
  }

  const budget = await getBudgetById(id);

  const totalSpent = budget.expenses.reduce(
    (total, expense) => +expense.amount + total,
    0,
  );

  const totalAvailable = +budget.amount - totalSpent;
  const percentage = +((totalSpent / +budget.amount) * 100).toFixed(2);

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-center gap-6 mb-8">
        <div>
          <h1 className="font-black text-4xl text-purple-950">{budget.name}</h1>
          <p className="text-lg font-medium text-gray-700 mt-2">
            Administra tus{' '}
            <span className="text-amber-500 font-bold">gastos</span>
          </p>
        </div>
        <div className="w-full sm:w-auto mt-4 sm:mt-0 flex justify-end">
          <AddExpenseButton />
        </div>
      </div>

      {budget.expenses.length === 0 ? (
        <p className="text-center py-20">No hay gastos aún</p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-gray-50 rounded-xl shadow p-6">
            <div className="flex flex-col justify-center items-center md:items-start gap-6">
              <ProgressBar percentage={percentage} />
            </div>
            <div className="flex flex-col gap-4 w-full">
              <div className="bg-white rounded-lg shadow p-4 flex-1 flex items-center justify-center">
                <Amount label="Presupuesto" amount={+budget.amount} />
              </div>
              <div className="bg-white rounded-lg shadow p-4 flex-1 flex items-center justify-center">
                <Amount label="Disponible" amount={totalAvailable} />
              </div>
              <div className="bg-white rounded-lg shadow p-4 flex-1 flex items-center justify-center">
                <Amount label="Gastado" amount={totalSpent} />
              </div>
            </div>
          </div>
          <h2 className="font-black text-3xl text-purple-950 mt-12 mb-6">
            Gastos en este presupuesto
          </h2>
          <ul
            role="list"
            className="grid gap-6 divide-y divide-gray-300 border border-gray-300 shadow-lg mt-4"
          >
            {budget.expenses.map((expense) => (
              <li key={expense.id} className="flex justify-between gap-x-6 p-5">
                <div className="flex-1 space-y-2">
                  <p className="text-xl font-semibold text-gray-900">
                    {expense.name}
                  </p>
                  <p className="text-lg font-bold text-amber-500">
                    {formatCurrency(+expense.amount)}
                  </p>
                  <div className="flex flex-wrap gap-4 text-gray-500 text-sm">
                    <span>
                      Agregado:{' '}
                      <span className="font-bold">
                        {formatDate(expense.createdAt)}
                      </span>
                    </span>
                    <span>
                      Actualizado:{' '}
                      <span className="font-bold">
                        {formatDate(expense.updatedAt)}
                      </span>
                    </span>
                  </div>
                </div>
                <ExpenseMenu expenseId={expense.id} />
              </li>
            ))}
          </ul>
        </>
      )}

      <Modal expense={expense}>
        <ModalContent />
      </Modal>
    </>
  );
}
