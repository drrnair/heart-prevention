/**
 * MESA CAC-Based Risk Reclassification
 *
 * Adjusts baseline ASCVD risk using coronary artery calcium (CAC) score
 * based on data from the Multi-Ethnic Study of Atherosclerosis (MESA).
 *
 * Reference: Budoff MJ, et al. Ten-year association of coronary artery
 * calcium with atherosclerotic cardiovascular disease (ASCVD) events:
 * the Multi-Ethnic Study of Atherosclerosis (MESA). Eur Heart J. 2018.
 */

import { classifyRisk } from './ascvd-pooled-cohort';
import type {
  CacReferenceLookup,
  Ethnicity,
  MesaCacResult,
  RiskCategory,
  Sex,
} from './types';

export class MesaCacValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MesaCacValidationError';
  }
}

/**
 * Look up CAC percentile for a given patient and CAC score.
 *
 * @param age - Patient age
 * @param sex - Patient sex
 * @param ethnicity - Patient ethnicity
 * @param cacScore - Coronary artery calcium score (Agatston units)
 * @param referenceData - External reference lookup function
 * @returns Percentile (0-100)
 */
export function lookupCacPercentile(
  age: number,
  sex: Sex,
  ethnicity: Ethnicity,
  cacScore: number,
  referenceData: CacReferenceLookup,
): number {
  if (cacScore < 0) {
    throw new MesaCacValidationError(
      `CAC score cannot be negative. Received: ${cacScore}`,
    );
  }
  return referenceData(age, sex, ethnicity, cacScore);
}

// ── Hazard Ratio by CAC Score ────────────────────────────────────────────────

/**
 * Determine the hazard ratio multiplier based on CAC score.
 *
 * CAC = 0:       HR ~0.5 (very low risk, strong negative predictor)
 * CAC 1-100:     HR 1.0-1.5 (mild, linearly interpolated)
 * CAC 101-300:   HR 1.5-2.5 (moderate, linearly interpolated)
 * CAC 301+:      HR 3.0-4.0 (severe, capped at 4.0)
 */
function getHazardRatio(cacScore: number): number {
  if (cacScore === 0) {
    return 0.5;
  }
  if (cacScore <= 100) {
    // Linear interpolation from 1.0 (CAC=1) to 1.5 (CAC=100)
    return 1.0 + (cacScore - 1) * (0.5 / 99);
  }
  if (cacScore <= 300) {
    // Linear interpolation from 1.5 (CAC=101) to 2.5 (CAC=300)
    return 1.5 + (cacScore - 100) * (1.0 / 200);
  }
  // CAC > 300: 3.0 base, scaling up to 4.0 at CAC=1000, capped at 4.0
  const hr = 3.0 + Math.min(cacScore - 300, 700) * (1.0 / 700);
  return Math.min(hr, 4.0);
}

/**
 * Adjust baseline ASCVD risk using CAC score data.
 *
 * @param baselineRisk - Baseline 10-year ASCVD risk percentage (0-100)
 * @param cacScore - Coronary artery calcium score (Agatston units)
 * @param cacPercentile - CAC percentile for the patient's demographic group
 * @returns Adjusted risk with reclassification information
 */
export function adjustRiskByCac(
  baselineRisk: number,
  cacScore: number,
  cacPercentile: number,
): MesaCacResult {
  if (cacScore < 0) {
    throw new MesaCacValidationError(
      `CAC score cannot be negative. Received: ${cacScore}`,
    );
  }
  if (cacPercentile < 0 || cacPercentile > 100) {
    throw new MesaCacValidationError(
      `CAC percentile must be between 0 and 100. Received: ${cacPercentile}`,
    );
  }

  const hazardRatio = getHazardRatio(cacScore);
  let adjustedRiskPercent = baselineRisk * hazardRatio;

  // Clamp to reasonable range
  adjustedRiskPercent = Math.max(0, Math.min(100, adjustedRiskPercent));
  adjustedRiskPercent = Math.round(adjustedRiskPercent * 10) / 10;

  const originalCategory: RiskCategory = classifyRisk(baselineRisk);
  const adjustedCategory: RiskCategory = classifyRisk(adjustedRiskPercent);

  return {
    baselineRisk,
    adjustedRisk: adjustedRiskPercent,
    cacPercentile,
    reclassified: originalCategory !== adjustedCategory,
    originalCategory,
    adjustedCategory,
  };
}
