'use client';
import { startTransition, useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ErrorMessage } from '../ui/ErrorMessage';
import { resetPassword } from '@/actions';
import { ResetPasswordFormSchema } from '@/src/schemas';
import { LoadingButton } from '../ui/LoadingButton';

type ResetPasswordFormProps = {
  token: string;
};

export const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({
  token,
}) => {
  const [state, dispatch, isPending] = useActionState(resetPassword, {
    errors: [],
    success: '',
  });
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(ResetPasswordFormSchema),
    defaultValues: {
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
      router.push('/auth/login');
    }
  }, [state.success, router]);

  const onResetPassword = handleSubmit((formData) => {
    const payload = { ...formData, token };

    startTransition(() => dispatch(payload));
  });
  return (
    <form onSubmit={onResetPassword} className=" mt-14 space-y-5" noValidate>
      <div className="flex flex-col gap-5">
        <label className="font-bold text-2xl">Contraseña</label>

        <input
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
        <label className="font-bold text-2xl">Repetir Contraseña</label>

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

      <LoadingButton isLoading={isPending}>Guardar Contraseña</LoadingButton>
    </form>
  );
};
