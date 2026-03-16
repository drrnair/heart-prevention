/**
 * Preliminary ASCVD Risk Estimation
 *
 * Estimates 10-year ASCVD risk when lipid labs are unavailable by imputing
 * lipid values from NHANES population medians stratified by age, sex, and
 * ethnicity. Produces confidence bounds using p25/p75 lipid values.
 */

import { calculateAscvd, classifyRisk } from './ascvd-pooled-cohort';
import type {
  Demographics,
  NhanesReferenceLookup,
  PreliminaryInput,
  PreliminaryResult,
} from './types';

export class PreliminaryValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PreliminaryValidationError';
  }
}

/**
 * Calculate preliminary ASCVD risk using NHANES-imputed lipid values.
 *
 * Runs the PCE three times with p25, p50, and p75 lipid values to produce
 * a midpoint estimate with confidence bounds.
 *
 * @param input - Demographics and vitals (no labs required)
 * @param nhanesLookup - Function to retrieve NHANES lipid percentiles
 * @returns Preliminary risk result with confidence bounds
 */
export function calculatePreliminaryAscvd(
  input: PreliminaryInput,
  nhanesLookup: NhanesReferenceLookup,
): PreliminaryResult {
  const { demographics, vitals } = input;
  const { age } = demographics;

  if (age < 20 || age > 79) {
    throw new PreliminaryValidationError(
      `Age must be between 20 and 79 for preliminary assessment. Received: ${age}`,
    );
  }

  const lipids = nhanesLookup(age, demographics.sex, demographics.ethnicity);

  // Clamp age to 40-79 for PCE (below 40 we still compute but using 40 as floor)
  const pceAge = Math.max(40, age);
  const pceDemographics: Demographics = {
    ...demographics,
    age: pceAge,
  };

  // Run PCE with p50 (midpoint)
  const midResult = calculateAscvd(
    pceDemographics,
    lipids.p50TotalCholesterol,
    lipids.p50Hdl,
    vitals.systolicBp,
    vitals.onBpMedication,
    vitals.isSmoker,
    vitals.hasDiabetes,
  );

  // For bounds, use worst-case lipid combinations:
  // Higher TC + lower HDL = higher risk (upper bound)
  // Lower TC + higher HDL = lower risk (lower bound)
  const upperResult = calculateAscvd(
    pceDemographics,
    lipids.p75TotalCholesterol,
    lipids.p25Hdl,
    vitals.systolicBp,
    vitals.onBpMedication,
    vitals.isSmoker,
    vitals.hasDiabetes,
  );

  const lowerResult = calculateAscvd(
    pceDemographics,
    lipids.p25TotalCholesterol,
    lipids.p75Hdl,
    vitals.systolicBp,
    vitals.onBpMedication,
    vitals.isSmoker,
    vitals.hasDiabetes,
  );

  return {
    midpointRisk: midResult.tenYearRisk,
    lowerBound: lowerResult.tenYearRisk,
    upperBound: upperResult.tenYearRisk,
    isPreliminary: true,
    imputedTotalCholesterol: lipids.p50TotalCholesterol,
    imputedHdl: lipids.p50Hdl,
    riskCategory: classifyRisk(midResult.tenYearRisk),
  };
}
