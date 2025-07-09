'use client';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { DialogTitle } from '@headlessui/react';
import { startTransition, useActionState, useEffect } from 'react';
import { deleteBudget } from '@/actions';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PasswordValidationSchema } from '@/src/schemas';
import { ErrorMessage } from '../ui/ErrorMessage';
import { toast } from 'react-toastify';
import { Button } from '../ui/Button';

export const ConfirmPasswordForm: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const budgetId = +searchParams.get('deleteBudgetId')!;

  const [state, dispatch, isPending] = useActionState(deleteBudget, {
    errors: [],
    success: '',
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(PasswordValidationSchema),
    defaultValues: { password: '' },
  });

  const closeModal = () => {
    const hideModal = new URLSearchParams(searchParams.toString());
    hideModal.delete('deleteBudgetId');
    router.replace(`${pathname}?${hideModal}`);
  };

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

  const onDeleteBudget = handleSubmit((formData) => {
    const payload = {
      budgetId,
      password: formData.password,
    };
    startTransition(() => dispatch(payload));
  });

  return (
    <>
      <DialogTitle as="h3" className="font-black text-4xl text-purple-950">
        Eliminar Presupuesto
      </DialogTitle>
      <p className="text-xl font-bold">
        Ingresa tu Contraseña para {''}
        <span className="text-amber-500">eliminar el presupuesto {''}</span>
      </p>
      <p className="text-gray-600 text-sm">
        (Un presupuesto eliminado y sus gastos no se pueden recuperar)
      </p>
      <form className=" mt-10 space-y-5" onSubmit={onDeleteBudget} noValidate>
        <div className="flex flex-col gap-4">
          <label className="font-bold text-2xl" htmlFor="password">
            Ingresa tu Contraseña para eliminar
          </label>
          <input
            id="password"
            type="password"
            placeholder="Contraseña"
            className="w-full border border-gray-300 p-3 rounded-lg"
            {...register('password')}
          />
        </div>
        {errors && errors.password && (
          <ErrorMessage>{errors.password.message}</ErrorMessage>
        )}
        <div className="grid sm:grid-cols-2 gap-2">
          <Button type="submit" isLoading={isPending}>
            Eliminar Presupuesto
          </Button>
          <Button type="button" variant="secondary" onClick={closeModal}>
            Cancelar
          </Button>
        </div>
      </form>
    </>
  );
};
