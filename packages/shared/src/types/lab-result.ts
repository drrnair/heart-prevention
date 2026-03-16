import { z } from 'zod';

// ── Extraction status ───────────────────────────────────────────────

export const ExtractionStatus = ['pending', 'processing', 'completed', 'failed', 'needs_review'] as const;
export type ExtractionStatus = (typeof ExtractionStatus)[number];

// ── Raw AI extraction payload ───────────────────────────────────────

export const rawAiExtractionSchema = z.object({
  model: z.string(),
  extractedAt: z.string().datetime(),
  confidence: z.number().min(0).max(1),
  rawFields: z.record(z.string(), z.unknown()),
});

export type RawAiExtraction = z.infer<typeof rawAiExtractionSchema>;

// ── Nullable numeric helper ─────────────────────────────────────────

const optNum = z.number().nullable().optional();

// ── Lab result schema ───────────────────────────────────────────────

export const labResultSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  reportDate: z.string().date(),
  uploadedFileUrl: z.string().url().nullable(),
  extractionStatus: z.enum(ExtractionStatus),

  // ── Lipid panel ─────────────────────────────────────────────────
  totalCholesterol: optNum,
  ldlCholesterol: optNum,
  hdlCholesterol: optNum,
  triglycerides: optNum,
  vldlCholesterol: optNum,
  nonHdlCholesterol: optNum,

  // ── Extended lipids ─────────────────────────────────────────────
  apolipoproteinB: optNum,
  lipoproteinA: optNum,
  ldlParticleNumber: optNum,
  smallDenseLdl: optNum,
  oxidizedLdl: optNum,
  remnantCholesterol: optNum,

  // ── Glycemic markers ────────────────────────────────────────────
  fastingGlucose: optNum,
  hba1c: optNum,
  fastingInsulin: optNum,
  homaIr: optNum,

  // ── Renal function ──────────────────────────────────────────────
  creatinine: optNum,
  egfr: optNum,
  bun: optNum,
  uricAcid: optNum,
  microalbuminCreatinineRatio: optNum,

  // ── Hepatic function ────────────────────────────────────────────
  alt: optNum,
  ast: optNum,
  alkalinePhosphatase: optNum,
  ggt: optNum,
  totalBilirubin: optNum,
  directBilirubin: optNum,
  albumin: optNum,
  totalProtein: optNum,

  // ── Inflammatory / cardiac markers ──────────────────────────────
  hsCrp: optNum,
  esr: optNum,
  homocysteine: optNum,
  fibrinogen: optNum,
  ntProBnp: optNum,
  troponinI: optNum,

  // ── Hematology ──────────────────────────────────────────────────
  hemoglobin: optNum,
  hematocrit: optNum,
  wbc: optNum,
  plateletCount: optNum,
  rbc: optNum,
  mcv: optNum,
  mch: optNum,
  mchc: optNum,
  rdw: optNum,

  // ── Thyroid ─────────────────────────────────────────────────────
  tsh: optNum,
  freeT3: optNum,
  freeT4: optNum,

  // ── Electrolytes ────────────────────────────────────────────────
  sodium: optNum,
  potassium: optNum,
  chloride: optNum,
  calcium: optNum,
  magnesium: optNum,
  phosphorus: optNum,

  // ── Vitamin D ───────────────────────────────────────────────────
  vitaminD25Hydroxy: optNum,

  // ── Additional values (catch-all) ───────────────────────────────
  additionalValues: z.record(z.string(), z.number().nullable()).optional(),

  // ── AI extraction metadata ──────────────────────────────────────
  rawAiExtraction: rawAiExtractionSchema.nullable().optional(),

  createdAt: z.string().datetime(),
});

export type LabResult = z.infer<typeof labResultSchema>;
