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

export const ConfirmPasswordForm: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const budgetId = +searchParams.get('deleteBudgetId')!;

  const [state, dispatch] = useActionState(deleteBudget, {
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
      <DialogTitle as="h3" className="font-black text-4xl text-purple-950 my-5">
        Eliminar Presupuesto
      </DialogTitle>
      <p className="text-xl font-bold">
        Ingresa tu Password para {''}
        <span className="text-amber-500">eliminar el presupuesto {''}</span>
      </p>
      <p className="text-gray-600 text-sm">
        (Un presupuesto eliminado y sus gastos no se pueden recuperar)
      </p>
      <form className=" mt-14 space-y-5" onSubmit={onDeleteBudget} noValidate>
        <div className="flex flex-col gap-5">
          <label className="font-bold text-2xl" htmlFor="password">
            Ingresa tu Password para eliminar
          </label>
          <input
            id="password"
            type="password"
            placeholder="Password"
            className="w-full border border-gray-300 p-3 rounded-lg"
            {...register('password')}
          />
        </div>
        {errors && errors.password && (
          <ErrorMessage>{errors.password.message}</ErrorMessage>
        )}
        <div className="grid grid-cols-2 gap-5">
          <input
            type="submit"
            value="Eliminar Presupuesto"
            className="bg-purple-950 hover:bg-purple-800 w-full p-3 rounded-lg text-white font-black cursor-pointer transition-colors"
          />
          <button
            className="bg-amber-500 hover:bg-amber-600 w-full p-3 rounded-lg text-white font-black cursor-pointer transition-colors"
            onClick={closeModal}
          >
            Cancelar
          </button>
        </div>
      </form>
    </>
  );
};
