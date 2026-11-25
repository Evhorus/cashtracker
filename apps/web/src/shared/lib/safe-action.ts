import { unstable_rethrow } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { ApiError } from "./api-client";

export type ActionState<T = unknown> = {
  data?: T;
  errors?: string[]; // Kept as an array for compatibility with useActionWithToast
  success?: string;
};

export function createSafeAction<TPayload, TResult>(
  handler: (
    payload: TPayload,
  ) => Promise<{ data?: TResult; successMessage?: string }>,
) {
  return async (
    _prevState: ActionState<TResult>,
    payload: TPayload,
  ): Promise<ActionState<TResult>> => {
    try {
      const result = await handler(payload);
      return {
        data: result.data,
        success: result.successMessage,
        errors: [],
      };
    } catch (error) {
      // Let Next.js control-flow errors (e.g. redirect() / notFound() from
      // auth.protect()) propagate instead of turning them into a generic toast.
      unstable_rethrow(error);

      console.error("Action error:", error);

      if (error instanceof ApiError) {
        return {
          errors: [error.message],
          success: "",
        };
      }

      const t = await getTranslations("errors");
      return {
        errors: [t("unexpected")],
        success: "",
      };
    }
  };
}
