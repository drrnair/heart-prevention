/**
 * Lab result input validators.
 *
 * These schemas validate user-submitted or AI-extracted lab values at API
 * boundaries. Ranges are intentionally wider than clinical "normal" to
 * accommodate extreme but physiologically possible values.
 */

import { z } from 'zod';
import { ExtractionStatus } from '../types/lab-result';

// ── Nullable bounded number helper ─────────────────────────────────────

/**
 * Create a nullable numeric schema with min/max bounds.
 * Returns `null` when the field is absent, undefined, or null.
 */
function boundedOptNum(min: number, max: number, label: string) {
  return z
    .number()
    .min(min, `${label} must be at least ${min}`)
    .max(max, `${label} must be at most ${max}`)
    .nullable()
    .optional();
}

// ── Lab result input schema ────────────────────────────────────────────

/**
 * Schema for validating lab result data submitted by users or extracted by AI.
 *
 * All lab value fields are optional/nullable because a single report may
 * contain only a subset of tests. Ranges represent physiologically
 * plausible extremes, not clinical reference ranges.
 */
export const labResultInputSchema = z.object({
  reportDate: z.string().date(),

  // ── Lipid panel ─────────────────────────────────────────────────
  totalCholesterol: boundedOptNum(50, 600, 'Total cholesterol'),
  ldlCholesterol: boundedOptNum(10, 400, 'LDL cholesterol'),
  hdlCholesterol: boundedOptNum(5, 150, 'HDL cholesterol'),
  triglycerides: boundedOptNum(20, 5000, 'Triglycerides'),
  vldlCholesterol: boundedOptNum(2, 200, 'VLDL cholesterol'),
  nonHdlCholesterol: boundedOptNum(30, 550, 'Non-HDL cholesterol'),

  // ── Extended lipids ─────────────────────────────────────────────
  apolipoproteinB: boundedOptNum(20, 300, 'Apolipoprotein B'),
  lipoproteinA: boundedOptNum(0.1, 500, 'Lipoprotein(a)'),
  ldlParticleNumber: boundedOptNum(200, 3000, 'LDL particle number'),
  smallDenseLdl: boundedOptNum(0, 200, 'Small dense LDL'),
  oxidizedLdl: boundedOptNum(0, 200, 'Oxidized LDL'),
  remnantCholesterol: boundedOptNum(0, 200, 'Remnant cholesterol'),

  // ── Glycemic markers ────────────────────────────────────────────
  fastingGlucose: boundedOptNum(20, 800, 'Fasting glucose'),
  hba1c: boundedOptNum(3, 20, 'HbA1c'),
  fastingInsulin: boundedOptNum(0.5, 500, 'Fasting insulin'),
  homaIr: boundedOptNum(0, 100, 'HOMA-IR'),

  // ── Renal function ──────────────────────────────────────────────
  creatinine: boundedOptNum(0.1, 30, 'Creatinine'),
  egfr: boundedOptNum(2, 200, 'eGFR'),
  bun: boundedOptNum(1, 200, 'BUN'),
  uricAcid: boundedOptNum(0.5, 20, 'Uric acid'),
  microalbuminCreatinineRatio: boundedOptNum(0, 5000, 'Microalbumin/creatinine ratio'),

  // ── Hepatic function ────────────────────────────────────────────
  alt: boundedOptNum(1, 5000, 'ALT'),
  ast: boundedOptNum(1, 5000, 'AST'),
  alkalinePhosphatase: boundedOptNum(10, 2000, 'Alkaline phosphatase'),
  ggt: boundedOptNum(1, 5000, 'GGT'),
  totalBilirubin: boundedOptNum(0.1, 30, 'Total bilirubin'),
  directBilirubin: boundedOptNum(0, 20, 'Direct bilirubin'),
  albumin: boundedOptNum(1, 7, 'Albumin'),
  totalProtein: boundedOptNum(2, 14, 'Total protein'),

  // ── Inflammatory / cardiac markers ──────────────────────────────
  hsCrp: boundedOptNum(0.1, 300, 'hs-CRP'),
  esr: boundedOptNum(0, 150, 'ESR'),
  homocysteine: boundedOptNum(1, 200, 'Homocysteine'),
  fibrinogen: boundedOptNum(50, 1000, 'Fibrinogen'),
  ntProBnp: boundedOptNum(1, 70000, 'NT-proBNP'),
  troponinI: boundedOptNum(0, 50, 'Troponin I'),

  // ── Hematology ──────────────────────────────────────────────────
  hemoglobin: boundedOptNum(3, 25, 'Hemoglobin'),
  hematocrit: boundedOptNum(10, 75, 'Hematocrit'),
  wbc: boundedOptNum(0.5, 100, 'WBC'),
  plateletCount: boundedOptNum(10, 1500, 'Platelet count'),
  rbc: boundedOptNum(1, 10, 'RBC'),
  mcv: boundedOptNum(50, 150, 'MCV'),
  mch: boundedOptNum(15, 50, 'MCH'),
  mchc: boundedOptNum(20, 45, 'MCHC'),
  rdw: boundedOptNum(8, 30, 'RDW'),

  // ── Thyroid ─────────────────────────────────────────────────────
  tsh: boundedOptNum(0.01, 100, 'TSH'),
  freeT3: boundedOptNum(0.5, 15, 'Free T3'),
  freeT4: boundedOptNum(0.1, 10, 'Free T4'),

  // ── Electrolytes ────────────────────────────────────────────────
  sodium: boundedOptNum(100, 180, 'Sodium'),
  potassium: boundedOptNum(1.5, 9, 'Potassium'),
  chloride: boundedOptNum(70, 130, 'Chloride'),
  calcium: boundedOptNum(4, 16, 'Calcium'),
  magnesium: boundedOptNum(0.5, 5, 'Magnesium'),
  phosphorus: boundedOptNum(0.5, 12, 'Phosphorus'),

  // ── Vitamin D ───────────────────────────────────────────────────
  vitaminD25Hydroxy: boundedOptNum(3, 200, 'Vitamin D (25-OH)'),

  // ── Additional values (catch-all) ───────────────────────────────
  additionalValues: z.record(z.string(), z.number().nullable()).optional(),
});

export type LabResultInput = z.infer<typeof labResultInputSchema>;

/**
 * Schema for the AI extraction metadata attached to a lab result.
 */
export const aiExtractionMetaSchema = z.object({
  model: z.string().min(1),
  extractedAt: z.string().datetime(),
  confidence: z.number().min(0).max(1),
  rawFields: z.record(z.string(), z.unknown()),
});

/**
 * Full lab result creation schema including extraction status.
 */
export const labResultCreateSchema = labResultInputSchema.extend({
  extractionStatus: z.enum(ExtractionStatus).default('pending'),
  uploadedFileUrl: z.string().url().nullable().optional(),
});

export type LabResultCreate = z.infer<typeof labResultCreateSchema>;

// ── Validation helpers ─────────────────────────────────────────────────

/**
 * Check whether total cholesterol is consistent with its components.
 *
 * Friedewald equation: TC ≈ LDL + HDL + (TG / 5)  (when TG < 400)
 *
 * @returns An object indicating whether the values are consistent and
 *   the expected TC based on the Friedewald equation.
 */
export function isLipidPanelConsistent(
  totalCholesterol: number,
  ldl: number,
  hdl: number,
  triglycerides: number,
): { consistent: boolean; expectedTc: number; difference: number } {
  const expectedTc = ldl + hdl + triglycerides / 5;
  const difference = Math.abs(totalCholesterol - expectedTc);
  // Allow 15 mg/dL tolerance for rounding
  return {
    consistent: difference <= 15,
    expectedTc: Math.round(expectedTc),
    difference: Math.round(difference),
  };
}

/**
 * Check whether non-HDL cholesterol is consistent with TC and HDL.
 *
 * Non-HDL = TC - HDL
 */
export function isNonHdlConsistent(
  totalCholesterol: number,
  hdl: number,
  nonHdl: number,
): boolean {
  const expected = totalCholesterol - hdl;
  return Math.abs(nonHdl - expected) <= 5;
}
