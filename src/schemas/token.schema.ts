import { z } from 'zod';

export const TokenSchema = z.string({ message: 'Token no válido' }).length(6, { message: 'Token no válido' });