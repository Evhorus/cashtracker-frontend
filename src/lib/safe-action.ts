import { getTranslations } from "next-intl/server";

import { ApiError } from "./api-client";

export type ActionState<T = unknown> = {
  data?: T;
  errors?: string[]; // Mantener el array por retrocompatibilidad con useActionWithToast
  success?: string;
};

/**
 * Creates a safe Server Action that automatically catches errors and formats the response.
 */
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
      console.error("Action error:", error);

      if (error instanceof ApiError) {
        return {
          errors: [error.message],
          success: "",
        };
      }

      // Translated here rather than at the call site: every action
      // funnels through this one fallback, and it runs on the server
      // where getTranslations is available.
      const t = await getTranslations("errors");
      return {
        errors: [t("unexpected")],
        success: "",
      };
    }
  };
}
