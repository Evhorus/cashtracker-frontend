'use client';
import { startTransition, useActionState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UpdatePasswordFormSchema } from '@/src/schemas';
import { ErrorMessage } from '../ui/ErrorMessage';
import { updatePassword } from '@/actions';
import { toast } from 'react-toastify';
import { Button } from '../ui/Button';
import { useRouter } from 'next/navigation';

type ChangePasswordFormProps = {
  register: string;
  errors: string;
};

export const ChangePasswordForm: React.FC<ChangePasswordFormProps> = () => {
  const router = useRouter();
  const [state, dispatch, isPending] = useActionState(updatePassword, {
    errors: [],
    success: '',
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(UpdatePasswordFormSchema),
    defaultValues: {
      currentPassword: '',
      password: '',
      passwordConfirmation: '',
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.success]);

  const onUpdatePassword = handleSubmit((data) => {
    startTransition(() => dispatch(data));
  });

  return (
    <>
      <form onSubmit={onUpdatePassword} className=" mt-14 space-y-5" noValidate>
        <div className="flex flex-col gap-5">
          <label className="font-bold text-2xl" htmlFor="current_password">
            Contraseña Actual
          </label>
          <input
            id="current_password"
            type="password"
            placeholder="Password Actual"
            className="w-full border border-gray-300 p-3 rounded-lg"
            {...register('currentPassword')}
          />
          {errors && errors.currentPassword && (
            <ErrorMessage>{errors.currentPassword.message}</ErrorMessage>
          )}
        </div>
        <div className="flex flex-col gap-5">
          <label className="font-bold text-2xl" htmlFor="password">
            Nueva Contraseña
          </label>
          <input
            id="password"
            type="password"
            placeholder="Contraseña de Registro"
            className="w-full border border-gray-300 p-3 rounded-lg"
            {...register('password')}
          />
          {errors && errors.password && (
            <ErrorMessage>{errors.password.message}</ErrorMessage>
          )}
        </div>
        <div className="flex flex-col gap-5">
          <label htmlFor="password_confirmation" className="font-bold text-2xl">
            Repetir Contraseña
          </label>

          <input
            id="password_confirmation"
            type="password"
            placeholder="Repite Contraseña de Registro"
            className="w-full border border-gray-300 p-3 rounded-lg"
            {...register('passwordConfirmation')}
          />
          {errors && errors.passwordConfirmation && (
            <ErrorMessage>{errors.passwordConfirmation.message}</ErrorMessage>
          )}
        </div>
        <Button isLoading={isPending}>Cambiar Contraseña</Button>
      </form>
    </>
  );
};
