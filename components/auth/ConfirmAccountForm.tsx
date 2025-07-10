'use client';
import { useState, startTransition, useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { PinInput, PinInputField } from '@chakra-ui/pin-input';
import { confirmAccount } from '@/actions';

type ConfirmAccountFormProps = {
  emailVerificationToken: string;
};

export const ConfirmAccountForm: React.FC<ConfirmAccountFormProps> = ({
  emailVerificationToken,
}: ConfirmAccountFormProps) => {
  const router = useRouter();
  const [pin, setPin] = useState(emailVerificationToken || '');
  const [autoSubmitted, setAutoSubmitted] = useState(false);

  const [state, dispatch, isPending] = useActionState(confirmAccount, {
    errors: [],
    success: '',
  });

  // Si el token viene en la URL y aún no se ha enviado, lo envía automáticamente
  useEffect(() => {
    if (
      emailVerificationToken &&
      emailVerificationToken.length === 6 &&
      !autoSubmitted
    ) {
      setAutoSubmitted(true);
      startTransition(() => {
        dispatch(emailVerificationToken);
      });
    }
  }, [emailVerificationToken, autoSubmitted, dispatch]);

  const handleComplete = (value: string) => {
    setPin(value);
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
        <PinInput
          onComplete={handleComplete}
          value={pin}
          onChange={setPin}
          isDisabled={isPending}
        >
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
