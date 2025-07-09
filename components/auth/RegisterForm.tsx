'use client';
import { startTransition, useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';
import { registerAction } from '@/actions';
import { ErrorMessage } from '../ui/ErrorMessage';
import { RegisterFormSchema } from '@/src/schemas';
import { SuccessMessageCard } from './AccountCreatedCard';
import { Button } from '../ui/Button';

export const RegisterForm: React.FC = () => {
  const [state, dispatch, isPending] = useActionState(registerAction, {
    errors: [],
    success: '',
  });
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(RegisterFormSchema),
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
      toast.success(state.success);
    }
  }, [state.success, router]);

  const onRegister = handleSubmit((formData) => {
    startTransition(() => dispatch(formData));
  });

  return (
    <>
      {state.success ? (
        <SuccessMessageCard
          title="¡Cuenta creada con éxito!"
          message={
            <>
              Hemos enviado un correo electrónico a la dirección proporcionada.
              <br />
              Por favor, revisa tu email para confirmar o activar tu cuenta.
            </>
          }
          linkHref="/auth/login"
          linkText="Ir a Iniciar Sesión"
        />
      ) : (
        <form className="mt-14 space-y-4" onSubmit={onRegister}>
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
              Contraseña
            </label>
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

          <div className="flex flex-col gap-2">
            <label
              className="font-bold text-2xl"
              htmlFor="passwordConfirmation"
            >
              Repetir Contraseña
            </label>
            <input
              id="passwordConfirmation"
              type="password"
              placeholder="Repite Contraseña de Registro"
              className="w-full border border-gray-300 p-3 rounded-lg"
              {...register('passwordConfirmation')}
            />
            {errors && errors.passwordConfirmation && (
              <ErrorMessage>{errors.passwordConfirmation.message}</ErrorMessage>
            )}
          </div>

          <Button isLoading={isPending} className="w-full">Registrarme</Button>
        </form>
      )}
    </>
  );
};
