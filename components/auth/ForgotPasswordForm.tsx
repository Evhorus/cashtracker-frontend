'use client';
import { startTransition, useActionState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { ErrorMessage } from '../ui/ErrorMessage';
import { forgotPassword } from '@/actions';
import { ForgotPasswordSchema } from '@/src/schemas';
import { Loader } from '../ui/Loader';

export const ForgotPasswordForm: React.FC = () => {
  const [state, dispatch, pending] = useActionState(forgotPassword, {
    errors: [],
    success: '',
  });
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(ForgotPasswordSchema),
    defaultValues: {
      email: '',
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
    }
  }, [state.success]);

  const onForgotPassword = handleSubmit((formData) => {
    startTransition(() => dispatch(formData));
  });

  return (
    <form onSubmit={onForgotPassword} className=" mt-14 space-y-5" noValidate>
      {state.errors.map((err, index) => (
        <ErrorMessage key={index}>{err}</ErrorMessage>
      ))}
      <div className="flex flex-col gap-2 mb-10">
        <label className="font-bold text-2xl" htmlFor="email">
          Email
        </label>

        <input
          type="email"
          placeholder="Email de Registro"
          className="w-full border border-gray-300 p-3 rounded-lg"
          {...register('email')}
        />
        {errors && errors.email && (
          <ErrorMessage>{errors.email.message}</ErrorMessage>
        )}
      </div>

      {pending ? (
        <Loader className="text-center" />
      ) : (
        <input
          type="submit"
          value="Enviar Instrucciones"
          className="bg-purple-950 hover:bg-purple-800 w-full p-3 rounded-lg text-white font-black  text-xl cursor-pointer "
        />
      )}
    </form>
  );
};
