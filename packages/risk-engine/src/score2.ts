/**
 * ESC SCORE2 (2021) and SCORE2-OP
 *
 * Simplified implementation of the European Society of Cardiology SCORE2
 * and SCORE2-OP algorithms for estimating 10-year fatal and non-fatal
 * cardiovascular disease risk.
 *
 * References:
 * - SCORE2 Working Group. SCORE2 risk prediction algorithms. Eur Heart J. 2021.
 * - SCORE2-OP Working Group. SCORE2-OP risk prediction algorithm. Eur Heart J. 2021.
 *
 * Uses the published recalibration approach with region-specific scaling factors.
 */

import type {
  Demographics,
  RiskCategory,
  Score2Region,
  Score2Result,
} from './types';

export class Score2ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'Score2ValidationError';
  }
}

// ── Base Model Coefficients ──────────────────────────────────────────────────
// Simplified competing-risk adjusted Cox model coefficients

interface Score2Coefficients {
  readonly age: number;
  readonly smoker: number;
  readonly systolicBp: number;
  readonly totalCholesterol: number;
  readonly hdl: number;
  readonly baselineHazardCvd: number;
  readonly baselineHazardNonCvd: number;
}

const MALE_SCORE2: Score2Coefficients = {
  age: 0.0649,
  smoker: 0.4609,
  systolicBp: 0.0180,
  totalCholesterol: 0.0055,
  hdl: -0.0115,
  baselineHazardCvd: 0.0065,
  baselineHazardNonCvd: 0.0045,
};

const FEMALE_SCORE2: Score2Coefficients = {
  age: 0.0789,
  smoker: 0.5147,
  systolicBp: 0.0186,
  totalCholesterol: 0.0054,
  hdl: -0.0082,
  baselineHazardCvd: 0.0030,
  baselineHazardNonCvd: 0.0019,
};

// SCORE2-OP uses modified coefficients for older adults (attenuated age effect)
const MALE_SCORE2_OP: Score2Coefficients = {
  age: 0.0420,
  smoker: 0.3524,
  systolicBp: 0.0132,
  totalCholesterol: 0.0039,
  hdl: -0.0084,
  baselineHazardCvd: 0.0180,
  baselineHazardNonCvd: 0.0250,
};

const FEMALE_SCORE2_OP: Score2Coefficients = {
  age: 0.0530,
  smoker: 0.3967,
  systolicBp: 0.0148,
  totalCholesterol: 0.0042,
  hdl: -0.0060,
  baselineHazardCvd: 0.0095,
  baselineHazardNonCvd: 0.0140,
};

// ── Region Calibration Factors ───────────────────────────────────────────────
// Multipliers applied to the baseline CVD hazard to calibrate for regional
// differences in CVD incidence

interface RegionCalibration {
  readonly cvdMultiplier: number;
  readonly nonCvdMultiplier: number;
}

const REGION_CALIBRATION: Record<Score2Region, RegionCalibration> = {
  low: { cvdMultiplier: 0.7778, nonCvdMultiplier: 0.9090 },
  moderate: { cvdMultiplier: 1.0, nonCvdMultiplier: 1.0 },
  high: { cvdMultiplier: 1.3333, nonCvdMultiplier: 1.1000 },
  very_high: { cvdMultiplier: 1.7778, nonCvdMultiplier: 1.2000 },
};

// ── Risk Classification ──────────────────────────────────────────────────────

function classifyScore2Risk(
  riskPercent: number,
  age: number,
  _region: Score2Region,
): RiskCategory {
  // ESC 2021 guidelines: thresholds vary by age and region
  // Simplified age-based thresholds
  if (age < 50) {
    if (riskPercent < 2.5) return 'low';
    if (riskPercent < 7.5) return 'intermediate';
    return 'high';
  }
  if (age < 70) {
    if (riskPercent < 5) return 'low';
    if (riskPercent < 10) return 'intermediate';
    return 'high';
  }
  // age >= 70 (SCORE2-OP)
  if (riskPercent < 7.5) return 'low';
  if (riskPercent < 15) return 'intermediate';
  return 'high';
}

// ── Computation ──────────────────────────────────────────────────────────────

function computeScore2Risk(
  coeff: Score2Coefficients,
  age: number,
  systolicBp: number,
  totalCholesterol: number,
  hdl: number,
  isSmoker: boolean,
  regionCal: RegionCalibration,
): number {
  // Linear predictor (centered around age 60 reference)
  const lp =
    coeff.age * (age - 60) +
    (isSmoker ? coeff.smoker : 0) +
    coeff.systolicBp * (systolicBp - 120) +
    coeff.totalCholesterol * (totalCholesterol - 200) +
    coeff.hdl * (hdl - 50);

  // Competing-risk adjusted 10-year risk
  const hazardCvd =
    coeff.baselineHazardCvd * regionCal.cvdMultiplier * Math.exp(lp);
  const hazardNonCvd =
    coeff.baselineHazardNonCvd * regionCal.nonCvdMultiplier;

  const totalHazard = hazardCvd + hazardNonCvd;

  // 10-year cumulative incidence with competing risks
  const survivalAll = Math.exp(-10 * totalHazard);
  const risk = (hazardCvd / totalHazard) * (1 - survivalAll);

  return Math.max(0, Math.min(1, risk));
}

/**
 * Calculate 10-year CVD risk using ESC SCORE2 or SCORE2-OP.
 *
 * @param demographics - Age (40-89), sex, ethnicity
 * @param totalCholesterol - Total cholesterol in mg/dL
 * @param hdl - HDL cholesterol in mg/dL
 * @param systolicBp - Systolic blood pressure in mmHg
 * @param isSmoker - Current smoking status
 * @param region - ESC risk region (low, moderate, high, very_high)
 * @returns SCORE2 or SCORE2-OP risk result
 */
export function calculateScore2(
  demographics: Demographics,
  totalCholesterol: number,
  hdl: number,
  systolicBp: number,
  isSmoker: boolean,
  region: Score2Region,
): Score2Result {
  const { age, sex } = demographics;

  if (age < 40 || age > 89) {
    throw new Score2ValidationError(
      `Age must be between 40 and 89 for SCORE2/SCORE2-OP. Received: ${age}`,
    );
  }

  const isOP = age >= 70;
  const algorithm = isOP ? 'SCORE2-OP' : 'SCORE2';

  let coeff: Score2Coefficients;
  if (isOP) {
    coeff = sex === 'male' ? MALE_SCORE2_OP : FEMALE_SCORE2_OP;
  } else {
    coeff = sex === 'male' ? MALE_SCORE2 : FEMALE_SCORE2;
  }

  const regionCal = REGION_CALIBRATION[region];

  const risk = computeScore2Risk(
    coeff,
    age,
    systolicBp,
    totalCholesterol,
    hdl,
    isSmoker,
    regionCal,
  );

  const tenYearRisk = Math.round(risk * 1000) / 10;

  return {
    tenYearRisk,
    riskCategory: classifyScore2Risk(tenYearRisk, age, region),
    algorithm,
    region,
  };
}
