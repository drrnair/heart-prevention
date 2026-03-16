import { z } from 'zod';

// ── Enum-like const unions ──────────────────────────────────────────

export const ImagingType = ['cac_score', 'ctca', 'carotid_ultrasound'] as const;
export type ImagingType = (typeof ImagingType)[number];

export const CacRiskCategory = ['zero', 'low', 'moderate', 'moderately_high', 'high'] as const;
export type CacRiskCategory = (typeof CacRiskCategory)[number];

export const CadRadsScore = ['0', '1', '2', '3', '4A', '4B', '5', 'N'] as const;
export type CadRadsScore = (typeof CadRadsScore)[number];

export const StenosisGrade = ['none', 'minimal', 'mild', 'moderate', 'severe', 'occluded'] as const;
export type StenosisGrade = (typeof StenosisGrade)[number];

export const PlaqueType = ['calcified', 'non_calcified', 'mixed'] as const;
export type PlaqueType = (typeof PlaqueType)[number];

// ── 18-segment AHA model ────────────────────────────────────────────

export const AhaSegment = [
  '1', '2', '3', '4', '5', '6', '7', '8', '9',
  '10', '11', '12', '13', '14', '15', '16', '17', '18',
] as const;
export type AhaSegment = (typeof AhaSegment)[number];

export const segmentFindingSchema = z.object({
  segment: z.enum(AhaSegment),
  stenosisGrade: z.enum(StenosisGrade),
  plaqueType: z.enum(PlaqueType).nullable(),
  notes: z.string().nullable().optional(),
});

export type SegmentFinding = z.infer<typeof segmentFindingSchema>;

// ── Per-vessel Agatston scores ──────────────────────────────────────

export const vesselAgatstonSchema = z.object({
  lm: z.number().min(0).nullable(),
  lad: z.number().min(0).nullable(),
  lcx: z.number().min(0).nullable(),
  rca: z.number().min(0).nullable(),
  total: z.number().min(0),
});

export type VesselAgatston = z.infer<typeof vesselAgatstonSchema>;

// ── High-risk plaque features ───────────────────────────────────────

export const highRiskPlaqueSchema = z.object({
  lowAttenuationPlaque: z.boolean(),
  positiveRemodeling: z.boolean(),
  napkinRingSign: z.boolean(),
  spottyCalcification: z.boolean(),
});

export type HighRiskPlaque = z.infer<typeof highRiskPlaqueSchema>;

// ── Imaging result schema ───────────────────────────────────────────

export const imagingResultSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  imagingType: z.enum(ImagingType),
  performedAt: z.string().datetime(),
  facility: z.string().nullable().optional(),

  // ── CAC fields ────────────────────────────────────────────────
  agatstonScores: vesselAgatstonSchema.nullable().optional(),
  cacPercentile: z.number().min(0).max(100).nullable().optional(),
  cacRiskCategory: z.enum(CacRiskCategory).nullable().optional(),

  // ── CTCA fields ───────────────────────────────────────────────
  cadRadsScore: z.enum(CadRadsScore).nullable().optional(),
  highRiskPlaque: highRiskPlaqueSchema.nullable().optional(),
  segmentFindings: z.array(segmentFindingSchema).nullable().optional(),
  lvef: z.number().min(0).max(100).nullable().optional(),

  // ── Carotid ultrasound fields ─────────────────────────────────
  leftCcaImt: z.number().nullable().optional(),
  rightCcaImt: z.number().nullable().optional(),
  plaquePresent: z.boolean().nullable().optional(),

  notes: z.string().nullable().optional(),
  createdAt: z.string().datetime(),
});

export type ImagingResult = z.infer<typeof imagingResultSchema>;
