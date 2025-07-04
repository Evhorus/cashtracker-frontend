'use client';
import { startTransition, useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';
import { registerAction } from '@/actions';
import { ErrorMessage } from '../ui/ErrorMessage';
import { RegisterSchema } from '@/src/schemas';
import { Loader } from '../ui/Loader';

export const RegisterForm: React.FC = () => {
  const router = useRouter();

  const [state, dispatch, pending] = useActionState(registerAction, {
    errors: [],
    success: '',
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      email: '',
      name: '',
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
      router.push('/auth/login');
    }
  }, [state.success, router]);

  const onRegister = handleSubmit((formData) => {
    startTransition(() => dispatch(formData));
  });

  return (
    <form className="mt-14 space-y-5" onSubmit={onRegister}>
      <div className="flex flex-col gap-2">
        <label className="font-bold text-2xl" htmlFor="email">
          Email
        </label>
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
        <label className="font-bold text-2xl" htmlFor="name">
          Nombre
        </label>
        <input
          type="name"
          placeholder="Nombre de Registro"
          className="w-full border border-gray-300 p-3 rounded-lg"
          {...register('name')}
        />
        {errors && errors.name && (
          <ErrorMessage>{errors.name.message}</ErrorMessage>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label className="font-bold text-2xl" htmlFor="password">
          Password
        </label>
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

      <div className="flex flex-col gap-2">
        <label className="font-bold text-2xl" htmlFor="passwordConfirmation">
          Repetir Password
        </label>
        <input
          id="passwordConfirmation"
          type="password"
          placeholder="Repite Password de Registro"
          className="w-full border border-gray-300 p-3 rounded-lg"
          {...register('passwordConfirmation')}
        />
        {errors && errors.passwordConfirmation && (
          <ErrorMessage>{errors.passwordConfirmation.message}</ErrorMessage>
        )}
      </div>

      {pending ? (
        <Loader className="text-center" />
      ) : (
        <input
          type="submit"
          value="Registrarme"
          className="bg-purple-950 hover:bg-purple-800 w-full p-3 rounded-lg text-white font-black  text-xl cursor-pointer block"
        />
      )}
    </form>
  );
};
