"use client";

import { startTransition, useActionState } from "react";
import { useRouter } from "next/navigation";

import { useActionWithToast } from "@/shared/hooks/use-action-with-toast";
import type { ActionState } from "@/shared/lib/safe-action";

interface UseActionDialogOptions<State extends ActionState> {
  setOpen?: (open: boolean) => void;
  onSuccess?: (state: State) => void;
  refreshOnSuccess?: boolean;
}

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
      options?.setOpen?.(false);
      options?.onSuccess?.(state);

      // Write Server Actions already call refreshDashboard(); extra refresh is opt-in.
      if (options?.refreshOnSuccess === true) {
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
