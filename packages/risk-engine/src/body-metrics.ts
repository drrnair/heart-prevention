/**
 * Body Composition Calculators
 *
 * Pure mathematical functions for calculating and interpreting body metrics
 * relevant to cardiovascular risk assessment.
 */

import type { BmiCategory, Sex, WhrRiskLevel, WhtRiskLevel } from './types';

// ── BMI ──────────────────────────────────────────────────────────────────────

/**
 * Calculate Body Mass Index.
 *
 * @param weightKg - Weight in kilograms
 * @param heightCm - Height in centimeters
 * @returns BMI value (kg/m^2), rounded to 1 decimal
 */
export function calculateBmi(weightKg: number, heightCm: number): number {
  if (weightKg <= 0 || heightCm <= 0) {
    throw new Error('Weight and height must be positive values');
  }
  const heightM = heightCm / 100;
  return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
}

/**
 * Interpret BMI category per WHO classification.
 *
 * @param bmi - BMI value
 * @returns BMI category
 */
export function interpretBmi(bmi: number): BmiCategory {
  if (bmi < 18.5) return 'underweight';
  if (bmi < 25) return 'normal';
  if (bmi < 30) return 'overweight';
  if (bmi < 35) return 'obese_class_1';
  if (bmi < 40) return 'obese_class_2';
  return 'obese_class_3';
}

// ── Waist-to-Hip Ratio ───────────────────────────────────────────────────────

/**
 * Calculate waist-to-hip ratio.
 *
 * @param waistCm - Waist circumference in centimeters
 * @param hipCm - Hip circumference in centimeters
 * @returns Waist-to-hip ratio, rounded to 2 decimals
 */
export function calculateWaistToHip(
  waistCm: number,
  hipCm: number,
): number {
  if (waistCm <= 0 || hipCm <= 0) {
    throw new Error('Waist and hip measurements must be positive values');
  }
  return Math.round((waistCm / hipCm) * 100) / 100;
}

/**
 * Interpret waist-to-hip ratio risk level per WHO guidelines.
 *
 * Men:   < 0.90 low, 0.90-0.99 moderate, >= 1.0 high
 * Women: < 0.80 low, 0.80-0.84 moderate, >= 0.85 high
 *
 * @param whr - Waist-to-hip ratio
 * @param sex - Patient sex
 * @returns Risk level
 */
export function interpretWhr(whr: number, sex: Sex): WhrRiskLevel {
  if (sex === 'male') {
    if (whr < 0.9) return 'low';
    if (whr < 1.0) return 'moderate';
    return 'high';
  }
  // female
  if (whr < 0.8) return 'low';
  if (whr < 0.85) return 'moderate';
  return 'high';
}

// ── Waist-to-Height Ratio ────────────────────────────────────────────────────

/**
 * Calculate waist-to-height ratio.
 *
 * @param waistCm - Waist circumference in centimeters
 * @param heightCm - Height in centimeters
 * @returns Waist-to-height ratio, rounded to 2 decimals
 */
export function calculateWaistToHeight(
  waistCm: number,
  heightCm: number,
): number {
  if (waistCm <= 0 || heightCm <= 0) {
    throw new Error('Waist and height must be positive values');
  }
  return Math.round((waistCm / heightCm) * 100) / 100;
}

/**
 * Interpret waist-to-height ratio risk level.
 *
 * A WHtR >= 0.5 indicates increased cardiometabolic risk regardless of sex.
 * (Browning et al. 2010, systematic review and meta-analysis)
 *
 * @param whtr - Waist-to-height ratio
 * @returns Risk level
 */
export function interpretWhtR(whtr: number): WhtRiskLevel {
  return whtr < 0.5 ? 'low' : 'high';
}

// ── A Body Shape Index (ABSI) ────────────────────────────────────────────────

/**
 * Calculate A Body Shape Index (ABSI).
 *
 * ABSI = WC / (BMI^(2/3) * height^(1/2))
 * where WC is in meters, BMI in kg/m^2, height in meters.
 *
 * Reference: Krakauer NY, Krakauer JC. A New Body Shape Index Predicts
 * Mortality Hazard Independently of Body Mass Index. PLoS ONE. 2012.
 *
 * @param waistCm - Waist circumference in centimeters
 * @param bmi - Pre-calculated BMI (kg/m^2)
 * @param heightCm - Height in centimeters
 * @returns ABSI value (typically ~0.07-0.09)
 */
export function calculateAbsi(
  waistCm: number,
  bmi: number,
  heightCm: number,
): number {
  if (waistCm <= 0 || bmi <= 0 || heightCm <= 0) {
    throw new Error('All measurements must be positive values');
  }
  const waistM = waistCm / 100;
  const heightM = heightCm / 100;
  const absi = waistM / (Math.pow(bmi, 2 / 3) * Math.pow(heightM, 0.5));
  return Math.round(absi * 10000) / 10000;
}
