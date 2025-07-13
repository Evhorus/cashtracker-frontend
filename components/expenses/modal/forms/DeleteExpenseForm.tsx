'use client';
import { useParams, useSearchParams } from 'next/navigation';
import { DialogTitle } from '@headlessui/react';
import { startTransition, useActionState, useEffect } from 'react';
import { deleteExpense } from '@/actions';
import { toast } from 'react-toastify';
import { Loader } from '../../../ui/Loader';
import { useModal } from '@/src/hooks/use-modal';

export const DeleteExpenseForm: React.FC = () => {
  const { closeModal } = useModal();
  const { id: budgetId } = useParams();
  const searchParams = useSearchParams();
  const expenseId = searchParams.get('deleteExpenseId')!;
  const [state, dispatch, isPending] = useActionState(deleteExpense, {
    errors: [],
    success: '',
  });

  useEffect(() => {
    if (state.errors) {
      state.errors.forEach((err) => {
        toast.error(err);
      });
    }
  }, [state.errors]);

  useEffect(() => {
    if (state.success) {
      toast.success(state.success);
      closeModal();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.success]);

  useEffect(() => {
    if (!Number.isInteger(+budgetId!) || !Number.isInteger(+expenseId)) {
      closeModal();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onDeleteExpense = () => {
    startTransition(() =>
      dispatch({ budgetId: +budgetId!, expenseId: +expenseId }),
    );
  };
  return (
    <>
      <DialogTitle as="h3" className="font-black text-4xl text-purple-950 my-5">
        Eliminar Gasto
      </DialogTitle>
      <p className="text-xl font-bold">
        Confirma para eliminar, {''}
        <span className="text-amber-500">el gasto</span>
      </p>
      <p className="text-gray-600 text-sm">
        (Un gasto eliminado no se puede recuperar)
      </p>

      {isPending ? (
        <Loader className="text-center pt-10" />
      ) : (
        <div className="grid grid-cols-2 gap-5 mt-10">
          <button
            className="bg-amber-500 w-full p-3 text-white uppercase font-bold hover:bg-amber-600 cursor-pointer transition-colors"
            onClick={closeModal}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onDeleteExpense}
            className="bg-red-500 w-full p-3 text-white uppercase font-bold hover:bg-red-600 cursor-pointer transition-colors"
          >
            Eliminar
          </button>
        </div>
      )}
    </>
  );
};
