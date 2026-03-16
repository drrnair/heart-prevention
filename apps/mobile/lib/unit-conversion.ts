/**
 * Unit conversion utilities for displaying health values
 * in the user's preferred unit system.
 */

// Cholesterol: mg/dL <-> mmol/L (factor: 0.02586)
export const mgdlToMmolChol = (v: number): number => +(v * 0.02586).toFixed(2);
export const mmolToMgdlChol = (v: number): number => +(v / 0.02586).toFixed(0);

// Triglycerides: mg/dL <-> mmol/L (factor: 0.01129)
export const mgdlToMmolTG = (v: number): number => +(v * 0.01129).toFixed(2);
export const mmolToMgdlTG = (v: number): number => +(v / 0.01129).toFixed(0);

// Glucose: mg/dL -> mmol/L (factor: 0.05551)
export const mgdlToMmolGlucose = (v: number): number => +(v * 0.05551).toFixed(1);

// Anthropometric
export const cmToInches = (v: number): number => +(v / 2.54).toFixed(1);
export const inchesToCm = (v: number): number => +(v * 2.54).toFixed(1);
export const kgToLbs = (v: number): number => +(v * 2.20462).toFixed(1);
export const lbsToKg = (v: number): number => +(v / 2.20462).toFixed(1);
export const cmToFeetInches = (cm: number): string => {
  const totalInches = cm / 2.54;
  return `${Math.floor(totalInches / 12)}'${Math.round(totalInches % 12)}"`;
};
