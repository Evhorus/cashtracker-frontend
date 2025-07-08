'use client';
import { startTransition, useActionState, useEffect } from 'react';
import { UpdateProfileFormSchema, User } from '@/src/schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { ErrorMessage } from '../ui/ErrorMessage';
import { Loader } from '../ui/Loader';
import { updateUser } from '@/actions';
import { LoadingButton } from '../ui/LoadingButton';

type ProfileFormProps = {
  user: User;
};

export const ProfileForm: React.FC<ProfileFormProps> = ({ user }) => {
  const [state, dispatch, isPending] = useActionState(updateUser, {
    errors: [],
    success: '',
  });
  const {
    register,
    handleSubmit,
    formState: { errors, isReady },
  } = useForm({
    resolver: zodResolver(UpdateProfileFormSchema),
    values: {
      name: user.name,
      email: user.email,
    },
  });

  useEffect(() => {
    if (state.errors) {
      state.errors.forEach((err) => {
        toast.error(err);
      });
    }
  }, [state]);

  useEffect(() => {
    if (state.success) {
      toast.success(state.success);

      console.log('lanzar');
    }
  }, [state]);

  const onUpdateProfile = handleSubmit((data) => {
    startTransition(() => dispatch(data));
  });

  return (
    <>
      {!isReady ? (
        <Loader className="text-center" />
      ) : (
        <form
          onSubmit={onUpdateProfile}
          className=" mt-14 space-y-5"
          noValidate
        >
          <div className="flex flex-col gap-5">
            <label className="font-bold text-2xl">Nombre</label>
            <input
              type="name"
              placeholder="Tu Nombre"
              className="w-full border border-gray-300 p-3 rounded-lg"
              {...register('name')}
            />
            {errors && errors.name && (
              <ErrorMessage>{errors.name.message}</ErrorMessage>
            )}
          </div>
          <div className="flex flex-col gap-5">
            <label className="font-bold text-2xl">Email</label>

            <input
              id="email"
              type="email"
              placeholder="Tu Email"
              className="w-full border border-gray-300 p-3 rounded-lg"
              {...register('email')}
            />
            {errors && errors.email && (
              <ErrorMessage>{errors.email.message}</ErrorMessage>
            )}
          </div>

          <LoadingButton isLoading={isPending}>Guardar Cambios</LoadingButton>
        </form>
      )}
    </>
  );
};
