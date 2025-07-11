'use client';
import {
  Dispatch,
  SetStateAction,
  startTransition,
  useActionState,
  useEffect,
  useState,
} from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'react-toastify';
import { PinInput, PinInputField } from '@chakra-ui/pin-input';

import { validateToken } from '@/actions';

type ValidateTokenFormProps = {
  setIsValidToken: Dispatch<SetStateAction<boolean>>;
  setToken: Dispatch<SetStateAction<string>>;
};

export const ValidateTokenForm: React.FC<ValidateTokenFormProps> = ({
  setIsValidToken,
  setToken,
}) => {
  const searchParams = useSearchParams();
  const verificationToken = searchParams.get('verification_token') || '';
  const [pin, setPin] = useState(verificationToken);
  const [autoSubmitted, setAutoSubmitted] = useState(false);

  const [state, dispatch] = useActionState(validateToken, {
    errors: [],
    success: '',
  });

  // Si el token viene en la URL y aún no se ha enviado, lo envía automáticamente
  useEffect(() => {
    if (
      verificationToken &&
      verificationToken.length === 6 &&
      !autoSubmitted
    ) {
      setAutoSubmitted(true);
      setToken(verificationToken);
      startTransition(() => {
        dispatch(verificationToken);
      });
    }
  }, [verificationToken, autoSubmitted, dispatch, setToken]);

  const handleComplete = (value: string) => {
    setPin(value);
    setToken(value);
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
      toast.success(state.success);
      setIsValidToken(true);
    }
  }, [state.success, setIsValidToken]);

  return (
    <div className="flex justify-center gap-5 my-10">
      <PinInput
        onComplete={handleComplete}
        value={pin}
        onChange={setPin}
        isDisabled={autoSubmitted && !state.errors.length && !state.success}
      >
        <PinInputField className="h-10 w-10 text-center border border-gray-300 shadow rounded-lg" />
        <PinInputField className="h-10 w-10 text-center border border-gray-300 shadow rounded-lg" />
        <PinInputField className="h-10 w-10 text-center border border-gray-300 shadow rounded-lg" />
        <PinInputField className="h-10 w-10 text-center border border-gray-300 shadow rounded-lg" />
        <PinInputField className="h-10 w-10 text-center border border-gray-300 shadow rounded-lg" />
        <PinInputField className="h-10 w-10 text-center border border-gray-300 shadow rounded-lg" />
      </PinInput>
    </div>
  );
};
