'use client';
import { startTransition, useActionState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';
import { authenticate } from '@/actions';
import { LoginFormSchema } from '@/src/schemas';
import { ErrorMessage } from '../ui/ErrorMessage';
import { LoadingButton } from '../ui/LoadingButton';

export const LoginForm: React.FC = () => {
  const [state, dispatch, isPending] = useActionState(authenticate, {
    errors: [],
    success: '',
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(LoginFormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    if (state.errors) {
      state.errors.forEach((err) => {
        toast.error(err);
      });
    }
  }, [state.errors]);

  const onLogin = handleSubmit((formData) => {
    startTransition(() => dispatch(formData));
  });

  return (
    <form onSubmit={onLogin} className="mt-14 space-y-4" noValidate>
      <div className="flex flex-col gap-2">
        <label className="font-bold text-2xl">Email</label>

        <input
          id="email"
          type="email"
          placeholder="Email de Registro"
          className="w-full border border-gray-300 p-3 rounded-lg"
          {...register('email')}
        />
        {errors && errors.email && (
          <ErrorMessage>{errors.email.message}</ErrorMessage>
        )}
      </div>

      <div className="flex flex-col gap-2">
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
      <LoadingButton isLoading={isPending}>Iniciar Sesión</LoadingButton>
    </form>
  );
};
