import { describe, expect, it } from 'vitest';
import {
  calculateAscvd,
  classifyRisk,
  AscvdValidationError,
} from '../src/ascvd-pooled-cohort';
import type { Demographics } from '../src/types';

describe('ASCVD Pooled Cohort Equations', () => {
  // ── Risk Classification ──────────────────────────────────────────────

  describe('classifyRisk', () => {
    it('should classify < 5% as low', () => {
      expect(classifyRisk(4.9)).toBe('low');
    });
    it('should classify 5-7.4% as borderline', () => {
      expect(classifyRisk(5)).toBe('borderline');
      expect(classifyRisk(7.4)).toBe('borderline');
    });
    it('should classify 7.5-19.9% as intermediate', () => {
      expect(classifyRisk(7.5)).toBe('intermediate');
      expect(classifyRisk(19.9)).toBe('intermediate');
    });
    it('should classify >= 20% as high', () => {
      expect(classifyRisk(20)).toBe('high');
      expect(classifyRisk(50)).toBe('high');
    });
  });

  // ── Input Validation ─────────────────────────────────────────────────

  describe('input validation', () => {
    const baseDemographics: Demographics = {
      age: 55,
      sex: 'male',
      ethnicity: 'white',
    };

    it('should reject age < 40', () => {
      expect(() =>
        calculateAscvd(
          { ...baseDemographics, age: 39 },
          200, 50, 120, false, false, false,
        ),
      ).toThrow(AscvdValidationError);
    });

    it('should reject age > 79', () => {
      expect(() =>
        calculateAscvd(
          { ...baseDemographics, age: 80 },
          200, 50, 120, false, false, false,
        ),
      ).toThrow(AscvdValidationError);
    });

    it('should reject TC < 130', () => {
      expect(() =>
        calculateAscvd(baseDemographics, 129, 50, 120, false, false, false),
      ).toThrow(AscvdValidationError);
    });

    it('should reject TC > 320', () => {
      expect(() =>
        calculateAscvd(baseDemographics, 321, 50, 120, false, false, false),
      ).toThrow(AscvdValidationError);
    });

    it('should reject HDL < 20', () => {
      expect(() =>
        calculateAscvd(baseDemographics, 200, 19, 120, false, false, false),
      ).toThrow(AscvdValidationError);
    });

    it('should reject HDL > 100', () => {
      expect(() =>
        calculateAscvd(baseDemographics, 200, 101, 120, false, false, false),
      ).toThrow(AscvdValidationError);
    });

    it('should reject SBP < 90', () => {
      expect(() =>
        calculateAscvd(baseDemographics, 200, 50, 89, false, false, false),
      ).toThrow(AscvdValidationError);
    });

    it('should reject SBP > 200', () => {
      expect(() =>
        calculateAscvd(baseDemographics, 200, 50, 201, false, false, false),
      ).toThrow(AscvdValidationError);
    });

    it('should accept boundary values', () => {
      expect(() =>
        calculateAscvd(
          { ...baseDemographics, age: 40 },
          130, 20, 90, false, false, false,
        ),
      ).not.toThrow();
      expect(() =>
        calculateAscvd(
          { ...baseDemographics, age: 79 },
          320, 100, 200, false, false, false,
        ),
      ).not.toThrow();
    });
  });

  // ── White Female ─────────────────────────────────────────────────────

  describe('white female coefficients', () => {
    it('should calculate risk for a 55yo white female, low risk profile', () => {
      const demographics: Demographics = {
        age: 55,
        sex: 'female',
        ethnicity: 'white',
      };
      const result = calculateAscvd(
        demographics,
        180, // TC
        60,  // HDL
        120, // SBP
        false, // no BP meds
        false, // non-smoker
        false, // no diabetes
      );
      expect(result.coefficientSet).toBe('white_female');
      expect(result.tenYearRisk).toBeGreaterThan(0);
      expect(result.tenYearRisk).toBeLessThan(10);
      expect(result.riskCategory).toBe('low');
    });

    it('should calculate higher risk for smoking + diabetes', () => {
      const demographics: Demographics = {
        age: 60,
        sex: 'female',
        ethnicity: 'white',
      };
      const lowRisk = calculateAscvd(
        demographics, 200, 50, 140, false, false, false,
      );
      const highRisk = calculateAscvd(
        demographics, 200, 50, 140, false, true, true,
      );
      expect(highRisk.tenYearRisk).toBeGreaterThan(lowRisk.tenYearRisk);
    });

    it('should calculate higher risk with BP medication', () => {
      const demographics: Demographics = {
        age: 55,
        sex: 'female',
        ethnicity: 'white',
      };
      const untreated = calculateAscvd(
        demographics, 200, 50, 140, false, false, false,
      );
      const treated = calculateAscvd(
        demographics, 200, 50, 140, true, false, false,
      );
      // Treated SBP coefficient is slightly higher for white women
      expect(treated.tenYearRisk).not.toBe(untreated.tenYearRisk);
    });

    // ACC reference patient: 55yo white female, TC 213, HDL 50, SBP 120,
    // not on BP meds, non-smoker, no diabetes → ~2.1%
    it('should approximate ACC reference for 55yo white female', () => {
      const demographics: Demographics = {
        age: 55,
        sex: 'female',
        ethnicity: 'white',
      };
      const result = calculateAscvd(
        demographics, 213, 50, 120, false, false, false,
      );
      expect(result.tenYearRisk).toBeGreaterThanOrEqual(1.0);
      expect(result.tenYearRisk).toBeLessThanOrEqual(4.0);
      expect(result.riskCategory).toBe('low');
    });
  });

  // ── Black Female ─────────────────────────────────────────────────────

  describe('black female coefficients', () => {
    it('should use black female coefficient set', () => {
      const demographics: Demographics = {
        age: 55,
        sex: 'female',
        ethnicity: 'black',
      };
      const result = calculateAscvd(
        demographics, 200, 50, 130, false, false, false,
      );
      expect(result.coefficientSet).toBe('black_female');
      expect(result.tenYearRisk).toBeGreaterThan(0);
    });

    it('should generally show higher risk than white female (same profile)', () => {
      const baseParams = [200, 45, 140, false, true, false] as const;
      const blackResult = calculateAscvd(
        { age: 55, sex: 'female', ethnicity: 'black' },
        ...baseParams,
      );
      const whiteResult = calculateAscvd(
        { age: 55, sex: 'female', ethnicity: 'white' },
        ...baseParams,
      );
      // Black female coefficients typically yield higher risk
      expect(blackResult.tenYearRisk).toBeGreaterThan(whiteResult.tenYearRisk);
    });
  });

  // ── White Male ───────────────────────────────────────────────────────

  describe('white male coefficients', () => {
    it('should use white male coefficient set', () => {
      const demographics: Demographics = {
        age: 55,
        sex: 'male',
        ethnicity: 'white',
      };
      const result = calculateAscvd(
        demographics, 200, 50, 120, false, false, false,
      );
      expect(result.coefficientSet).toBe('white_male');
    });

    // ACC reference patient: 55yo white male, TC 213, HDL 50, SBP 120,
    // not on BP meds, non-smoker, no diabetes → ~5.3%
    it('should approximate ACC reference for 55yo white male', () => {
      const demographics: Demographics = {
        age: 55,
        sex: 'male',
        ethnicity: 'white',
      };
      const result = calculateAscvd(
        demographics, 213, 50, 120, false, false, false,
      );
      expect(result.tenYearRisk).toBeGreaterThanOrEqual(3.0);
      expect(result.tenYearRisk).toBeLessThanOrEqual(8.0);
    });

    // Higher risk profile: 65yo white male, TC 250, HDL 35, SBP 160,
    // on BP meds, smoker, diabetic → should be high risk
    it('should calculate high risk for multiple risk factors', () => {
      const demographics: Demographics = {
        age: 65,
        sex: 'male',
        ethnicity: 'white',
      };
      const result = calculateAscvd(
        demographics, 250, 35, 160, true, true, true,
      );
      expect(result.riskCategory).toBe('high');
      expect(result.tenYearRisk).toBeGreaterThan(20);
    });
  });

  // ── Black Male ───────────────────────────────────────────────────────

  describe('black male coefficients', () => {
    it('should use black male coefficient set', () => {
      const demographics: Demographics = {
        age: 55,
        sex: 'male',
        ethnicity: 'black',
      };
      const result = calculateAscvd(
        demographics, 200, 50, 130, false, false, false,
      );
      expect(result.coefficientSet).toBe('black_male');
      expect(result.tenYearRisk).toBeGreaterThan(0);
    });
  });

  // ── Ethnicity Adjustments ────────────────────────────────────────────

  describe('ethnicity adjustments', () => {
    const baseProfile = {
      age: 55,
      sex: 'male' as const,
    };

    it('should apply 1.4x multiplier for south_asian', () => {
      const whiteResult = calculateAscvd(
        { ...baseProfile, ethnicity: 'white' },
        200, 50, 130, false, false, false,
      );
      const saResult = calculateAscvd(
        { ...baseProfile, ethnicity: 'south_asian' },
        200, 50, 130, false, false, false,
      );
      // South Asian uses white coefficients × 1.4
      const expectedRatio = saResult.tenYearRisk / whiteResult.tenYearRisk;
      expect(expectedRatio).toBeCloseTo(1.4, 1);
    });

    it('should use white coefficients for hispanic', () => {
      const whiteResult = calculateAscvd(
        { ...baseProfile, ethnicity: 'white' },
        200, 50, 130, false, false, false,
      );
      const hispanicResult = calculateAscvd(
        { ...baseProfile, ethnicity: 'hispanic' },
        200, 50, 130, false, false, false,
      );
      expect(hispanicResult.coefficientSet).toBe('white_male');
      expect(hispanicResult.tenYearRisk).toBe(whiteResult.tenYearRisk);
    });

    it('should use white coefficients for east_asian', () => {
      const whiteResult = calculateAscvd(
        { ...baseProfile, ethnicity: 'white' },
        200, 50, 130, false, false, false,
      );
      const eaResult = calculateAscvd(
        { ...baseProfile, ethnicity: 'east_asian' },
        200, 50, 130, false, false, false,
      );
      expect(eaResult.tenYearRisk).toBe(whiteResult.tenYearRisk);
    });

    it('should use white coefficients for other', () => {
      const whiteResult = calculateAscvd(
        { ...baseProfile, ethnicity: 'white' },
        200, 50, 130, false, false, false,
      );
      const otherResult = calculateAscvd(
        { ...baseProfile, ethnicity: 'other' },
        200, 50, 130, false, false, false,
      );
      expect(otherResult.tenYearRisk).toBe(whiteResult.tenYearRisk);
    });
  });

  // ── Risk increases with age ──────────────────────────────────────────

  describe('risk monotonicity', () => {
    it('should increase risk with age (all else equal)', () => {
      const demographics = (age: number): Demographics => ({
        age,
        sex: 'male',
        ethnicity: 'white',
      });

      const risk40 = calculateAscvd(demographics(40), 200, 50, 130, false, false, false);
      const risk55 = calculateAscvd(demographics(55), 200, 50, 130, false, false, false);
      const risk70 = calculateAscvd(demographics(70), 200, 50, 130, false, false, false);

      expect(risk55.tenYearRisk).toBeGreaterThan(risk40.tenYearRisk);
      expect(risk70.tenYearRisk).toBeGreaterThan(risk55.tenYearRisk);
    });

    it('should increase risk with higher TC (all else equal)', () => {
      const d: Demographics = { age: 55, sex: 'male', ethnicity: 'white' };
      const low = calculateAscvd(d, 150, 50, 130, false, false, false);
      const high = calculateAscvd(d, 280, 50, 130, false, false, false);
      expect(high.tenYearRisk).toBeGreaterThan(low.tenYearRisk);
    });

    it('should decrease risk with higher HDL (all else equal)', () => {
      const d: Demographics = { age: 55, sex: 'male', ethnicity: 'white' };
      const lowHdl = calculateAscvd(d, 200, 30, 130, false, false, false);
      const highHdl = calculateAscvd(d, 200, 80, 130, false, false, false);
      expect(highHdl.tenYearRisk).toBeLessThan(lowHdl.tenYearRisk);
    });

    it('should increase risk with higher SBP (all else equal)', () => {
      const d: Demographics = { age: 55, sex: 'male', ethnicity: 'white' };
      const lowSbp = calculateAscvd(d, 200, 50, 100, false, false, false);
      const highSbp = calculateAscvd(d, 200, 50, 180, false, false, false);
      expect(highSbp.tenYearRisk).toBeGreaterThan(lowSbp.tenYearRisk);
    });
  });
});
