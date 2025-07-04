'use client';
import { startTransition, useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ErrorMessage } from '../ui/ErrorMessage';
import { resetPassword } from '@/actions';
import { ResetPasswordSchema } from '@/src/schemas';


type ResetPasswordFormProps = {
  token: string;
};

export const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({
  token,
}) => {
  const router = useRouter();
  const [state, dispatch, pending] = useActionState(resetPassword, {
    errors: [],
    success: '',
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(ResetPasswordSchema),
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
      toast.success(state.success, {
        onClose: () => router.push('/auth/login'),
        onClick: () => router.push('/auth/login'),
      });
    }
  }, [state.success, router]);

  const onResetPassword = handleSubmit((formData) => {
    const payload = { ...formData, token };

    startTransition(() => dispatch(payload));
  });
  return (
    <form onSubmit={onResetPassword} className=" mt-14 space-y-5" noValidate>
      <div className="flex flex-col gap-5">
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

      <div className="flex flex-col gap-5">
        <label className="font-bold text-2xl">Repetir Password</label>

        <input
          id="password_confirmation"
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
          value="Guardar Password"
          className="bg-purple-950 hover:bg-purple-800 w-full p-3 rounded-lg text-white font-black  text-xl cursor-pointer block"
        />
      )}
    </form>
  );
};
