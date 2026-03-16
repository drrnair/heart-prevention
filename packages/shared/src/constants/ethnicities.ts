/**
 * Ethnicity definitions, regional mappings, and risk adjustments.
 *
 * Used for:
 * - ASCVD PCE ethnicity-based risk adjustments
 * - SCORE2 European regional mapping
 * - IDF waist circumference thresholds (metabolic syndrome criteria)
 * - NHANES data stratification
 */

import type { BiologicalSex, EthnicityCode, Score2Region } from '../types/profile';

// ── Ethnicity definitions ──────────────────────────────────────────────

/** Human-readable ethnicity entry with cardiovascular risk notes. */
export interface EthnicityDefinition {
  readonly code: EthnicityCode;
  readonly label: string;
  /** Brief note on population-level cardiovascular risk patterns. */
  readonly riskNotes: string;
}

export const ETHNICITIES: readonly EthnicityDefinition[] = [
  {
    code: 'white',
    label: 'White / Caucasian',
    riskNotes: 'PCE validated in this population. Standard risk coefficients apply.',
  },
  {
    code: 'black',
    label: 'Black / African American',
    riskNotes:
      'Higher prevalence of hypertension and left ventricular hypertrophy. PCE uses separate race-specific coefficients. Earlier onset of CVD risk factors.',
  },
  {
    code: 'hispanic',
    label: 'Hispanic / Latino',
    riskNotes:
      'PCE may overestimate risk. Consider MESA risk calculator as supplement. Hispanic paradox: lower CVD mortality despite higher prevalence of risk factors.',
  },
  {
    code: 'south_asian',
    label: 'South Asian',
    riskNotes:
      'Elevated ASCVD risk at lower lipid levels and younger ages. Higher prevalence of insulin resistance, elevated Lp(a), and central adiposity. PCE typically underestimates risk.',
  },
  {
    code: 'east_asian',
    label: 'East Asian',
    riskNotes:
      'Lower CAD incidence but higher stroke risk compared to Western populations. PCE may overestimate CAD risk. Lower BMI thresholds for metabolic risk.',
  },
  {
    code: 'southeast_asian',
    label: 'Southeast Asian',
    riskNotes:
      'Higher prevalence of diabetes and metabolic syndrome. Lower BMI thresholds apply. Limited representation in PCE validation studies.',
  },
  {
    code: 'middle_eastern',
    label: 'Middle Eastern / North African',
    riskNotes:
      'High prevalence of metabolic syndrome and diabetes. PCE not validated in this population; consider as high-risk when borderline.',
  },
  {
    code: 'other',
    label: 'Other / Multiracial',
    riskNotes:
      'PCE coefficients for non-Hispanic white used as default. Individual risk factors should be weighted more heavily than population estimates.',
  },
] as const;

// ── SCORE2 regional mapping ────────────────────────────────────────────

/**
 * Maps ethnicity codes to ESC SCORE2 cardiovascular risk regions.
 *
 * These are approximate mappings for users outside Europe who may have
 * heritage-based risk profiles similar to these regions.
 */
export const SCORE2_REGIONS: Record<EthnicityCode, Score2Region> = {
  white: 'moderate',
  black: 'high',
  hispanic: 'moderate',
  south_asian: 'very_high',
  east_asian: 'low',
  southeast_asian: 'moderate',
  middle_eastern: 'high',
  other: 'moderate',
} as const;

// ── IDF waist circumference thresholds ─────────────────────────────────

/**
 * IDF (International Diabetes Federation) waist circumference thresholds
 * for central obesity, used in metabolic syndrome diagnosis.
 *
 * Values in centimeters.
 */
export interface WaistThreshold {
  readonly male: number;
  readonly female: number;
}

export const IDF_WAIST_THRESHOLDS: Record<EthnicityCode, WaistThreshold> = {
  white: { male: 94, female: 80 },
  black: { male: 94, female: 80 },
  hispanic: { male: 90, female: 80 },
  south_asian: { male: 90, female: 80 },
  east_asian: { male: 90, female: 80 },
  southeast_asian: { male: 90, female: 80 },
  middle_eastern: { male: 94, female: 80 },
  other: { male: 94, female: 80 },
} as const;

/**
 * Check whether a waist measurement exceeds the IDF central obesity threshold.
 *
 * @param waistCm - Waist circumference in centimeters.
 * @param sex - Biological sex.
 * @param ethnicity - Ethnicity code for threshold lookup.
 * @returns `true` if the measurement meets/exceeds the IDF threshold.
 */
export function isCentralObesity(
  waistCm: number,
  sex: BiologicalSex,
  ethnicity: EthnicityCode,
): boolean {
  const thresholds = IDF_WAIST_THRESHOLDS[ethnicity];
  return waistCm >= thresholds[sex];
}

// ── ASCVD risk multipliers by ethnicity ────────────────────────────────

/**
 * Ethnicity-based risk multipliers for adjusting ASCVD PCE scores.
 *
 * The PCE was primarily validated in white and Black populations.
 * These multipliers adjust for observed over/underestimation in
 * other groups, based on published recalibration studies.
 *
 * A multiplier of 1.0 means no adjustment.
 * > 1.0 means PCE likely underestimates risk.
 * < 1.0 means PCE likely overestimates risk.
 */
export const ETHNICITY_RISK_MULTIPLIERS: Record<EthnicityCode, number> = {
  white: 1.0,
  black: 1.0,       // PCE has race-specific coefficients already
  hispanic: 0.7,    // PCE tends to overestimate
  south_asian: 1.4, // PCE underestimates; higher risk at lower thresholds
  east_asian: 0.7,  // Lower CAD risk than predicted
  southeast_asian: 1.1,
  middle_eastern: 1.2,
  other: 1.0,
} as const;

/**
 * Apply an ethnicity-based adjustment to an ASCVD risk score.
 *
 * @param rawScore - The unadjusted ASCVD PCE 10-year risk (0-100).
 * @param ethnicity - The patient's ethnicity code.
 * @returns The adjusted score, clamped to [0, 100].
 */
export function adjustAscvdForEthnicity(
  rawScore: number,
  ethnicity: EthnicityCode,
): number {
  const multiplier = ETHNICITY_RISK_MULTIPLIERS[ethnicity];
  const adjusted = rawScore * multiplier;
  return Math.min(100, Math.max(0, Math.round(adjusted * 10) / 10));
}
