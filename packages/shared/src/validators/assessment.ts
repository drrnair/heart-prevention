/**
 * Health assessment input validators.
 *
 * Validates biometric measurements submitted during a health assessment.
 * Includes derived field computation (BMI, waist-to-hip, waist-to-height).
 */

import { z } from 'zod';

// ── Assessment input schema ────────────────────────────────────────────

/**
 * Schema for creating a new health assessment.
 *
 * Derived fields (bmi, waistToHip, waistToHeight) are computed server-side,
 * so they are optional on input but required in the full assessment record.
 */
export const assessmentInputSchema = z
  .object({
    assessedAt: z.string().datetime(),
    systolicBp: z
      .number()
      .int()
      .min(60, 'Systolic BP must be at least 60 mmHg')
      .max(300, 'Systolic BP must be at most 300 mmHg'),
    diastolicBp: z
      .number()
      .int()
      .min(30, 'Diastolic BP must be at least 30 mmHg')
      .max(200, 'Diastolic BP must be at most 200 mmHg'),
    pulseRate: z
      .number()
      .int()
      .min(30, 'Pulse rate must be at least 30 bpm')
      .max(250, 'Pulse rate must be at most 250 bpm')
      .nullable()
      .optional(),
    heightCm: z
      .number()
      .min(50, 'Height must be at least 50 cm')
      .max(300, 'Height must be at most 300 cm'),
    weightKg: z
      .number()
      .min(20, 'Weight must be at least 20 kg')
      .max(500, 'Weight must be at most 500 kg'),
    waistCm: z
      .number()
      .min(30, 'Waist circumference must be at least 30 cm')
      .max(300, 'Waist circumference must be at most 300 cm')
      .nullable()
      .optional(),
    hipCm: z
      .number()
      .min(30, 'Hip circumference must be at least 30 cm')
      .max(300, 'Hip circumference must be at most 300 cm')
      .nullable()
      .optional(),
    notes: z.string().max(2000).nullable().optional(),
  })
  .refine((data) => data.systolicBp > data.diastolicBp, {
    message: 'Systolic BP must be greater than diastolic BP',
    path: ['systolicBp'],
  })
  .refine(
    (data) => {
      // If both waist and hip are provided, waist should be less than hip (usually)
      if (data.waistCm != null && data.hipCm != null) {
        // Allow waist >= hip (apple-shaped body) but flag extreme ratios
        return data.waistCm / data.hipCm < 2.0;
      }
      return true;
    },
    {
      message: 'Waist-to-hip ratio exceeds physiologically plausible range',
      path: ['waistCm'],
    },
  );

export type AssessmentInput = z.infer<typeof assessmentInputSchema>;

// ── Derived field computation ──────────────────────────────────────────

/**
 * Compute BMI from height and weight.
 *
 * @param heightCm - Height in centimeters.
 * @param weightKg - Weight in kilograms.
 * @returns BMI rounded to one decimal place.
 */
export function computeBmi(heightCm: number, weightKg: number): number {
  const heightM = heightCm / 100;
  return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
}

/**
 * Compute waist-to-hip ratio.
 *
 * @param waistCm - Waist circumference in cm.
 * @param hipCm - Hip circumference in cm.
 * @returns Ratio rounded to two decimal places, or `null` if inputs are missing.
 */
export function computeWaistToHip(
  waistCm: number | null | undefined,
  hipCm: number | null | undefined,
): number | null {
  if (waistCm == null || hipCm == null || hipCm === 0) return null;
  return Math.round((waistCm / hipCm) * 100) / 100;
}

/**
 * Compute waist-to-height ratio.
 *
 * @param waistCm - Waist circumference in cm.
 * @param heightCm - Height in cm.
 * @returns Ratio rounded to two decimal places, or `null` if waist is missing.
 */
export function computeWaistToHeight(
  waistCm: number | null | undefined,
  heightCm: number,
): number | null {
  if (waistCm == null || heightCm === 0) return null;
  return Math.round((waistCm / heightCm) * 100) / 100;
}

/** BMI classification according to WHO criteria. */
export type BmiCategory = 'underweight' | 'normal' | 'overweight' | 'obese_class_1' | 'obese_class_2' | 'obese_class_3';

/**
 * Classify a BMI value according to WHO criteria.
 *
 * @param bmi - Body Mass Index value.
 * @returns The BMI category.
 */
export function classifyBmi(bmi: number): BmiCategory {
  if (bmi < 18.5) return 'underweight';
  if (bmi < 25) return 'normal';
  if (bmi < 30) return 'overweight';
  if (bmi < 35) return 'obese_class_1';
  if (bmi < 40) return 'obese_class_2';
  return 'obese_class_3';
}

/** Blood pressure stage classification. */
export type BpCategory = 'normal' | 'elevated' | 'stage_1_hypertension' | 'stage_2_hypertension' | 'hypertensive_crisis';

/**
 * Classify blood pressure according to ACC/AHA 2017 guidelines.
 *
 * @param systolic - Systolic BP in mmHg.
 * @param diastolic - Diastolic BP in mmHg.
 * @returns The BP category.
 */
export function classifyBp(systolic: number, diastolic: number): BpCategory {
  if (systolic >= 180 || diastolic >= 120) return 'hypertensive_crisis';
  if (systolic >= 140 || diastolic >= 90) return 'stage_2_hypertension';
  if (systolic >= 130 || diastolic >= 80) return 'stage_1_hypertension';
  if (systolic >= 120 && diastolic < 80) return 'elevated';
  return 'normal';
}
