import { ApiError } from './api-client';

export type ActionState<T = any> = {
  data?: T;
  errors?: string[]; // Mantener el array por retrocompatibilidad con useActionWithToast
  success?: string;
};

/**
 * Creates a safe Server Action that automatically catches errors and formats the response.
 */
export function createSafeAction<TPayload, TResult>(
  handler: (payload: TPayload) => Promise<{ data?: TResult; successMessage?: string }>
) {
  return async (
    _prevState: ActionState<TResult>,
    payload: TPayload
  ): Promise<ActionState<TResult>> => {
    try {
      const result = await handler(payload);
      return { 
        data: result.data, 
        success: result.successMessage,
        errors: []
      };
    } catch (error) {
      console.error('Action error:', error);
      
      if (error instanceof ApiError) {
        return { 
          errors: [error.message],
          success: ''
        };
      }
      
      return { 
        errors: ['Ocurrió un error inesperado. Por favor, intenta de nuevo.'],
        success: ''
      };
    }
  };
}
