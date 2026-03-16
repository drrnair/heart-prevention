import { describe, expect, it } from 'vitest';
import {
  calculatePreliminaryAscvd,
  PreliminaryValidationError,
} from '../src/ascvd-preliminary';
import type {
  NhanesLipidPercentiles,
  NhanesReferenceLookup,
  PreliminaryInput,
} from '../src/types';

// Mock NHANES reference data
const mockNhanesLookup: NhanesReferenceLookup = (
  _age,
  _sex,
  _ethnicity,
): NhanesLipidPercentiles => ({
  p25TotalCholesterol: 175,
  p50TotalCholesterol: 200,
  p75TotalCholesterol: 230,
  p25Hdl: 40,
  p50Hdl: 50,
  p75Hdl: 65,
});

// Age-stratified mock: older adults have slightly different lipids
const ageStratifiedLookup: NhanesReferenceLookup = (
  age,
  _sex,
  _ethnicity,
): NhanesLipidPercentiles => {
  if (age >= 60) {
    return {
      p25TotalCholesterol: 185,
      p50TotalCholesterol: 210,
      p75TotalCholesterol: 245,
      p25Hdl: 38,
      p50Hdl: 48,
      p75Hdl: 62,
    };
  }
  return {
    p25TotalCholesterol: 170,
    p50TotalCholesterol: 195,
    p75TotalCholesterol: 225,
    p25Hdl: 42,
    p50Hdl: 52,
    p75Hdl: 68,
  };
};

describe('Preliminary ASCVD', () => {
  // ── Basic Functionality ────────────────────────────────────────────

  it('should return a preliminary result with confidence bounds', () => {
    const input: PreliminaryInput = {
      demographics: { age: 55, sex: 'male', ethnicity: 'white' },
      vitals: {
        systolicBp: 130,
        onBpMedication: false,
        isSmoker: false,
        hasDiabetes: false,
      },
    };

    const result = calculatePreliminaryAscvd(input, mockNhanesLookup);

    expect(result.isPreliminary).toBe(true);
    expect(result.midpointRisk).toBeGreaterThan(0);
    expect(result.lowerBound).toBeGreaterThan(0);
    expect(result.upperBound).toBeGreaterThan(0);
  });

  // ── Confidence Bands ──────────────────────────────────────────────

  it('should have upper bound >= midpoint >= lower bound', () => {
    const input: PreliminaryInput = {
      demographics: { age: 55, sex: 'male', ethnicity: 'white' },
      vitals: {
        systolicBp: 130,
        onBpMedication: false,
        isSmoker: false,
        hasDiabetes: false,
      },
    };

    const result = calculatePreliminaryAscvd(input, mockNhanesLookup);

    expect(result.upperBound).toBeGreaterThanOrEqual(result.midpointRisk);
    expect(result.midpointRisk).toBeGreaterThanOrEqual(result.lowerBound);
  });

  it('should have wider bands than a single point estimate', () => {
    const input: PreliminaryInput = {
      demographics: { age: 55, sex: 'male', ethnicity: 'white' },
      vitals: {
        systolicBp: 130,
        onBpMedication: false,
        isSmoker: false,
        hasDiabetes: false,
      },
    };

    const result = calculatePreliminaryAscvd(input, mockNhanesLookup);
    const bandWidth = result.upperBound - result.lowerBound;

    expect(bandWidth).toBeGreaterThan(0);
  });

  // ── Imputed Values Match NHANES Medians ───────────────────────────

  it('should report imputed TC and HDL as p50 values', () => {
    const input: PreliminaryInput = {
      demographics: { age: 55, sex: 'male', ethnicity: 'white' },
      vitals: {
        systolicBp: 130,
        onBpMedication: false,
        isSmoker: false,
        hasDiabetes: false,
      },
    };

    const result = calculatePreliminaryAscvd(input, mockNhanesLookup);

    expect(result.imputedTotalCholesterol).toBe(200);
    expect(result.imputedHdl).toBe(50);
  });

  it('should use age-stratified NHANES data when provided', () => {
    const youngInput: PreliminaryInput = {
      demographics: { age: 45, sex: 'male', ethnicity: 'white' },
      vitals: {
        systolicBp: 130,
        onBpMedication: false,
        isSmoker: false,
        hasDiabetes: false,
      },
    };

    const oldInput: PreliminaryInput = {
      demographics: { age: 65, sex: 'male', ethnicity: 'white' },
      vitals: {
        systolicBp: 130,
        onBpMedication: false,
        isSmoker: false,
        hasDiabetes: false,
      },
    };

    const youngResult = calculatePreliminaryAscvd(
      youngInput,
      ageStratifiedLookup,
    );
    const oldResult = calculatePreliminaryAscvd(
      oldInput,
      ageStratifiedLookup,
    );

    // Different imputed values for different ages
    expect(youngResult.imputedTotalCholesterol).toBe(195);
    expect(oldResult.imputedTotalCholesterol).toBe(210);
  });

  // ── Preliminary Flag ──────────────────────────────────────────────

  it('should always set isPreliminary to true', () => {
    const input: PreliminaryInput = {
      demographics: { age: 55, sex: 'female', ethnicity: 'black' },
      vitals: {
        systolicBp: 140,
        onBpMedication: true,
        isSmoker: true,
        hasDiabetes: true,
      },
    };

    const result = calculatePreliminaryAscvd(input, mockNhanesLookup);
    expect(result.isPreliminary).toBe(true);
  });

  // ── Risk Category ─────────────────────────────────────────────────

  it('should assign a risk category based on midpoint', () => {
    const input: PreliminaryInput = {
      demographics: { age: 55, sex: 'male', ethnicity: 'white' },
      vitals: {
        systolicBp: 120,
        onBpMedication: false,
        isSmoker: false,
        hasDiabetes: false,
      },
    };

    const result = calculatePreliminaryAscvd(input, mockNhanesLookup);
    expect(['low', 'borderline', 'intermediate', 'high']).toContain(
      result.riskCategory,
    );
  });

  // ── Age Validation ────────────────────────────────────────────────

  it('should reject age < 20', () => {
    const input: PreliminaryInput = {
      demographics: { age: 19, sex: 'male', ethnicity: 'white' },
      vitals: {
        systolicBp: 120,
        onBpMedication: false,
        isSmoker: false,
        hasDiabetes: false,
      },
    };

    expect(() =>
      calculatePreliminaryAscvd(input, mockNhanesLookup),
    ).toThrow(PreliminaryValidationError);
  });

  it('should reject age > 79', () => {
    const input: PreliminaryInput = {
      demographics: { age: 80, sex: 'male', ethnicity: 'white' },
      vitals: {
        systolicBp: 120,
        onBpMedication: false,
        isSmoker: false,
        hasDiabetes: false,
      },
    };

    expect(() =>
      calculatePreliminaryAscvd(input, mockNhanesLookup),
    ).toThrow(PreliminaryValidationError);
  });

  it('should accept age 20-39 by clamping PCE age to 40', () => {
    const input: PreliminaryInput = {
      demographics: { age: 25, sex: 'male', ethnicity: 'white' },
      vitals: {
        systolicBp: 120,
        onBpMedication: false,
        isSmoker: false,
        hasDiabetes: false,
      },
    };

    const result = calculatePreliminaryAscvd(input, mockNhanesLookup);
    expect(result.isPreliminary).toBe(true);
    expect(result.midpointRisk).toBeGreaterThan(0);
  });

  // ── Female Calculations ───────────────────────────────────────────

  it('should calculate for female patients', () => {
    const input: PreliminaryInput = {
      demographics: { age: 55, sex: 'female', ethnicity: 'white' },
      vitals: {
        systolicBp: 130,
        onBpMedication: false,
        isSmoker: false,
        hasDiabetes: false,
      },
    };

    const result = calculatePreliminaryAscvd(input, mockNhanesLookup);
    expect(result.midpointRisk).toBeGreaterThan(0);
  });

  // ── Higher risk with risk factors ─────────────────────────────────

  it('should show higher risk with more risk factors', () => {
    const lowRiskInput: PreliminaryInput = {
      demographics: { age: 55, sex: 'male', ethnicity: 'white' },
      vitals: {
        systolicBp: 110,
        onBpMedication: false,
        isSmoker: false,
        hasDiabetes: false,
      },
    };

    const highRiskInput: PreliminaryInput = {
      demographics: { age: 55, sex: 'male', ethnicity: 'white' },
      vitals: {
        systolicBp: 160,
        onBpMedication: true,
        isSmoker: true,
        hasDiabetes: true,
      },
    };

    const lowResult = calculatePreliminaryAscvd(lowRiskInput, mockNhanesLookup);
    const highResult = calculatePreliminaryAscvd(
      highRiskInput,
      mockNhanesLookup,
    );

    expect(highResult.midpointRisk).toBeGreaterThan(lowResult.midpointRisk);
  });
});
