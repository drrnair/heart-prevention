import { z } from 'zod';

export const SupplementStatus = ['active', 'paused', 'stopped'] as const;
export type SupplementStatus = (typeof SupplementStatus)[number];

export const supplementSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  name: z.string(),
  dosage: z.string(),
  frequency: z.string(),
  status: z.enum(SupplementStatus),
  reason: z.string().nullable(),
  startedAt: z.string().date(),
  stoppedAt: z.string().date().nullable(),
  createdAt: z.string().datetime(),
});

export type Supplement = z.infer<typeof supplementSchema>;
