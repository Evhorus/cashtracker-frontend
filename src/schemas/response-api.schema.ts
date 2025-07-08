import { z } from 'zod';

export const SuccessResponseSchema = z.string().min(1, { message: 'Valor no válido.' });

export const ErrorResponseSchema = z.object({
  error: z.string(),
});
