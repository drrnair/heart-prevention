/**
 * Imaging result input validators.
 *
 * Validates data for CAC scores, CTCA (CT coronary angiography),
 * and carotid ultrasound results.
 */

import { z } from 'zod';
import {
  ImagingType,
  CacRiskCategory,
  CadRadsScore,
  StenosisGrade,
  PlaqueType,
  AhaSegment,
} from '../types/imaging';

// ── Sub-schemas ────────────────────────────────────────────────────────

/** Segment-level CTCA finding input. */
export const segmentFindingInputSchema = z.object({
  segment: z.enum(AhaSegment),
  stenosisGrade: z.enum(StenosisGrade),
  plaqueType: z.enum(PlaqueType).nullable().optional(),
  notes: z.string().max(500).nullable().optional(),
});

/** Per-vessel Agatston score input. */
export const vesselAgatstonInputSchema = z.object({
  lm: z.number().min(0, 'LM score cannot be negative').max(10000).nullable().optional(),
  lad: z.number().min(0, 'LAD score cannot be negative').max(10000).nullable().optional(),
  lcx: z.number().min(0, 'LCx score cannot be negative').max(10000).nullable().optional(),
  rca: z.number().min(0, 'RCA score cannot be negative').max(10000).nullable().optional(),
  total: z
    .number()
    .min(0, 'Total Agatston score cannot be negative')
    .max(10000, 'Total Agatston score must be at most 10000'),
});

/** High-risk plaque feature flags. */
export const highRiskPlaqueInputSchema = z.object({
  lowAttenuationPlaque: z.boolean(),
  positiveRemodeling: z.boolean(),
  napkinRingSign: z.boolean(),
  spottyCalcification: z.boolean(),
});

// ── Main imaging input schema ──────────────────────────────────────────

/**
 * Schema for creating a new imaging result.
 *
 * Conditionally validates fields based on `imagingType`:
 * - `cac_score`: requires `agatstonScores`
 * - `ctca`: expects `cadRadsScore`, `segmentFindings`, optionally `lvef`
 * - `carotid_ultrasound`: expects IMT measurements
 */
export const imagingInputSchema = z
  .object({
    imagingType: z.enum(ImagingType),
    performedAt: z.string().datetime(),
    facility: z.string().max(200).nullable().optional(),

    // ── CAC fields ──────────────────────────────────────────────
    agatstonScores: vesselAgatstonInputSchema.nullable().optional(),
    cacPercentile: z
      .number()
      .min(0, 'CAC percentile must be between 0 and 100')
      .max(100, 'CAC percentile must be between 0 and 100')
      .nullable()
      .optional(),
    cacRiskCategory: z.enum(CacRiskCategory).nullable().optional(),

    // ── CTCA fields ─────────────────────────────────────────────
    cadRadsScore: z.enum(CadRadsScore).nullable().optional(),
    highRiskPlaque: highRiskPlaqueInputSchema.nullable().optional(),
    segmentFindings: z.array(segmentFindingInputSchema).max(18).nullable().optional(),
    lvef: z
      .number()
      .min(10, 'LVEF must be at least 10%')
      .max(85, 'LVEF must be at most 85%')
      .nullable()
      .optional(),

    // ── Carotid ultrasound fields ───────────────────────────────
    leftCcaImt: z
      .number()
      .min(0.1, 'Left CCA IMT must be at least 0.1 mm')
      .max(5.0, 'Left CCA IMT must be at most 5.0 mm')
      .nullable()
      .optional(),
    rightCcaImt: z
      .number()
      .min(0.1, 'Right CCA IMT must be at least 0.1 mm')
      .max(5.0, 'Right CCA IMT must be at most 5.0 mm')
      .nullable()
      .optional(),
    plaquePresent: z.boolean().nullable().optional(),

    notes: z.string().max(2000).nullable().optional(),
  })
  .superRefine((data, ctx) => {
    // CAC score must have total Agatston
    if (data.imagingType === 'cac_score' && data.agatstonScores == null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Agatston scores are required for CAC score imaging',
        path: ['agatstonScores'],
      });
    }

    // Validate vessel scores sum roughly to total (if all vessels provided)
    if (data.agatstonScores != null) {
      const scores = data.agatstonScores;
      if (scores.lm != null && scores.lad != null && scores.lcx != null && scores.rca != null) {
        const sumParts = scores.lm + scores.lad + scores.lcx + scores.rca;
        if (Math.abs(sumParts - scores.total) > 5) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Vessel scores (${sumParts}) do not sum to total (${scores.total})`,
            path: ['agatstonScores', 'total'],
          });
        }
      }
    }
  });

export type ImagingInput = z.infer<typeof imagingInputSchema>;

// ── CAC score interpretation helpers ───────────────────────────────────

/**
 * Classify a CAC (Agatston) score into a risk category.
 *
 * Based on SCCT guidelines:
 * - 0: No calcification
 * - 1-10: Minimal
 * - 11-100: Mild
 * - 101-400: Moderate
 * - >400: Severe
 *
 * @param score - Total Agatston score.
 * @returns CAC risk category.
 */
export function classifyCacScore(score: number): {
  category: string;
  description: string;
  riskLevel: 'zero' | 'low' | 'moderate' | 'moderately_high' | 'high';
} {
  if (score === 0) {
    return {
      category: 'No calcification',
      description: 'No identifiable coronary calcium. Very low short-term risk.',
      riskLevel: 'zero',
    };
  }
  if (score <= 10) {
    return {
      category: 'Minimal calcification',
      description: 'Minimal identifiable coronary calcium.',
      riskLevel: 'low',
    };
  }
  if (score <= 100) {
    return {
      category: 'Mild calcification',
      description: 'Mild coronary calcium. Mildly increased cardiovascular risk.',
      riskLevel: 'low',
    };
  }
  if (score <= 400) {
    return {
      category: 'Moderate calcification',
      description: 'Moderate coronary calcium. Moderately increased cardiovascular risk.',
      riskLevel: 'moderately_high',
    };
  }
  return {
    category: 'Severe calcification',
    description: 'Extensive coronary calcium. Significantly increased cardiovascular risk.',
    riskLevel: 'high',
  };
}

/**
 * Interpret a CAD-RADS score.
 *
 * @param score - CAD-RADS classification.
 * @returns Human-readable interpretation.
 */
export function interpretCadRads(score: string): {
  stenosisRange: string;
  description: string;
  actionability: string;
} {
  const interpretations: Record<string, { stenosisRange: string; description: string; actionability: string }> = {
    '0': {
      stenosisRange: '0%',
      description: 'No coronary artery disease',
      actionability: 'No further workup for CAD',
    },
    '1': {
      stenosisRange: '1-24%',
      description: 'Minimal non-obstructive CAD',
      actionability: 'Preventive measures recommended',
    },
    '2': {
      stenosisRange: '25-49%',
      description: 'Mild non-obstructive CAD',
      actionability: 'Preventive measures and risk factor optimization',
    },
    '3': {
      stenosisRange: '50-69%',
      description: 'Moderate stenosis',
      actionability: 'Consider functional assessment',
    },
    '4A': {
      stenosisRange: '70-99% (one or two vessels)',
      description: 'Severe stenosis',
      actionability: 'Consider invasive angiography or functional assessment',
    },
    '4B': {
      stenosisRange: '70-99% (three vessels or left main)',
      description: 'Severe stenosis (extensive)',
      actionability: 'Invasive angiography recommended',
    },
    '5': {
      stenosisRange: '100%',
      description: 'Total coronary occlusion',
      actionability: 'Invasive angiography and clinical correlation',
    },
    N: {
      stenosisRange: 'Non-diagnostic',
      description: 'Non-diagnostic study',
      actionability: 'Consider repeat imaging or alternative testing',
    },
  };

  return (
    interpretations[score] ?? {
      stenosisRange: 'Unknown',
      description: 'Unknown CAD-RADS score',
      actionability: 'Clinical correlation required',
    }
  );
}

/**
 * Classify LVEF (Left Ventricular Ejection Fraction).
 *
 * Based on ASE/EACVI guidelines.
 *
 * @param lvef - LVEF percentage.
 * @returns Classification.
 */
export function classifyLvef(lvef: number): {
  category: string;
  description: string;
} {
  if (lvef >= 55) {
    return { category: 'Normal', description: 'Normal systolic function' };
  }
  if (lvef >= 45) {
    return { category: 'Mildly reduced', description: 'Mildly reduced systolic function' };
  }
  if (lvef >= 30) {
    return { category: 'Moderately reduced', description: 'Moderately reduced systolic function' };
  }
  return { category: 'Severely reduced', description: 'Severely reduced systolic function' };
}
