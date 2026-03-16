/**
 * ASCVD Pooled Cohort Equations (PCE)
 *
 * Implementation of the 2013 ACC/AHA Pooled Cohort Equations for estimating
 * 10-year atherosclerotic cardiovascular disease risk.
 *
 * Reference: Goff DC Jr, et al. 2013 ACC/AHA Guideline on the Assessment of
 * Cardiovascular Risk. Circulation. 2014;129(25 Suppl 2):S49-S73.
 */

import type {
  AscvdResult,
  Demographics,
  Ethnicity,
  RiskCategory,
  Sex,
} from './types';

// ── Validation ───────────────────────────────────────────────────────────────

export class AscvdValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AscvdValidationError';
  }
}

interface AscvdInputs {
  readonly age: number;
  readonly totalCholesterol: number;
  readonly hdl: number;
  readonly systolicBp: number;
  readonly onBpMedication: boolean;
  readonly isSmoker: boolean;
  readonly hasDiabetes: boolean;
}

function validateInputs(inputs: AscvdInputs): void {
  const { age, totalCholesterol, hdl, systolicBp } = inputs;
  if (age < 40 || age > 79) {
    throw new AscvdValidationError(
      `Age must be between 40 and 79. Received: ${age}`,
    );
  }
  if (totalCholesterol < 130 || totalCholesterol > 320) {
    throw new AscvdValidationError(
      `Total cholesterol must be between 130 and 320 mg/dL. Received: ${totalCholesterol}`,
    );
  }
  if (hdl < 20 || hdl > 100) {
    throw new AscvdValidationError(
      `HDL must be between 20 and 100 mg/dL. Received: ${hdl}`,
    );
  }
  if (systolicBp < 90 || systolicBp > 200) {
    throw new AscvdValidationError(
      `Systolic BP must be between 90 and 200 mmHg. Received: ${systolicBp}`,
    );
  }
}

// ── Coefficient Sets ─────────────────────────────────────────────────────────
// Exact published coefficients from Goff et al. 2013

interface CoefficientSet {
  readonly lnAge: number;
  readonly lnAgeSq?: number;
  readonly lnTc: number;
  readonly lnAgeLnTc?: number;
  readonly lnHdl: number;
  readonly lnAgeLnHdl?: number;
  readonly lnTreatedSbp: number;
  readonly lnUntreatedSbp: number;
  readonly lnAgeLnTreatedSbp: number;
  readonly lnAgeLnUntreatedSbp: number;
  readonly smoker: number;
  readonly lnAgeSmoker?: number;
  readonly diabetes: number;
  readonly meanCoefficientSum: number;
  readonly baselineSurvival: number;
}

const WHITE_FEMALE: CoefficientSet = {
  lnAge: -29.799,
  lnAgeSq: 4.884,
  lnTc: 13.54,
  lnAgeLnTc: -3.114,
  lnHdl: -13.578,
  lnAgeLnHdl: 3.149,
  lnTreatedSbp: 2.019,
  lnUntreatedSbp: 1.957,
  lnAgeLnTreatedSbp: 0,
  lnAgeLnUntreatedSbp: 0,
  smoker: 7.574,
  lnAgeSmoker: -1.665,
  diabetes: 0.661,
  meanCoefficientSum: -29.18,
  baselineSurvival: 0.9665,
};

const BLACK_FEMALE: CoefficientSet = {
  lnAge: 17.114,
  lnTc: 0.94,
  lnHdl: -18.92,
  lnAgeLnHdl: 4.475,
  lnTreatedSbp: 29.291,
  lnAgeLnTreatedSbp: -6.432,
  lnUntreatedSbp: 27.82,
  lnAgeLnUntreatedSbp: -6.087,
  smoker: 0.691,
  diabetes: 0.874,
  meanCoefficientSum: 86.61,
  baselineSurvival: 0.9533,
};

const WHITE_MALE: CoefficientSet = {
  lnAge: 12.344,
  lnTc: 11.853,
  lnAgeLnTc: -2.664,
  lnHdl: -7.99,
  lnAgeLnHdl: 1.769,
  lnTreatedSbp: 1.797,
  lnUntreatedSbp: 1.764,
  lnAgeLnTreatedSbp: 0,
  lnAgeLnUntreatedSbp: 0,
  smoker: 7.837,
  lnAgeSmoker: -1.795,
  diabetes: 0.658,
  meanCoefficientSum: 61.18,
  baselineSurvival: 0.9144,
};

const BLACK_MALE: CoefficientSet = {
  lnAge: 2.469,
  lnTc: 0.302,
  lnHdl: -0.307,
  lnTreatedSbp: 1.916,
  lnUntreatedSbp: 1.809,
  lnAgeLnTreatedSbp: 0,
  lnAgeLnUntreatedSbp: 0,
  smoker: 0.549,
  diabetes: 0.645,
  meanCoefficientSum: 19.54,
  baselineSurvival: 0.8954,
};

// ── Coefficient Selection ────────────────────────────────────────────────────

function selectCoefficientSet(
  sex: Sex,
  ethnicity: Ethnicity,
): { coefficients: CoefficientSet; label: string } {
  const isBlack = ethnicity === 'black';

  if (sex === 'female') {
    return isBlack
      ? { coefficients: BLACK_FEMALE, label: 'black_female' }
      : { coefficients: WHITE_FEMALE, label: 'white_female' };
  }
  return isBlack
    ? { coefficients: BLACK_MALE, label: 'black_male' }
    : { coefficients: WHITE_MALE, label: 'white_male' };
}

// ── Individual Sum Calculation ───────────────────────────────────────────────

function computeIndividualSum(
  coeff: CoefficientSet,
  inputs: AscvdInputs,
): number {
  const lnAge = Math.log(inputs.age);
  const lnTc = Math.log(inputs.totalCholesterol);
  const lnHdl = Math.log(inputs.hdl);
  const lnSbp = Math.log(inputs.systolicBp);

  let sum = 0;

  // Age terms
  sum += coeff.lnAge * lnAge;
  if (coeff.lnAgeSq !== undefined) {
    sum += coeff.lnAgeSq * lnAge * lnAge;
  }

  // Total cholesterol terms
  sum += coeff.lnTc * lnTc;
  if (coeff.lnAgeLnTc !== undefined) {
    sum += coeff.lnAgeLnTc * lnAge * lnTc;
  }

  // HDL terms
  sum += coeff.lnHdl * lnHdl;
  if (coeff.lnAgeLnHdl !== undefined) {
    sum += coeff.lnAgeLnHdl * lnAge * lnHdl;
  }

  // SBP terms (treated vs untreated)
  if (inputs.onBpMedication) {
    sum += coeff.lnTreatedSbp * lnSbp;
    sum += coeff.lnAgeLnTreatedSbp * lnAge * lnSbp;
  } else {
    sum += coeff.lnUntreatedSbp * lnSbp;
    sum += coeff.lnAgeLnUntreatedSbp * lnAge * lnSbp;
  }

  // Smoking terms
  if (inputs.isSmoker) {
    sum += coeff.smoker;
    if (coeff.lnAgeSmoker !== undefined) {
      sum += coeff.lnAgeSmoker * lnAge;
    }
  }

  // Diabetes
  if (inputs.hasDiabetes) {
    sum += coeff.diabetes;
  }

  return sum;
}

// ── Risk Classification ──────────────────────────────────────────────────────

/** Classify 10-year ASCVD risk per ACC/AHA guidelines */
export function classifyRisk(riskPercent: number): RiskCategory {
  if (riskPercent < 5) return 'low';
  if (riskPercent < 7.5) return 'borderline';
  if (riskPercent < 20) return 'intermediate';
  return 'high';
}

// ── Main Calculator ──────────────────────────────────────────────────────────

/**
 * Calculate 10-year ASCVD risk using the Pooled Cohort Equations.
 *
 * @param demographics - Age, sex, and ethnicity
 * @param totalCholesterol - Total cholesterol in mg/dL
 * @param hdl - HDL cholesterol in mg/dL
 * @param systolicBp - Systolic blood pressure in mmHg
 * @param onBpMedication - Whether patient is on BP medication
 * @param isSmoker - Current smoking status
 * @param hasDiabetes - Diabetes status
 * @returns 10-year ASCVD risk result
 */
export function calculateAscvd(
  demographics: Demographics,
  totalCholesterol: number,
  hdl: number,
  systolicBp: number,
  onBpMedication: boolean,
  isSmoker: boolean,
  hasDiabetes: boolean,
): AscvdResult {
  const inputs: AscvdInputs = {
    age: demographics.age,
    totalCholesterol,
    hdl,
    systolicBp,
    onBpMedication,
    isSmoker,
    hasDiabetes,
  };

  validateInputs(inputs);

  const { coefficients, label } = selectCoefficientSet(
    demographics.sex,
    demographics.ethnicity,
  );

  const individualSum = computeIndividualSum(coefficients, inputs);
  const exponent = individualSum - coefficients.meanCoefficientSum;
  let risk = 1 - Math.pow(coefficients.baselineSurvival, Math.exp(exponent));

  // South Asian adjustment: 1.4x multiplier (QRISK-derived)
  if (demographics.ethnicity === 'south_asian') {
    risk *= 1.4;
  }

  // Clamp to [0, 1]
  risk = Math.max(0, Math.min(1, risk));

  const tenYearRisk = risk * 100;

  return {
    tenYearRisk: Math.round(tenYearRisk * 10) / 10,
    riskCategory: classifyRisk(tenYearRisk),
    coefficientSet: label,
  };
}
