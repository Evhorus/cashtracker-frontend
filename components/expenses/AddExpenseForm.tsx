'use client';
import { startTransition, useActionState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';
import { useParams } from 'next/navigation';
import { DialogTitle } from '@headlessui/react';
import { ExpenseForm } from './ExpenseForm';
import { ExpenseFormSchema } from '@/src/schemas';
import { createExpense } from '@/actions';
import { Loader } from '../ui/Loader';

type AddExpenseFormProps = {
  closeModal: () => void;
};

export const AddExpenseForm: React.FC<AddExpenseFormProps> = ({
  closeModal,
}) => {
  const { id } = useParams<{ id: string }>();
  const [state, dispatch, isPending] = useActionState(createExpense, {
    errors: [],
    success: '',
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(ExpenseFormSchema),
    defaultValues: {
      name: '',
      amount: 0,
    },
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

  const onAddExpense = handleSubmit((formData) => {
    const payload = {
      budgetId: +id,
      ...formData,
    };
    startTransition(() => dispatch(payload));
  });
  return (
    <>
      <DialogTitle as="h3" className="font-black text-4xl text-purple-950 my-5">
        Agregar Gasto
      </DialogTitle>

      <p className="text-xl font-bold">
        Llena el formulario y crea un {''}
        <span className="text-amber-500">gasto</span>
      </p>
      <form
        className="bg-gray-100 shadow-lg rounded-lg p-10 mt-10 border"
        onSubmit={onAddExpense}
        noValidate
      >
        <ExpenseForm register={register} errors={errors} />

        {isPending ? (
          <Loader />
        ) : (
          <input
            type="submit"
            className="bg-amber-500 w-full p-3 text-white uppercase font-bold hover:bg-amber-600 cursor-pointer transition-colors"
            value="Registrar Gasto"
          />
        )}
      </form>
    </>
  );
};
