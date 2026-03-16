import { z } from 'zod';

export const MoodLevel = ['very_low', 'low', 'neutral', 'good', 'great'] as const;
export type MoodLevel = (typeof MoodLevel)[number];

export const weeklyCheckinSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  weekStarting: z.string().date(),
  moodLevel: z.enum(MoodLevel).nullable(),
  exerciseMinutes: z.number().int().min(0).nullable(),
  sleepHoursAvg: z.number().min(0).max(24).nullable(),
  stressLevel: z.number().int().min(1).max(10).nullable(),
  medicationAdherence: z.number().min(0).max(100).nullable(),
  notes: z.string().nullable(),
  createdAt: z.string().datetime(),
});

export type WeeklyCheckin = z.infer<typeof weeklyCheckinSchema>;
