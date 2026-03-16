import { z } from 'zod';

// ── Data level (determines which risk algorithms are usable) ────────

export const DataLevel = [1, 2, 3, 4] as const;
export type DataLevel = (typeof DataLevel)[number];

// ── Score type ──────────────────────────────────────────────────────

export const ScoreType = [
  'ascvd_pce_10yr',
  'ascvd_pce_lifetime',
  'framingham_10yr',
  'score2_10yr',
  'score2_op_10yr',
] as const;
export type ScoreType = (typeof ScoreType)[number];

// ── Risk category ───────────────────────────────────────────────────

export const RiskCategory = ['low', 'borderline', 'intermediate', 'high'] as const;
export type RiskCategory = (typeof RiskCategory)[number];

// ── Risk score schema ───────────────────────────────────────────────

export const riskScoreSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  scoreType: z.enum(ScoreType),
  dataLevel: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
  scoreValue: z.number().min(0).max(100),
  riskCategory: z.enum(RiskCategory),
  inputSnapshot: z.record(z.string(), z.unknown()),
  calculatedAt: z.string().datetime(),
  validUntil: z.string().datetime().nullable(),
  notes: z.string().nullable().optional(),
  createdAt: z.string().datetime(),
});

export type RiskScore = z.infer<typeof riskScoreSchema>;
