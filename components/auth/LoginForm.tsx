'use client';
import { startTransition, useActionState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';
import { authenticate } from '@/actions';
import { LoginSchema } from '@/src/schemas';
import { ErrorMessage } from '../ui/ErrorMessage';
import { Loader } from '../ui/Loader';

export const LoginForm: React.FC = () => {
  const [state, dispatch, pending] = useActionState(authenticate, {
    errors: [],
    success: '',
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(LoginSchema),
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
    <form onSubmit={onLogin} className="mt-14 space-y-5" noValidate>
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
        <label className="font-bold text-2xl">Password</label>

        <input
          type="password"
          placeholder="Password de Registro"
          className="w-full border border-gray-300 p-3 rounded-lg"
          {...register('password')}
        />
        {errors && errors.password && (
          <ErrorMessage>{errors.password.message}</ErrorMessage>
        )}
      </div>
      {pending ? (
        <Loader className="text-center" />
      ) : (
        <input
          type="submit"
          value="Iniciar Sesión"
          className="bg-purple-950 hover:bg-purple-800 w-full p-3 rounded-lg text-white font-black  text-xl cursor-pointer"
        />
      )}
    </form>
  );
};
