"use client";

import { startTransition, useActionState } from "react";
import { useRouter } from "next/navigation";
import { useActionWithToast } from "@/hooks/useActionWithToast";

interface ActionState {
  errors?: string[];
  success?: string;
}

interface UseActionDialogOptions<State extends ActionState> {
  setOpen?: (open: boolean) => void;
  onSuccess?: (state: State) => void;
  refreshOnSuccess?: boolean;
}

/**
 * Reusable helper for dialogs that submit a server action and need
 * common success/error handling without coupling to a specific form.
 *
 * @template State The action state shape, typically containing success/errors.
 * @template Payload The payload passed to the server action, such as form values.
 * @param action A server action that accepts the previous state and a payload.
 * @param initialState The initial state used by the action.
 * @param options Optional dialog behaviors such as closing the modal or refreshing the route.
 * @returns An object with the current state, a dispatch helper, and the pending flag.
 */
export const useActionDialog = <State extends ActionState, Payload>(
  action: (prevState: State, payload: Payload) => Promise<State> | State,
  initialState: State,
  options?: UseActionDialogOptions<State>,
) => {
  const router = useRouter();

  const [state, dispatch, isPending] = useActionState(
    async (prevState: Awaited<State>, payload: Payload) =>
      action(prevState as State, payload),
    initialState as Awaited<State>,
  );

  useActionWithToast(state, {
    onSuccess: () => {
      // Close the dialog after a successful mutation.
      options?.setOpen?.(false);
      options?.onSuccess?.(state);

      // Refresh the current route so the UI stays in sync.
      if (options?.refreshOnSuccess !== false) {
        router.refresh();
      }
    },
  });

  const submit = (payload: Payload) => {
    startTransition(() => {
      dispatch(payload);
    });
  };

  return {
    state,
    dispatch: submit,
    isPending,
  };
};
