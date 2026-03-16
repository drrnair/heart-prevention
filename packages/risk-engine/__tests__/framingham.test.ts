import { describe, expect, it } from 'vitest';
import {
  calculateFramingham,
  FraminghamValidationError,
} from '../src/framingham';
import type { Demographics } from '../src/types';

describe('Framingham General CVD Risk', () => {
  // ── Input Validation ─────────────────────────────────────────────

  describe('validation', () => {
    it('should reject age < 30', () => {
      expect(() =>
        calculateFramingham(
          { age: 29, sex: 'male', ethnicity: 'white' },
          200, 50, 120, false, false, false,
        ),
      ).toThrow(FraminghamValidationError);
    });

    it('should reject age > 74', () => {
      expect(() =>
        calculateFramingham(
          { age: 75, sex: 'male', ethnicity: 'white' },
          200, 50, 120, false, false, false,
        ),
      ).toThrow(FraminghamValidationError);
    });

    it('should accept age 30', () => {
      expect(() =>
        calculateFramingham(
          { age: 30, sex: 'male', ethnicity: 'white' },
          200, 50, 120, false, false, false,
        ),
      ).not.toThrow();
    });

    it('should accept age 74', () => {
      expect(() =>
        calculateFramingham(
          { age: 74, sex: 'male', ethnicity: 'white' },
          200, 50, 120, false, false, false,
        ),
      ).not.toThrow();
    });
  });

  // ── Male Calculations ────────────────────────────────────────────

  describe('male risk calculation', () => {
    it('should calculate risk for a low-risk 50yo male', () => {
      const demographics: Demographics = {
        age: 50,
        sex: 'male',
        ethnicity: 'white',
      };
      const result = calculateFramingham(
        demographics,
        180, // TC
        55,  // HDL
        120, // SBP
        false, // no BP meds
        false, // non-smoker
        false, // no diabetes
      );

      expect(result.tenYearRisk).toBeGreaterThan(0);
      expect(result.tenYearRisk).toBeLessThan(15);
    });

    it('should calculate higher risk for multiple risk factors', () => {
      const demographics: Demographics = {
        age: 60,
        sex: 'male',
        ethnicity: 'white',
      };
      const result = calculateFramingham(
        demographics,
        250, // TC
        35,  // HDL
        160, // SBP
        true,  // BP meds
        true,  // smoker
        true,  // diabetes
      );

      expect(result.tenYearRisk).toBeGreaterThan(30);
      expect(result.riskCategory).toBe('high');
    });

    // D'Agostino 2008 example: 53yo male, TC 161, HDL 55, SBP 125,
    // untreated, non-smoker, no diabetes → ~8%
    it('should approximate published example for male', () => {
      const demographics: Demographics = {
        age: 53,
        sex: 'male',
        ethnicity: 'white',
      };
      const result = calculateFramingham(
        demographics, 161, 55, 125, false, false, false,
      );

      expect(result.tenYearRisk).toBeGreaterThanOrEqual(4);
      expect(result.tenYearRisk).toBeLessThanOrEqual(15);
    });
  });

  // ── Female Calculations ──────────────────────────────────────────

  describe('female risk calculation', () => {
    it('should calculate risk for a low-risk 50yo female', () => {
      const demographics: Demographics = {
        age: 50,
        sex: 'female',
        ethnicity: 'white',
      };
      const result = calculateFramingham(
        demographics,
        180, // TC
        60,  // HDL
        120, // SBP
        false,
        false,
        false,
      );

      expect(result.tenYearRisk).toBeGreaterThan(0);
      expect(result.tenYearRisk).toBeLessThan(10);
    });

    // D'Agostino 2008 example: 61yo female, TC 180, HDL 47, SBP 124,
    // treated, non-smoker, no diabetes → ~12%
    it('should approximate published example for female', () => {
      const demographics: Demographics = {
        age: 61,
        sex: 'female',
        ethnicity: 'white',
      };
      const result = calculateFramingham(
        demographics, 180, 47, 124, true, false, false,
      );

      expect(result.tenYearRisk).toBeGreaterThanOrEqual(5);
      expect(result.tenYearRisk).toBeLessThanOrEqual(20);
    });

    it('should show lower risk for females than males (same profile)', () => {
      const maleResult = calculateFramingham(
        { age: 55, sex: 'male', ethnicity: 'white' },
        200, 50, 130, false, false, false,
      );
      const femaleResult = calculateFramingham(
        { age: 55, sex: 'female', ethnicity: 'white' },
        200, 50, 130, false, false, false,
      );

      expect(femaleResult.tenYearRisk).toBeLessThan(maleResult.tenYearRisk);
    });
  });

  // ── Risk Factor Impact ───────────────────────────────────────────

  describe('risk factor direction', () => {
    const baseDemographics: Demographics = {
      age: 55,
      sex: 'male',
      ethnicity: 'white',
    };

    it('smoking should increase risk', () => {
      const noSmoke = calculateFramingham(
        baseDemographics, 200, 50, 130, false, false, false,
      );
      const smoke = calculateFramingham(
        baseDemographics, 200, 50, 130, false, true, false,
      );
      expect(smoke.tenYearRisk).toBeGreaterThan(noSmoke.tenYearRisk);
    });

    it('diabetes should increase risk', () => {
      const noDm = calculateFramingham(
        baseDemographics, 200, 50, 130, false, false, false,
      );
      const dm = calculateFramingham(
        baseDemographics, 200, 50, 130, false, false, true,
      );
      expect(dm.tenYearRisk).toBeGreaterThan(noDm.tenYearRisk);
    });

    it('higher TC should increase risk', () => {
      const lowTc = calculateFramingham(
        baseDemographics, 150, 50, 130, false, false, false,
      );
      const highTc = calculateFramingham(
        baseDemographics, 280, 50, 130, false, false, false,
      );
      expect(highTc.tenYearRisk).toBeGreaterThan(lowTc.tenYearRisk);
    });

    it('higher HDL should decrease risk', () => {
      const lowHdl = calculateFramingham(
        baseDemographics, 200, 30, 130, false, false, false,
      );
      const highHdl = calculateFramingham(
        baseDemographics, 200, 80, 130, false, false, false,
      );
      expect(highHdl.tenYearRisk).toBeLessThan(lowHdl.tenYearRisk);
    });

    it('treated SBP should show slightly different risk than untreated', () => {
      const untreated = calculateFramingham(
        baseDemographics, 200, 50, 140, false, false, false,
      );
      const treated = calculateFramingham(
        baseDemographics, 200, 50, 140, true, false, false,
      );
      expect(treated.tenYearRisk).not.toEqual(untreated.tenYearRisk);
    });
  });

  // ── Risk Categories ──────────────────────────────────────────────

  describe('risk categories', () => {
    it('should return valid risk categories', () => {
      const validCategories = ['low', 'borderline', 'intermediate', 'high'];
      const result = calculateFramingham(
        { age: 55, sex: 'male', ethnicity: 'white' },
        200, 50, 130, false, false, false,
      );
      expect(validCategories).toContain(result.riskCategory);
    });
  });
});
