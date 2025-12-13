"use client";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

interface ActionState {
  errors?: string[];
  success?: string;
}

interface UseActionWithToastOptions {
  onSuccess?: () => void;
}

export const useActionWithToast = (
  state: ActionState,
  options?: UseActionWithToastOptions
) => {
  const prevStateRef = useRef<ActionState>(state);
  const onSuccessRef = useRef(options?.onSuccess);

  // Update ref when callback changes
  useEffect(() => {
    onSuccessRef.current = options?.onSuccess;
  }, [options?.onSuccess]);

  useEffect(() => {
    // Solo procesar si el estado cambió
    if (state === prevStateRef.current) return;

    if (state.errors && state.errors.length > 0) {
      state.errors.forEach((err) => {
        toast.error(err);
      });
    }

    if (state.success) {
      toast.success(state.success);
      onSuccessRef.current?.();
    }

    prevStateRef.current = state;
  }, [state]); // ✅ Solo depende de state
};
