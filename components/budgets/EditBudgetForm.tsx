'use client';
import { startTransition, useActionState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';
import { BudgetForm } from './BudgetForm';
import { Budget, BudgetFormSchema } from '@/src/schemas';
import { Loader } from '../ui/Loader';
import { editBudget } from '@/actions';
import { Button } from '../ui/Button';

type EditBudgetFormProps = {
  budget: Budget;
};

export const EditBudgetForm: React.FC<EditBudgetFormProps> = ({ budget }) => {
  const [state, dispatch, isPending] = useActionState(editBudget, {
    errors: [],
    success: '',
  });

  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isReady },
  } = useForm({
    resolver: zodResolver(BudgetFormSchema),
    values: {
      amount: +budget.amount,
      name: budget.name,
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

  const onEditBudget = handleSubmit((formData) => {
    const payload = {
      budgetId: budget.id,
      ...formData,
    };
    startTransition(() => dispatch(payload));
  });

  return (
    <form onSubmit={onEditBudget} className="mt-10 space-y-3" noValidate>
      {!isReady ? (
        <Loader className="text-center" />
      ) : (
        <BudgetForm register={register} errors={errors} />
      )}

      <Button
        isLoading={isPending}
        variant="secondary"
        size="large"
        className="w-full"
      >
        Guardar cambios
      </Button>
    </form>
  );
};
