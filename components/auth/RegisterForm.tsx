'use client';
import { startTransition, useActionState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerAction } from '@/actions';
import { ErrorMessage } from '../ui/ErrorMessage';
import { SuccessMessage } from '../ui/SuccessMessage';
import { RegisterSchema } from '@/src/schemas';

export const RegisterForm: React.FC = () => {
  
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

  const onRegister = handleSubmit((formData) => {
    startTransition(() => dispatch(formData));
  });

  return (
    <form className="mt-14 space-y-5" onSubmit={onRegister}>
      {state.errors.map((err, index) => (
        <ErrorMessage key={index}>{err}</ErrorMessage>
      ))}

      {state.success && <SuccessMessage>{state.success}</SuccessMessage>}

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
        <p>Cargando</p>
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
