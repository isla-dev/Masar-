import { z } from 'zod';

export const initiateCheckoutSchema = z.object({
  paymentMethod: z.enum(['cib', 'edahabia']),
});

export type InitiateCheckoutInput = z.infer<typeof initiateCheckoutSchema>;
