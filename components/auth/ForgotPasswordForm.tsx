'use client';
import { startTransition, useActionState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { ErrorMessage } from '../ui/ErrorMessage';
import { forgotPassword } from '@/actions';
import { ForgotPasswordFormSchema } from '@/src/schemas';
import { LoadingButton } from '../ui/LoadingButton';
import { SuccessMessageCard } from './AccountCreatedCard';

export const ForgotPasswordForm: React.FC = () => {
  const [state, dispatch, isPending] = useActionState(forgotPassword, {
    errors: [],
    success: '',
  });
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(ForgotPasswordFormSchema),
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
    <>
      {state.success ? (
        <SuccessMessageCard
          title="¡Revisa tu correo!"
          message={
            <>
              Te hemos enviado un enlace para restablecer tu contraseña.
              <br />
              Por favor, revisa tu email y sigue las instrucciones para crear
              una nueva contraseña.
            </>
          }
          linkHref="/auth/login"
          linkText="Volver a Iniciar Sesión"
        />
      ) : (
        <form
          onSubmit={onForgotPassword}
          className=" mt-14 space-y-5"
          noValidate
        >
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

          <LoadingButton isLoading={isPending}>
            Enviar Instrucciones
          </LoadingButton>
        </form>
      )}
    </>
  );
};
