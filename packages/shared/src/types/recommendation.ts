import { z } from 'zod';

// ── Test codes ──────────────────────────────────────────────────────

export const TestCode = [
  'lipid_panel',
  'lpa',
  'apob',
  'hba1c',
  'hs_crp',
  'cac_score',
  'ctca',
  'abi',
  'fasting_glucose',
  'egfr',
  'advanced_lipid_panel',
  'homocysteine',
  'nt_pro_bnp',
  'tsh',
  'vitamin_d',
  'cbc',
  'hepatic_panel',
  'renal_panel',
  'fasting_insulin',
  'uric_acid',
  'carotid_ultrasound',
  'echocardiogram',
] as const;
export type TestCode = (typeof TestCode)[number];

// ── Test categories ─────────────────────────────────────────────────

export const TestCategory = [
  'basic_labs',
  'extended_lipids',
  'inflammatory',
  'metabolic',
  'imaging',
] as const;
export type TestCategory = (typeof TestCategory)[number];

// ── Recommendation tier (maps to data levels) ──────────────────────

export const RecommendationTier = [1, 2, 3, 4] as const;
export type RecommendationTier = (typeof RecommendationTier)[number];

// ── Priority ────────────────────────────────────────────────────────

export const RecommendationPriority = ['routine', 'recommended', 'strongly_recommended'] as const;
export type RecommendationPriority = (typeof RecommendationPriority)[number];

// ── Status ──────────────────────────────────────────────────────────

export const RecommendationStatus = ['pending', 'scheduled', 'completed', 'declined', 'snoozed'] as const;
export type RecommendationStatus = (typeof RecommendationStatus)[number];

// ── Investigation recommendation schema ─────────────────────────────

export const investigationRecommendationSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  testCode: z.enum(TestCode),
  testCategory: z.enum(TestCategory),
  tier: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
  priority: z.enum(RecommendationPriority),
  status: z.enum(RecommendationStatus),
  rationale: z.string(),
  suggestedBy: z.string().datetime().nullable().optional(),
  completedAt: z.string().datetime().nullable().optional(),
  snoozedUntil: z.string().datetime().nullable().optional(),
  createdAt: z.string().datetime(),
});

export type InvestigationRecommendation = z.infer<typeof investigationRecommendationSchema>;
