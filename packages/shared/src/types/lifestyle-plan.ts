import { z } from 'zod';

export const PlanCategory = ['diet', 'exercise', 'stress', 'sleep', 'supplements'] as const;
export type PlanCategory = (typeof PlanCategory)[number];

export const PlanStatus = ['active', 'paused', 'completed', 'archived'] as const;
export type PlanStatus = (typeof PlanStatus)[number];

export const lifestylePlanSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  category: z.enum(PlanCategory),
  title: z.string(),
  description: z.string(),
  status: z.enum(PlanStatus),
  startDate: z.string().date(),
  endDate: z.string().date().nullable(),
  goals: z.array(z.string()),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type LifestylePlan = z.infer<typeof lifestylePlanSchema>;
