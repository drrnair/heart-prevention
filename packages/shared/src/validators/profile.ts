/**
 * Profile validators with input validation helpers.
 *
 * These schemas validate user-submitted profile data at API boundaries.
 * They are stricter than the type-level schemas (which describe database shape)
 * and include practical range checks for data quality.
 */

import { z } from 'zod';
import {
  BiologicalSex,
  EthnicityCode,
  SmokingStatus,
  DiabetesStatus,
  Score2Region,
  ActivityLevel,
} from '../types/profile';

// ── Reusable refinements ───────────────────────────────────────────────

/** Valid date of birth: must be a valid date string resulting in age 18-120. */
const dateOfBirthSchema = z
  .string()
  .date()
  .refine(
    (val) => {
      const dob = new Date(val);
      const now = new Date();
      const age = now.getFullYear() - dob.getFullYear();
      return age >= 18 && age <= 120;
    },
    { message: 'Age must be between 18 and 120 years' },
  );

// ── Blood pressure sub-schema ──────────────────────────────────────────

const systolicBpSchema = z
  .number()
  .int()
  .min(60, 'Systolic BP must be at least 60 mmHg')
  .max(300, 'Systolic BP must be at most 300 mmHg');

const diastolicBpSchema = z
  .number()
  .int()
  .min(30, 'Diastolic BP must be at least 30 mmHg')
  .max(200, 'Diastolic BP must be at most 200 mmHg');

// ── Anthropometric sub-schemas ─────────────────────────────────────────

const heightCmSchema = z
  .number()
  .min(50, 'Height must be at least 50 cm')
  .max(300, 'Height must be at most 300 cm');

const weightKgSchema = z
  .number()
  .min(20, 'Weight must be at least 20 kg')
  .max(500, 'Weight must be at most 500 kg');

const waistCmSchema = z
  .number()
  .min(30, 'Waist circumference must be at least 30 cm')
  .max(300, 'Waist circumference must be at most 300 cm');

const hipCmSchema = z
  .number()
  .min(30, 'Hip circumference must be at least 30 cm')
  .max(300, 'Hip circumference must be at most 300 cm');

// ── Profile input schema ───────────────────────────────────────────────

/**
 * Schema for validating profile creation/update input.
 *
 * This is intentionally a subset of `userProfileSchema` -- it omits server-
 * managed fields (id, timestamps, subscription) and adds stricter range checks.
 */
export const profileInputSchema = z.object({
  displayName: z.string().min(1, 'Display name is required').max(100),
  email: z.string().email('Invalid email address'),
  dateOfBirth: dateOfBirthSchema,
  biologicalSex: z.enum(BiologicalSex),
  ethnicity: z.enum(EthnicityCode),
  score2Region: z.enum(Score2Region).nullable().optional(),
  smokingStatus: z.enum(SmokingStatus),
  diabetesStatus: z.enum(DiabetesStatus),
  onBpMeds: z.boolean(),
  onStatin: z.boolean(),
  onAspirin: z.boolean(),
  familyHistoryPrematureCvd: z.boolean(),
  historyOfPreeclampsia: z.boolean(),
  prematureMenopause: z.boolean(),
  chronicKidneyDisease: z.boolean(),
  chronicInflammatoryCondition: z.boolean(),
  cuisinePreferences: z.array(z.string().max(50)).max(20),
  activityLevel: z.enum(ActivityLevel),
  entryPath: z.enum(['A', 'B']),
});

export type ProfileInput = z.infer<typeof profileInputSchema>;

/**
 * Schema for validating biometric measurements submitted with a profile
 * or health assessment.
 */
export const biometricsInputSchema = z
  .object({
    systolicBp: systolicBpSchema,
    diastolicBp: diastolicBpSchema,
    pulseRate: z.number().int().min(30).max(250).nullable().optional(),
    heightCm: heightCmSchema,
    weightKg: weightKgSchema,
    waistCm: waistCmSchema.nullable().optional(),
    hipCm: hipCmSchema.nullable().optional(),
  })
  .refine(
    (data) => data.systolicBp > data.diastolicBp,
    { message: 'Systolic BP must be greater than diastolic BP', path: ['systolicBp'] },
  );

export type BiometricsInput = z.infer<typeof biometricsInputSchema>;

// ── Smart validation helpers ───────────────────────────────────────────

/**
 * Check whether systolic and diastolic BP values appear to be reversed.
 *
 * @param systolic - Reported systolic BP.
 * @param diastolic - Reported diastolic BP.
 * @returns `true` if the values are likely swapped (diastolic > systolic).
 */
export function isBpReversed(systolic: number, diastolic: number): boolean {
  return diastolic > systolic;
}

/**
 * Check whether a height value in "cm" is likely in imperial units.
 *
 * Heights under 10 are likely in feet, and heights between 10 and 49
 * are likely in inches. Both suggest the user entered imperial, not metric.
 *
 * @param heightCm - The height value the user entered as "cm".
 * @returns `true` if the value is suspiciously small for centimeters.
 */
export function isLikelyImperial(heightCm: number): boolean {
  return heightCm > 0 && heightCm < 50;
}

/**
 * Convert a height string in feet/inches format to centimeters.
 *
 * Accepts formats: "5'10\"", "5'10", "5.10", "5 10", "510" (5ft 10in).
 *
 * @param value - The height string in feet and inches.
 * @returns Height in centimeters, or `null` if the format is unrecognized.
 */
export function convertFeetInchesToCm(value: string): number | null {
  // Format: 5'10" or 5'10
  const quoteMatch = value.match(/^(\d+)['']\s*(\d+)?["""]?\s*$/);
  if (quoteMatch) {
    const feet = parseInt(quoteMatch[1] ?? '0', 10);
    const inches = parseInt(quoteMatch[2] ?? '0', 10);
    if (feet >= 1 && feet <= 8 && inches >= 0 && inches <= 11) {
      return Math.round((feet * 12 + inches) * 2.54 * 10) / 10;
    }
  }

  // Format: 5.10 (feet.inches)
  const dotMatch = value.match(/^(\d+)\.(\d{1,2})$/);
  if (dotMatch) {
    const feet = parseInt(dotMatch[1] ?? '0', 10);
    const inches = parseInt(dotMatch[2] ?? '0', 10);
    if (feet >= 1 && feet <= 8 && inches >= 0 && inches <= 11) {
      return Math.round((feet * 12 + inches) * 2.54 * 10) / 10;
    }
  }

  // Format: "5 10" (feet space inches)
  const spaceMatch = value.match(/^(\d+)\s+(\d{1,2})$/);
  if (spaceMatch) {
    const feet = parseInt(spaceMatch[1] ?? '0', 10);
    const inches = parseInt(spaceMatch[2] ?? '0', 10);
    if (feet >= 1 && feet <= 8 && inches >= 0 && inches <= 11) {
      return Math.round((feet * 12 + inches) * 2.54 * 10) / 10;
    }
  }

  return null;
}

/**
 * Convert a plain number that looks like "feet + inches" packed into
 * a single number. For example, `510` -> 5 feet 10 inches -> 177.8 cm.
 *
 * Only works for 3-digit numbers (e.g., 411 through 611).
 *
 * @param value - Numeric value that may be packed feet+inches.
 * @returns Height in centimeters, or `null` if the format is unrecognized.
 */
export function convertPackedFeetInchesToCm(value: number): number | null {
  if (value < 100 || value > 811 || !Number.isInteger(value)) {
    return null;
  }
  const feet = Math.floor(value / 100);
  const inches = value % 100;
  if (feet < 1 || feet > 8 || inches > 11) {
    return null;
  }
  return Math.round((feet * 12 + inches) * 2.54 * 10) / 10;
}
