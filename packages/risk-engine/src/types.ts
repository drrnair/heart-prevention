// ── Demographics ──────────────────────────────────────────────────────────────

export type Sex = 'male' | 'female';

export type Ethnicity =
  | 'white'
  | 'black'
  | 'hispanic'
  | 'south_asian'
  | 'east_asian'
  | 'other';

export type Score2Region = 'low' | 'moderate' | 'high' | 'very_high';

export interface Demographics {
  readonly age: number;
  readonly sex: Sex;
  readonly ethnicity: Ethnicity;
}

// ── Vitals ───────────────────────────────────────────────────────────────────

export interface Vitals {
  readonly systolicBp: number;
  readonly onBpMedication: boolean;
  readonly isSmoker: boolean;
  readonly hasDiabetes: boolean;
  /** Weight in kilograms */
  readonly weightKg?: number;
  /** Height in centimeters */
  readonly heightCm?: number;
  /** Waist circumference in centimeters */
  readonly waistCm?: number;
  /** Hip circumference in centimeters */
  readonly hipCm?: number;
}

// ── Labs ─────────────────────────────────────────────────────────────────────

export interface BasicLipids {
  /** Total cholesterol, mg/dL */
  readonly totalCholesterol: number;
  /** LDL cholesterol, mg/dL */
  readonly ldl: number;
  /** HDL cholesterol, mg/dL */
  readonly hdl: number;
  /** Triglycerides, mg/dL */
  readonly triglycerides: number;
}

export interface ExtendedLabs {
  /** Lipoprotein(a), nmol/L */
  readonly lpa?: number;
  /** Apolipoprotein B, mg/dL */
  readonly apoB?: number;
  /** High-sensitivity C-reactive protein, mg/L */
  readonly hsCrp?: number;
  /** Glycated hemoglobin, percentage */
  readonly hba1c?: number;
  /** Fasting glucose, mg/dL */
  readonly fastingGlucose?: number;
}

export interface Labs {
  readonly basicLipids?: BasicLipids;
  readonly extendedLabs?: ExtendedLabs;
}

// ── Imaging ──────────────────────────────────────────────────────────────────

export interface Imaging {
  /** Coronary artery calcium score (Agatston units) */
  readonly cacScore?: number;
  /** Date the CAC scan was performed */
  readonly cacDate?: string;
  /** Whether CTCA (CT coronary angiography) has been performed */
  readonly ctcaPerformed?: boolean;
}

// ── Inputs ───────────────────────────────────────────────────────────────────

/** Full risk input with all available data */
export interface RiskInput {
  readonly demographics: Demographics;
  readonly vitals: Vitals;
  readonly labs?: Labs;
  readonly imaging?: Imaging;
}

/** Preliminary input — demographics + vitals only, no labs or imaging */
export interface PreliminaryInput {
  readonly demographics: Demographics;
  readonly vitals: Vitals;
}

// ── Risk Results ─────────────────────────────────────────────────────────────

export type RiskCategory = 'low' | 'borderline' | 'intermediate' | 'high';

export interface AscvdResult {
  readonly tenYearRisk: number;
  readonly riskCategory: RiskCategory;
  readonly coefficientSet: string;
}

export interface PreliminaryResult {
  readonly midpointRisk: number;
  readonly lowerBound: number;
  readonly upperBound: number;
  readonly isPreliminary: true;
  readonly imputedTotalCholesterol: number;
  readonly imputedHdl: number;
  readonly riskCategory: RiskCategory;
}

export interface FraminghamResult {
  readonly tenYearRisk: number;
  readonly riskCategory: RiskCategory;
}

export interface Score2Result {
  readonly tenYearRisk: number;
  readonly riskCategory: RiskCategory;
  readonly algorithm: 'SCORE2' | 'SCORE2-OP';
  readonly region: Score2Region;
}

export interface MesaCacResult {
  readonly baselineRisk: number;
  readonly adjustedRisk: number;
  readonly cacPercentile: number;
  readonly reclassified: boolean;
  readonly originalCategory: RiskCategory;
  readonly adjustedCategory: RiskCategory;
}

// ── Body Metrics ─────────────────────────────────────────────────────────────

export type BmiCategory =
  | 'underweight'
  | 'normal'
  | 'overweight'
  | 'obese_class_1'
  | 'obese_class_2'
  | 'obese_class_3';

export type WhrRiskLevel = 'low' | 'moderate' | 'high';
export type WhtRiskLevel = 'low' | 'high';

export interface BodyMetricsResult {
  readonly bmi?: number;
  readonly bmiCategory?: BmiCategory;
  readonly waistToHip?: number;
  readonly whrRisk?: WhrRiskLevel;
  readonly waistToHeight?: number;
  readonly whtRisk?: WhtRiskLevel;
  readonly absi?: number;
}

// ── Completeness ─────────────────────────────────────────────────────────────

export type DataLevel = 1 | 2 | 3 | 4;

export interface CompletenessInfo {
  readonly level: DataLevel;
  readonly description: string;
  readonly missingItems: readonly string[];
  readonly nextLevelBenefits: readonly string[];
}

export type CompletenessResult = CompletenessInfo;

// ── Recommendations ──────────────────────────────────────────────────────────

export type RecommendationTier = 1 | 2 | 3 | 4;
export type RecommendationPriority = 'essential' | 'recommended' | 'consider';

export interface RecommendationResult {
  readonly tier: RecommendationTier;
  readonly priority: RecommendationPriority;
  readonly investigation: string;
  readonly rationale: string;
  readonly guidelineReference: string;
}

// ── NHANES Reference Data ────────────────────────────────────────────────────

export interface NhanesLipidPercentiles {
  readonly p25TotalCholesterol: number;
  readonly p50TotalCholesterol: number;
  readonly p75TotalCholesterol: number;
  readonly p25Hdl: number;
  readonly p50Hdl: number;
  readonly p75Hdl: number;
}

export type NhanesReferenceLookup = (
  age: number,
  sex: Sex,
  ethnicity: Ethnicity,
) => NhanesLipidPercentiles;

// ── MESA CAC Reference ──────────────────────────────────────────────────────

export type CacReferenceLookup = (
  age: number,
  sex: Sex,
  ethnicity: Ethnicity,
  cacScore: number,
) => number; // returns percentile 0-100
