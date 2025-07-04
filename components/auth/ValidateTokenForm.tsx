'use client';
import {
  Dispatch,
  SetStateAction,
  startTransition,
  useActionState,
  useEffect,
} from 'react';
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
  const [state, dispatch] = useActionState(validateToken, {
    errors: [],
    success: '',
  });

  const handleComplete = (value: string) => {
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
      <PinInput onComplete={handleComplete}>
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
