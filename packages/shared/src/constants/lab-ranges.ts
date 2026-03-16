/**
 * Reference ranges for laboratory values used in the heart-prevention app.
 *
 * Ranges are sourced from:
 * - ACC/AHA Cholesterol Guidelines (2018)
 * - ADA Standards of Medical Care (2024)
 * - KDIGO CKD Guidelines (2012)
 * - AHA/ACC hs-CRP thresholds
 * - Standard clinical laboratory reference ranges
 *
 * All numeric values are in the units specified by `unit`.
 */

import type { BiologicalSex } from '../types/profile';

// ── Types ──────────────────────────────────────────────────────────────

/** Risk/interpretation category for a lab value. */
export type LabCategory =
  | 'optimal'
  | 'normal'
  | 'near_optimal'
  | 'desirable'
  | 'borderline'
  | 'high'
  | 'very_high'
  | 'low'
  | 'prediabetes'
  | 'diabetes'
  | 'mild'
  | 'moderate'
  | 'severe'
  | 'failure';

/** A single reference-range bracket. */
export interface RangeThreshold {
  readonly category: LabCategory;
  readonly min: number;
  readonly max: number;
  readonly description: string;
}

/** Full definition for a single lab test's reference data. */
export interface LabRangeDefinition {
  readonly unit: string;
  /** Optimal range boundaries (if applicable). */
  readonly optimalMin?: number;
  readonly optimalMax?: number;
  /** Whether interpretation depends on biological sex. */
  readonly sexDependent?: boolean;
  /** Ordered from best to worst (ascending risk). */
  readonly thresholds: readonly RangeThreshold[];
  /** Sex-specific thresholds, keyed by biological sex. */
  readonly sexThresholds?: Record<BiologicalSex, readonly RangeThreshold[]>;
}

/** Result returned by `getLabInterpretation`. */
export interface LabInterpretation {
  readonly category: LabCategory;
  readonly description: string;
  readonly isAbnormal: boolean;
}

// ── Reference ranges ───────────────────────────────────────────────────

export const LAB_RANGES: Record<string, LabRangeDefinition> = {
  // ── Lipid panel ────────────────────────────────────────────────────

  totalCholesterol: {
    unit: 'mg/dL',
    optimalMax: 200,
    thresholds: [
      { category: 'desirable', min: 0, max: 199, description: 'Desirable' },
      { category: 'borderline', min: 200, max: 239, description: 'Borderline high' },
      { category: 'high', min: 240, max: Infinity, description: 'High' },
    ],
  },

  ldlCholesterol: {
    unit: 'mg/dL',
    optimalMax: 100,
    thresholds: [
      { category: 'optimal', min: 0, max: 99, description: 'Optimal' },
      { category: 'near_optimal', min: 100, max: 129, description: 'Near optimal' },
      { category: 'borderline', min: 130, max: 159, description: 'Borderline high' },
      { category: 'high', min: 160, max: 189, description: 'High' },
      { category: 'very_high', min: 190, max: Infinity, description: 'Very high' },
    ],
  },

  hdlCholesterol: {
    unit: 'mg/dL',
    optimalMin: 60,
    sexDependent: true,
    thresholds: [], // use sexThresholds
    sexThresholds: {
      male: [
        { category: 'low', min: 0, max: 39, description: 'Low (major risk factor)' },
        { category: 'normal', min: 40, max: 59, description: 'Normal' },
        { category: 'optimal', min: 60, max: Infinity, description: 'High (protective)' },
      ],
      female: [
        { category: 'low', min: 0, max: 49, description: 'Low (major risk factor)' },
        { category: 'normal', min: 50, max: 59, description: 'Normal' },
        { category: 'optimal', min: 60, max: Infinity, description: 'High (protective)' },
      ],
    },
  },

  triglycerides: {
    unit: 'mg/dL',
    optimalMax: 150,
    thresholds: [
      { category: 'normal', min: 0, max: 149, description: 'Normal' },
      { category: 'borderline', min: 150, max: 199, description: 'Borderline high' },
      { category: 'high', min: 200, max: 499, description: 'High' },
      { category: 'very_high', min: 500, max: Infinity, description: 'Very high' },
    ],
  },

  nonHdlCholesterol: {
    unit: 'mg/dL',
    optimalMax: 130,
    thresholds: [
      { category: 'optimal', min: 0, max: 129, description: 'Optimal' },
      { category: 'borderline', min: 130, max: 159, description: 'Above optimal' },
      { category: 'high', min: 160, max: 189, description: 'Borderline high' },
      { category: 'very_high', min: 190, max: Infinity, description: 'High' },
    ],
  },

  // ── Extended lipids ────────────────────────────────────────────────

  apolipoproteinB: {
    unit: 'mg/dL',
    optimalMax: 90,
    thresholds: [
      { category: 'optimal', min: 0, max: 89, description: 'Optimal' },
      { category: 'borderline', min: 90, max: 130, description: 'Borderline' },
      { category: 'high', min: 131, max: Infinity, description: 'High' },
    ],
  },

  lipoproteinA: {
    unit: 'nmol/L',
    optimalMax: 75,
    thresholds: [
      { category: 'desirable', min: 0, max: 74, description: 'Desirable' },
      { category: 'high', min: 75, max: Infinity, description: 'Elevated' },
    ],
  },

  ldlParticleNumber: {
    unit: 'nmol/L',
    optimalMax: 1000,
    thresholds: [
      { category: 'optimal', min: 0, max: 999, description: 'Optimal' },
      { category: 'borderline', min: 1000, max: 1299, description: 'Borderline' },
      { category: 'high', min: 1300, max: Infinity, description: 'High' },
    ],
  },

  oxidizedLdl: {
    unit: 'U/L',
    optimalMax: 60,
    thresholds: [
      { category: 'normal', min: 0, max: 59, description: 'Normal' },
      { category: 'high', min: 60, max: Infinity, description: 'Elevated' },
    ],
  },

  remnantCholesterol: {
    unit: 'mg/dL',
    optimalMax: 24,
    thresholds: [
      { category: 'normal', min: 0, max: 23, description: 'Normal' },
      { category: 'borderline', min: 24, max: 29, description: 'Borderline' },
      { category: 'high', min: 30, max: Infinity, description: 'Elevated' },
    ],
  },

  // ── Glycemic markers ───────────────────────────────────────────────

  hba1c: {
    unit: '%',
    optimalMax: 5.6,
    thresholds: [
      { category: 'normal', min: 0, max: 5.6, description: 'Normal' },
      { category: 'prediabetes', min: 5.7, max: 6.4, description: 'Prediabetes' },
      { category: 'diabetes', min: 6.5, max: Infinity, description: 'Diabetes range' },
    ],
  },

  fastingGlucose: {
    unit: 'mg/dL',
    optimalMax: 99,
    thresholds: [
      { category: 'normal', min: 0, max: 99, description: 'Normal' },
      { category: 'prediabetes', min: 100, max: 125, description: 'Prediabetes (impaired fasting glucose)' },
      { category: 'diabetes', min: 126, max: Infinity, description: 'Diabetes range' },
    ],
  },

  fastingInsulin: {
    unit: 'uIU/mL',
    optimalMax: 12,
    thresholds: [
      { category: 'optimal', min: 0, max: 12, description: 'Optimal' },
      { category: 'borderline', min: 13, max: 24, description: 'Borderline (possible insulin resistance)' },
      { category: 'high', min: 25, max: Infinity, description: 'Elevated (insulin resistance)' },
    ],
  },

  homaIr: {
    unit: '',
    optimalMax: 1.9,
    thresholds: [
      { category: 'optimal', min: 0, max: 1.0, description: 'Optimal' },
      { category: 'normal', min: 1.0, max: 1.9, description: 'Normal' },
      { category: 'borderline', min: 2.0, max: 2.9, description: 'Borderline insulin resistance' },
      { category: 'high', min: 3.0, max: Infinity, description: 'Insulin resistance likely' },
    ],
  },

  // ── Inflammatory / cardiac markers ─────────────────────────────────

  hsCrp: {
    unit: 'mg/L',
    optimalMax: 1.0,
    thresholds: [
      { category: 'low', min: 0, max: 0.99, description: 'Low cardiovascular risk' },
      { category: 'borderline', min: 1.0, max: 3.0, description: 'Average cardiovascular risk' },
      { category: 'high', min: 3.01, max: Infinity, description: 'High cardiovascular risk' },
    ],
  },

  homocysteine: {
    unit: 'umol/L',
    optimalMax: 12,
    thresholds: [
      { category: 'normal', min: 0, max: 12, description: 'Normal' },
      { category: 'borderline', min: 12.1, max: 15, description: 'Borderline' },
      { category: 'high', min: 15.1, max: Infinity, description: 'Elevated' },
    ],
  },

  fibrinogen: {
    unit: 'mg/dL',
    optimalMin: 200,
    optimalMax: 400,
    thresholds: [
      { category: 'low', min: 0, max: 199, description: 'Low' },
      { category: 'normal', min: 200, max: 400, description: 'Normal' },
      { category: 'high', min: 401, max: Infinity, description: 'Elevated' },
    ],
  },

  esr: {
    unit: 'mm/hr',
    sexDependent: true,
    thresholds: [],
    sexThresholds: {
      male: [
        { category: 'normal', min: 0, max: 15, description: 'Normal' },
        { category: 'borderline', min: 16, max: 22, description: 'Borderline' },
        { category: 'high', min: 23, max: Infinity, description: 'Elevated' },
      ],
      female: [
        { category: 'normal', min: 0, max: 20, description: 'Normal' },
        { category: 'borderline', min: 21, max: 29, description: 'Borderline' },
        { category: 'high', min: 30, max: Infinity, description: 'Elevated' },
      ],
    },
  },

  ntProBnp: {
    unit: 'pg/mL',
    optimalMax: 125,
    thresholds: [
      { category: 'normal', min: 0, max: 125, description: 'Normal' },
      { category: 'borderline', min: 126, max: 450, description: 'Borderline (age-dependent)' },
      { category: 'high', min: 451, max: Infinity, description: 'Elevated' },
    ],
  },

  troponinI: {
    unit: 'ng/mL',
    optimalMax: 0.04,
    thresholds: [
      { category: 'normal', min: 0, max: 0.04, description: 'Normal' },
      { category: 'high', min: 0.041, max: Infinity, description: 'Elevated (possible myocardial injury)' },
    ],
  },

  // ── Renal function ─────────────────────────────────────────────────

  egfr: {
    unit: 'mL/min/1.73m2',
    optimalMin: 90,
    thresholds: [
      { category: 'normal', min: 90, max: Infinity, description: 'Normal or high' },
      { category: 'mild', min: 60, max: 89, description: 'Mildly decreased' },
      { category: 'moderate', min: 30, max: 59, description: 'Moderately decreased' },
      { category: 'severe', min: 15, max: 29, description: 'Severely decreased' },
      { category: 'failure', min: 0, max: 14, description: 'Kidney failure' },
    ],
  },

  creatinine: {
    unit: 'mg/dL',
    sexDependent: true,
    thresholds: [],
    sexThresholds: {
      male: [
        { category: 'normal', min: 0.7, max: 1.3, description: 'Normal' },
        { category: 'low', min: 0, max: 0.69, description: 'Low' },
        { category: 'high', min: 1.31, max: Infinity, description: 'Elevated' },
      ],
      female: [
        { category: 'normal', min: 0.6, max: 1.1, description: 'Normal' },
        { category: 'low', min: 0, max: 0.59, description: 'Low' },
        { category: 'high', min: 1.11, max: Infinity, description: 'Elevated' },
      ],
    },
  },

  bun: {
    unit: 'mg/dL',
    optimalMin: 7,
    optimalMax: 20,
    thresholds: [
      { category: 'low', min: 0, max: 6, description: 'Low' },
      { category: 'normal', min: 7, max: 20, description: 'Normal' },
      { category: 'high', min: 21, max: Infinity, description: 'Elevated' },
    ],
  },

  uricAcid: {
    unit: 'mg/dL',
    sexDependent: true,
    thresholds: [],
    sexThresholds: {
      male: [
        { category: 'normal', min: 3.0, max: 7.0, description: 'Normal' },
        { category: 'low', min: 0, max: 2.9, description: 'Low' },
        { category: 'high', min: 7.1, max: Infinity, description: 'Elevated' },
      ],
      female: [
        { category: 'normal', min: 2.5, max: 6.0, description: 'Normal' },
        { category: 'low', min: 0, max: 2.4, description: 'Low' },
        { category: 'high', min: 6.1, max: Infinity, description: 'Elevated' },
      ],
    },
  },

  microalbuminCreatinineRatio: {
    unit: 'mg/g',
    optimalMax: 30,
    thresholds: [
      { category: 'normal', min: 0, max: 29, description: 'Normal' },
      { category: 'borderline', min: 30, max: 299, description: 'Moderately increased (microalbuminuria)' },
      { category: 'high', min: 300, max: Infinity, description: 'Severely increased (macroalbuminuria)' },
    ],
  },

  // ── Hepatic function ───────────────────────────────────────────────

  alt: {
    unit: 'U/L',
    optimalMax: 33,
    thresholds: [
      { category: 'normal', min: 0, max: 33, description: 'Normal' },
      { category: 'borderline', min: 34, max: 55, description: 'Mildly elevated' },
      { category: 'high', min: 56, max: Infinity, description: 'Elevated' },
    ],
  },

  ast: {
    unit: 'U/L',
    optimalMax: 40,
    thresholds: [
      { category: 'normal', min: 0, max: 40, description: 'Normal' },
      { category: 'borderline', min: 41, max: 80, description: 'Mildly elevated' },
      { category: 'high', min: 81, max: Infinity, description: 'Elevated' },
    ],
  },

  alkalinePhosphatase: {
    unit: 'U/L',
    optimalMin: 44,
    optimalMax: 147,
    thresholds: [
      { category: 'low', min: 0, max: 43, description: 'Low' },
      { category: 'normal', min: 44, max: 147, description: 'Normal' },
      { category: 'high', min: 148, max: Infinity, description: 'Elevated' },
    ],
  },

  ggt: {
    unit: 'U/L',
    sexDependent: true,
    thresholds: [],
    sexThresholds: {
      male: [
        { category: 'normal', min: 0, max: 55, description: 'Normal' },
        { category: 'borderline', min: 56, max: 100, description: 'Mildly elevated' },
        { category: 'high', min: 101, max: Infinity, description: 'Elevated' },
      ],
      female: [
        { category: 'normal', min: 0, max: 38, description: 'Normal' },
        { category: 'borderline', min: 39, max: 75, description: 'Mildly elevated' },
        { category: 'high', min: 76, max: Infinity, description: 'Elevated' },
      ],
    },
  },

  totalBilirubin: {
    unit: 'mg/dL',
    optimalMax: 1.2,
    thresholds: [
      { category: 'normal', min: 0, max: 1.2, description: 'Normal' },
      { category: 'borderline', min: 1.3, max: 2.0, description: 'Mildly elevated' },
      { category: 'high', min: 2.1, max: Infinity, description: 'Elevated' },
    ],
  },

  directBilirubin: {
    unit: 'mg/dL',
    optimalMax: 0.3,
    thresholds: [
      { category: 'normal', min: 0, max: 0.3, description: 'Normal' },
      { category: 'high', min: 0.31, max: Infinity, description: 'Elevated' },
    ],
  },

  albumin: {
    unit: 'g/dL',
    optimalMin: 3.5,
    optimalMax: 5.0,
    thresholds: [
      { category: 'low', min: 0, max: 3.4, description: 'Low' },
      { category: 'normal', min: 3.5, max: 5.0, description: 'Normal' },
      { category: 'high', min: 5.1, max: Infinity, description: 'Elevated' },
    ],
  },

  totalProtein: {
    unit: 'g/dL',
    optimalMin: 6.0,
    optimalMax: 8.3,
    thresholds: [
      { category: 'low', min: 0, max: 5.9, description: 'Low' },
      { category: 'normal', min: 6.0, max: 8.3, description: 'Normal' },
      { category: 'high', min: 8.4, max: Infinity, description: 'Elevated' },
    ],
  },

  // ── Hematology ─────────────────────────────────────────────────────

  hemoglobin: {
    unit: 'g/dL',
    sexDependent: true,
    thresholds: [],
    sexThresholds: {
      male: [
        { category: 'low', min: 0, max: 13.4, description: 'Low (anemia)' },
        { category: 'normal', min: 13.5, max: 17.5, description: 'Normal' },
        { category: 'high', min: 17.6, max: Infinity, description: 'Elevated' },
      ],
      female: [
        { category: 'low', min: 0, max: 11.9, description: 'Low (anemia)' },
        { category: 'normal', min: 12.0, max: 15.5, description: 'Normal' },
        { category: 'high', min: 15.6, max: Infinity, description: 'Elevated' },
      ],
    },
  },

  hematocrit: {
    unit: '%',
    sexDependent: true,
    thresholds: [],
    sexThresholds: {
      male: [
        { category: 'low', min: 0, max: 37.9, description: 'Low' },
        { category: 'normal', min: 38, max: 50, description: 'Normal' },
        { category: 'high', min: 50.1, max: Infinity, description: 'Elevated' },
      ],
      female: [
        { category: 'low', min: 0, max: 35.9, description: 'Low' },
        { category: 'normal', min: 36, max: 44, description: 'Normal' },
        { category: 'high', min: 44.1, max: Infinity, description: 'Elevated' },
      ],
    },
  },

  wbc: {
    unit: 'x10^3/uL',
    optimalMin: 4.5,
    optimalMax: 11.0,
    thresholds: [
      { category: 'low', min: 0, max: 4.4, description: 'Low (leukopenia)' },
      { category: 'normal', min: 4.5, max: 11.0, description: 'Normal' },
      { category: 'high', min: 11.1, max: Infinity, description: 'Elevated (leukocytosis)' },
    ],
  },

  plateletCount: {
    unit: 'x10^3/uL',
    optimalMin: 150,
    optimalMax: 400,
    thresholds: [
      { category: 'low', min: 0, max: 149, description: 'Low (thrombocytopenia)' },
      { category: 'normal', min: 150, max: 400, description: 'Normal' },
      { category: 'high', min: 401, max: Infinity, description: 'Elevated (thrombocytosis)' },
    ],
  },

  rbc: {
    unit: 'x10^6/uL',
    sexDependent: true,
    thresholds: [],
    sexThresholds: {
      male: [
        { category: 'low', min: 0, max: 4.34, description: 'Low' },
        { category: 'normal', min: 4.35, max: 5.65, description: 'Normal' },
        { category: 'high', min: 5.66, max: Infinity, description: 'Elevated' },
      ],
      female: [
        { category: 'low', min: 0, max: 3.91, description: 'Low' },
        { category: 'normal', min: 3.92, max: 5.13, description: 'Normal' },
        { category: 'high', min: 5.14, max: Infinity, description: 'Elevated' },
      ],
    },
  },

  mcv: {
    unit: 'fL',
    optimalMin: 80,
    optimalMax: 100,
    thresholds: [
      { category: 'low', min: 0, max: 79, description: 'Microcytic' },
      { category: 'normal', min: 80, max: 100, description: 'Normocytic' },
      { category: 'high', min: 101, max: Infinity, description: 'Macrocytic' },
    ],
  },

  mch: {
    unit: 'pg',
    optimalMin: 27,
    optimalMax: 33,
    thresholds: [
      { category: 'low', min: 0, max: 26, description: 'Low' },
      { category: 'normal', min: 27, max: 33, description: 'Normal' },
      { category: 'high', min: 34, max: Infinity, description: 'Elevated' },
    ],
  },

  mchc: {
    unit: 'g/dL',
    optimalMin: 32,
    optimalMax: 36,
    thresholds: [
      { category: 'low', min: 0, max: 31, description: 'Low (hypochromic)' },
      { category: 'normal', min: 32, max: 36, description: 'Normal' },
      { category: 'high', min: 37, max: Infinity, description: 'Elevated (hyperchromic)' },
    ],
  },

  rdw: {
    unit: '%',
    optimalMax: 14.5,
    thresholds: [
      { category: 'normal', min: 0, max: 14.5, description: 'Normal' },
      { category: 'high', min: 14.6, max: Infinity, description: 'Elevated (anisocytosis)' },
    ],
  },

  // ── Thyroid ────────────────────────────────────────────────────────

  tsh: {
    unit: 'mIU/L',
    optimalMin: 0.4,
    optimalMax: 4.0,
    thresholds: [
      { category: 'low', min: 0, max: 0.39, description: 'Low (possible hyperthyroidism)' },
      { category: 'normal', min: 0.4, max: 4.0, description: 'Normal' },
      { category: 'borderline', min: 4.1, max: 10.0, description: 'Mildly elevated (subclinical hypothyroidism)' },
      { category: 'high', min: 10.1, max: Infinity, description: 'Elevated (possible hypothyroidism)' },
    ],
  },

  freeT3: {
    unit: 'pg/mL',
    optimalMin: 2.0,
    optimalMax: 4.4,
    thresholds: [
      { category: 'low', min: 0, max: 1.9, description: 'Low' },
      { category: 'normal', min: 2.0, max: 4.4, description: 'Normal' },
      { category: 'high', min: 4.5, max: Infinity, description: 'Elevated' },
    ],
  },

  freeT4: {
    unit: 'ng/dL',
    optimalMin: 0.82,
    optimalMax: 1.77,
    thresholds: [
      { category: 'low', min: 0, max: 0.81, description: 'Low' },
      { category: 'normal', min: 0.82, max: 1.77, description: 'Normal' },
      { category: 'high', min: 1.78, max: Infinity, description: 'Elevated' },
    ],
  },

  // ── Electrolytes ───────────────────────────────────────────────────

  sodium: {
    unit: 'mEq/L',
    optimalMin: 136,
    optimalMax: 145,
    thresholds: [
      { category: 'low', min: 0, max: 135, description: 'Low (hyponatremia)' },
      { category: 'normal', min: 136, max: 145, description: 'Normal' },
      { category: 'high', min: 146, max: Infinity, description: 'Elevated (hypernatremia)' },
    ],
  },

  potassium: {
    unit: 'mEq/L',
    optimalMin: 3.5,
    optimalMax: 5.0,
    thresholds: [
      { category: 'low', min: 0, max: 3.4, description: 'Low (hypokalemia)' },
      { category: 'normal', min: 3.5, max: 5.0, description: 'Normal' },
      { category: 'high', min: 5.1, max: Infinity, description: 'Elevated (hyperkalemia)' },
    ],
  },

  chloride: {
    unit: 'mEq/L',
    optimalMin: 98,
    optimalMax: 106,
    thresholds: [
      { category: 'low', min: 0, max: 97, description: 'Low' },
      { category: 'normal', min: 98, max: 106, description: 'Normal' },
      { category: 'high', min: 107, max: Infinity, description: 'Elevated' },
    ],
  },

  calcium: {
    unit: 'mg/dL',
    optimalMin: 8.5,
    optimalMax: 10.5,
    thresholds: [
      { category: 'low', min: 0, max: 8.4, description: 'Low (hypocalcemia)' },
      { category: 'normal', min: 8.5, max: 10.5, description: 'Normal' },
      { category: 'high', min: 10.6, max: Infinity, description: 'Elevated (hypercalcemia)' },
    ],
  },

  magnesium: {
    unit: 'mg/dL',
    optimalMin: 1.7,
    optimalMax: 2.2,
    thresholds: [
      { category: 'low', min: 0, max: 1.6, description: 'Low (hypomagnesemia)' },
      { category: 'normal', min: 1.7, max: 2.2, description: 'Normal' },
      { category: 'high', min: 2.3, max: Infinity, description: 'Elevated' },
    ],
  },

  phosphorus: {
    unit: 'mg/dL',
    optimalMin: 2.5,
    optimalMax: 4.5,
    thresholds: [
      { category: 'low', min: 0, max: 2.4, description: 'Low' },
      { category: 'normal', min: 2.5, max: 4.5, description: 'Normal' },
      { category: 'high', min: 4.6, max: Infinity, description: 'Elevated' },
    ],
  },

  // ── Vitamin D ──────────────────────────────────────────────────────

  vitaminD25Hydroxy: {
    unit: 'ng/mL',
    optimalMin: 30,
    optimalMax: 80,
    thresholds: [
      { category: 'low', min: 0, max: 19, description: 'Deficient' },
      { category: 'borderline', min: 20, max: 29, description: 'Insufficient' },
      { category: 'optimal', min: 30, max: 80, description: 'Sufficient' },
      { category: 'high', min: 81, max: Infinity, description: 'Elevated (possible toxicity)' },
    ],
  },
} as const;

// ── Interpretation function ────────────────────────────────────────────

/**
 * Classify a lab value against its reference ranges.
 *
 * @param testName - Key from `LAB_RANGES` (matches `LabResult` field names).
 * @param value - The numeric test value.
 * @param sex - Biological sex, required for sex-dependent tests (HDL, hemoglobin, etc.).
 * @returns The matching interpretation or `null` if the test name is unknown.
 */
export function getLabInterpretation(
  testName: string,
  value: number,
  sex?: BiologicalSex,
): LabInterpretation | null {
  const definition = LAB_RANGES[testName];
  if (!definition) {
    return null;
  }

  const thresholds =
    definition.sexDependent && sex && definition.sexThresholds
      ? definition.sexThresholds[sex]
      : definition.thresholds;

  if (!thresholds || thresholds.length === 0) {
    return null;
  }

  // eGFR is sorted descending (higher is better), so we check differently
  const isDescending = testName === 'egfr';

  for (const threshold of thresholds) {
    if (isDescending) {
      if (value >= threshold.min && value <= threshold.max) {
        const isAbnormal = threshold.category !== 'normal';
        return { category: threshold.category, description: threshold.description, isAbnormal };
      }
    } else {
      if (value >= threshold.min && value <= threshold.max) {
        const normalCategories: readonly LabCategory[] = ['normal', 'optimal', 'desirable', 'near_optimal'];
        const isAbnormal = !normalCategories.includes(threshold.category);
        return { category: threshold.category, description: threshold.description, isAbnormal };
      }
    }
  }

  // Fallback: should not reach here with properly defined ranges
  return null;
}
