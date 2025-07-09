'use client';
import { startTransition, useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';
import { createBudget } from '@/actions';
import { BudgetFormSchema } from '@/src/schemas';
import { BudgetForm } from './BudgetForm';
import { Button } from '../ui/Button';

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

      <Button isLoading={isPending} variant="secondary" className="w-full">
        Crear Presupuesto
      </Button>
    </form>
  );
};
