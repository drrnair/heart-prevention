import { z } from 'zod';

export const healthAssessmentSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  assessedAt: z.string().datetime(),
  systolicBp: z.number().int().min(60).max(300),
  diastolicBp: z.number().int().min(30).max(200),
  pulseRate: z.number().int().min(30).max(250).nullable(),
  heightCm: z.number().min(50).max(300),
  weightKg: z.number().min(10).max(500),
  waistCm: z.number().min(30).max(250).nullable(),
  hipCm: z.number().min(30).max(250).nullable(),
  bmi: z.number().min(5).max(100),
  waistToHip: z.number().min(0).max(3).nullable(),
  waistToHeight: z.number().min(0).max(3).nullable(),
  notes: z.string().nullable(),
  createdAt: z.string().datetime(),
});

export type HealthAssessment = z.infer<typeof healthAssessmentSchema>;
