'use client';
import { startTransition, useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { PinInput, PinInputField } from '@chakra-ui/pin-input';
import { confirmAccount } from '@/actions';

export const ConfirmAccountForm: React.FC = () => {
  const router = useRouter();

  const [state, dispatch] = useActionState(confirmAccount, {
    errors: [],
    success: '',
  });

  const handleComplete = (value: string) => {
    startTransition(() => {
      dispatch(value);
    });
  };

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
      toast.success(state.success);
    }
  }, [state.success, router]);

  return (
    <>
      <div className="flex justify-center gap-5 my-10">
        <PinInput onComplete={handleComplete}>
          <PinInputField className="w-10 h-10 border border-gray-300 shadow rounded-lg text-center" />
          <PinInputField className="w-10 h-10 border border-gray-300 shadow rounded-lg text-center" />
          <PinInputField className="w-10 h-10 border border-gray-300 shadow rounded-lg text-center" />
          <PinInputField className="w-10 h-10 border border-gray-300 shadow rounded-lg text-center" />
          <PinInputField className="w-10 h-10 border border-gray-300 shadow rounded-lg text-center" />
          <PinInputField className="w-10 h-10 border border-gray-300 shadow rounded-lg text-center" />
        </PinInput>
      </div>
    </>
  );
};
