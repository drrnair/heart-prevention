/**
 * Shared constants used across the heart-prevention application.
 */

export * from './disclaimers';
export * from './lab-ranges';
export * from './ethnicities';
export * from './nhanes-medians';

/** Maximum number of lab result uploads per day. */
export const MAX_DAILY_LAB_UPLOADS = 5;

/** Maximum file size for lab report PDFs (10 MB). */
export const MAX_LAB_FILE_SIZE_BYTES = 10 * 1024 * 1024;

/** Allowed MIME types for lab report uploads. */
export const ALLOWED_LAB_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
] as const;

/** Trial duration in days. */
export const TRIAL_DURATION_DAYS = 14;

/** Disclaimer appended to every AI-generated insight. */
export const WELLNESS_DISCLAIMER =
  'This is not medical advice. Consult your healthcare provider before making any changes to your health routine.';

/** Risk thresholds for 10-year ASCVD PCE score. */
export const ASCVD_PCE_THRESHOLDS = {
  low: 5,
  borderline: 7.5,
  intermediate: 20,
  // >= 20 is high
} as const;

/** Data-level descriptions. */
export const DATA_LEVEL_LABELS = {
  1: 'Basic profile + vitals',
  2: 'Basic labs (lipid panel, glucose)',
  3: 'Extended labs (ApoB, Lp(a), hs-CRP)',
  4: 'Imaging (CAC, CTCA)',
} as const;
