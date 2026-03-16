/**
 * Framingham General Cardiovascular Disease Risk Score
 *
 * Implementation of the general CVD risk prediction model from:
 * D'Agostino RB Sr, et al. General Cardiovascular Risk Profile for Use in
 * Primary Care: The Framingham Heart Study. Circulation. 2008;117(6):743-753.
 *
 * Predicts 10-year risk of a first cardiovascular event (coronary death,
 * myocardial infarction, coronary insufficiency, angina, ischemic stroke,
 * hemorrhagic stroke, TIA, PAD, heart failure).
 */

import type { Demographics, FraminghamResult, RiskCategory, Sex } from './types';

export class FraminghamValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FraminghamValidationError';
  }
}

// ── Coefficients ─────────────────────────────────────────────────────────────
// D'Agostino et al. 2008, Table 3

interface FraminghamCoefficients {
  readonly lnAge: number;
  readonly lnTc: number;
  readonly lnHdl: number;
  readonly lnSbpTreated: number;
  readonly lnSbpUntreated: number;
  readonly smoker: number;
  readonly diabetes: number;
  readonly meanSum: number;
  readonly baselineSurvival: number;
}

const MALE_COEFFICIENTS: FraminghamCoefficients = {
  lnAge: 3.06117,
  lnTc: 1.1237,
  lnHdl: -0.93263,
  lnSbpTreated: 1.99881,
  lnSbpUntreated: 1.93303,
  smoker: 0.65451,
  diabetes: 0.57367,
  meanSum: 23.9802,
  baselineSurvival: 0.88936,
};

const FEMALE_COEFFICIENTS: FraminghamCoefficients = {
  lnAge: 2.32888,
  lnTc: 1.20904,
  lnHdl: -0.70833,
  lnSbpTreated: 2.82263,
  lnSbpUntreated: 2.76157,
  smoker: 0.52873,
  diabetes: 0.69154,
  meanSum: 26.1931,
  baselineSurvival: 0.95012,
};

function selectCoefficients(sex: Sex): FraminghamCoefficients {
  return sex === 'male' ? MALE_COEFFICIENTS : FEMALE_COEFFICIENTS;
}

function classifyFraminghamRisk(riskPercent: number): RiskCategory {
  if (riskPercent < 5) return 'low';
  if (riskPercent < 10) return 'borderline';
  if (riskPercent < 20) return 'intermediate';
  return 'high';
}

/**
 * Calculate 10-year general CVD risk using the Framingham equation.
 *
 * @param demographics - Age (30-74), sex, ethnicity
 * @param totalCholesterol - Total cholesterol in mg/dL
 * @param hdl - HDL cholesterol in mg/dL
 * @param systolicBp - Systolic blood pressure in mmHg
 * @param onBpMedication - Whether patient is on BP medication
 * @param isSmoker - Current smoking status
 * @param hasDiabetes - Diabetes status
 * @returns 10-year general CVD risk result
 */
export function calculateFramingham(
  demographics: Demographics,
  totalCholesterol: number,
  hdl: number,
  systolicBp: number,
  onBpMedication: boolean,
  isSmoker: boolean,
  hasDiabetes: boolean,
): FraminghamResult {
  const { age, sex } = demographics;

  if (age < 30 || age > 74) {
    throw new FraminghamValidationError(
      `Age must be between 30 and 74 for Framingham. Received: ${age}`,
    );
  }

  const coeff = selectCoefficients(sex);

  let sum = 0;
  sum += coeff.lnAge * Math.log(age);
  sum += coeff.lnTc * Math.log(totalCholesterol);
  sum += coeff.lnHdl * Math.log(hdl);

  if (onBpMedication) {
    sum += coeff.lnSbpTreated * Math.log(systolicBp);
  } else {
    sum += coeff.lnSbpUntreated * Math.log(systolicBp);
  }

  if (isSmoker) {
    sum += coeff.smoker;
  }

  if (hasDiabetes) {
    sum += coeff.diabetes;
  }

  const exponent = sum - coeff.meanSum;
  let risk = 1 - Math.pow(coeff.baselineSurvival, Math.exp(exponent));

  risk = Math.max(0, Math.min(1, risk));
  const tenYearRisk = Math.round(risk * 1000) / 10;

  return {
    tenYearRisk,
    riskCategory: classifyFraminghamRisk(tenYearRisk),
  };
}
