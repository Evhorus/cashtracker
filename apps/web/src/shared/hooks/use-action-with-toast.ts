"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";

import type { ActionState } from "@/shared/lib/safe-action";

interface UseActionWithToastOptions {
  onSuccess?: () => void;
}

export const useActionWithToast = (
  state: ActionState,
  options?: UseActionWithToastOptions,
) => {
  const prevStateRef = useRef<ActionState>(state);
  const onSuccessRef = useRef(options?.onSuccess);

  useEffect(() => {
    onSuccessRef.current = options?.onSuccess;
  }, [options?.onSuccess]);

  useEffect(() => {
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
  }, [state]);
};
