'use client';
import { startTransition, useActionState, useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { DialogTitle } from '@headlessui/react';
import { ExpenseForm } from './ExpenseForm';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Expense, ExpenseFormSchema } from '@/src/schemas';
import { editExpense } from '@/actions';
import { toast } from 'react-toastify';
import { Loader } from '../ui/Loader';
import { Button } from '../ui/Button';

type EditExpenseForm = {
  closeModal: () => void;
};

export const EditExpenseForm: React.FC<EditExpenseForm> = ({ closeModal }) => {
  const [expense, setExpense] = useState<Expense>();

  const { id: budgetId } = useParams<{ id: string }>();

  const searchParams = useSearchParams();

  const expenseId = searchParams.get('editExpenseId')!;

  const [state, dispatch, isPending] = useActionState(editExpense, {
    errors: [],
    success: '',
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isReady },
  } = useForm({
    resolver: zodResolver(ExpenseFormSchema),
    values: {
      name: expense?.name || '',
      amount: (expense && +expense?.amount) || 0,
    },
  });

  useEffect(() => {
    const url = `${process.env.NEXT_PUBLIC_URL}/admin/api/budgets/${budgetId}/expenses/${expenseId}`;
    fetch(url)
      .then((res) => res.json())
      .then((data) => setExpense(data));
  }, [budgetId, expenseId]);

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

  const onEditExpense = handleSubmit((formData) => {
    const payload = {
      budgetId: +budgetId,
      expenseId: +expenseId,
      ...formData,
    };

    startTransition(() => dispatch(payload));
  });
  return (
    <>
      <DialogTitle as="h3" className="font-black text-4xl text-purple-950 my-5">
        Editar Gasto
      </DialogTitle>
      <p className="text-xl font-bold">
        Edita los detalles de un {''}
        <span className="text-amber-500">gasto</span>
      </p>
      <form
        onSubmit={onEditExpense}
        className="bg-gray-100 shadow-lg rounded-lg p-10 mt-10 border border-gray-300"
        noValidate
      >
        {!isReady ? (
          <Loader className="text-center" />
        ) : (
          <ExpenseForm register={register} errors={errors} />
        )}

        <Button isLoading={isPending} variant="secondary" className="w-full">
          Guardar Cambios
        </Button>
      </form>
    </>
  );
};
