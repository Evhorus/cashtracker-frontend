'use client';
import { startTransition, useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';
import { Loader } from '../ui/Loader';
import { createBudget } from '@/actions';
import { BudgetFormSchema } from '@/src/schemas';
import { BudgetForm } from './BudgetForm';

export const CreateBudgetForm: React.FC = () => {
  const [state, dispatch, isPending] = useActionState(createBudget, {
    errors: [],
    success: '',
  });

  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(BudgetFormSchema),
    defaultValues: {
      amount: 0,
      name: '',
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
      router.push('/admin');
    }
  }, [state.success, router]);

  const onCreateBudget = handleSubmit((formData) => {
    startTransition(() => dispatch(formData));
  });

  return (
    <form onSubmit={onCreateBudget} className="mt-10 space-y-3" noValidate>
      <BudgetForm register={register} errors={errors} />
      {isPending ? (
        <Loader className="text-center" />
      ) : (
        <input
          type="submit"
          className="bg-amber-500 w-full p-3 text-white uppercase font-bold hover:bg-amber-600 cursor-pointer transition-colors"
          value="Crear Presupuesto"
        />
      )}
    </form>
  );
};
