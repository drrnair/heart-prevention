import { describe, expect, it } from 'vitest';
import { calculateScore2, Score2ValidationError } from '../src/score2';
import type { Demographics, Score2Region } from '../src/types';

describe('SCORE2 / SCORE2-OP', () => {
  const baseDemographics: Demographics = {
    age: 55,
    sex: 'male',
    ethnicity: 'white',
  };

  // ── Validation ───────────────────────────────────────────────────

  describe('validation', () => {
    it('should reject age < 40', () => {
      expect(() =>
        calculateScore2(
          { ...baseDemographics, age: 39 },
          200, 50, 130, false, 'moderate',
        ),
      ).toThrow(Score2ValidationError);
    });

    it('should reject age > 89', () => {
      expect(() =>
        calculateScore2(
          { ...baseDemographics, age: 90 },
          200, 50, 130, false, 'moderate',
        ),
      ).toThrow(Score2ValidationError);
    });

    it('should accept age 40', () => {
      expect(() =>
        calculateScore2(
          { ...baseDemographics, age: 40 },
          200, 50, 130, false, 'moderate',
        ),
      ).not.toThrow();
    });

    it('should accept age 89', () => {
      expect(() =>
        calculateScore2(
          { ...baseDemographics, age: 89 },
          200, 50, 130, false, 'moderate',
        ),
      ).not.toThrow();
    });
  });

  // ── Algorithm Selection ──────────────────────────────────────────

  describe('algorithm selection', () => {
    it('should use SCORE2 for ages 40-69', () => {
      const result = calculateScore2(
        { ...baseDemographics, age: 55 },
        200, 50, 130, false, 'moderate',
      );
      expect(result.algorithm).toBe('SCORE2');
    });

    it('should use SCORE2-OP for ages 70-89', () => {
      const result = calculateScore2(
        { ...baseDemographics, age: 75 },
        200, 50, 130, false, 'moderate',
      );
      expect(result.algorithm).toBe('SCORE2-OP');
    });

    it('should use SCORE2 at age 69', () => {
      const result = calculateScore2(
        { ...baseDemographics, age: 69 },
        200, 50, 130, false, 'moderate',
      );
      expect(result.algorithm).toBe('SCORE2');
    });

    it('should use SCORE2-OP at age 70', () => {
      const result = calculateScore2(
        { ...baseDemographics, age: 70 },
        200, 50, 130, false, 'moderate',
      );
      expect(result.algorithm).toBe('SCORE2-OP');
    });
  });

  // ── Region Calibration ───────────────────────────────────────────

  describe('region calibration', () => {
    const regions: Score2Region[] = ['low', 'moderate', 'high', 'very_high'];

    it('should produce increasing risk across regions (low to very_high)', () => {
      const results = regions.map((region) =>
        calculateScore2(baseDemographics, 200, 50, 140, true, region),
      );

      for (let i = 1; i < results.length; i++) {
        expect(results[i]!.tenYearRisk).toBeGreaterThanOrEqual(
          results[i - 1]!.tenYearRisk,
        );
      }
    });

    it('should include region in result', () => {
      const result = calculateScore2(
        baseDemographics, 200, 50, 130, false, 'high',
      );
      expect(result.region).toBe('high');
    });
  });

  // ── Risk Factor Direction ────────────────────────────────────────

  describe('risk factor direction', () => {
    it('should increase risk with age', () => {
      const young = calculateScore2(
        { ...baseDemographics, age: 45 },
        200, 50, 130, false, 'moderate',
      );
      const old = calculateScore2(
        { ...baseDemographics, age: 65 },
        200, 50, 130, false, 'moderate',
      );
      expect(old.tenYearRisk).toBeGreaterThan(young.tenYearRisk);
    });

    it('should increase risk with smoking', () => {
      const noSmoke = calculateScore2(
        baseDemographics, 200, 50, 130, false, 'moderate',
      );
      const smoke = calculateScore2(
        baseDemographics, 200, 50, 130, true, 'moderate',
      );
      expect(smoke.tenYearRisk).toBeGreaterThan(noSmoke.tenYearRisk);
    });

    it('should increase risk with higher SBP', () => {
      const lowSbp = calculateScore2(
        baseDemographics, 200, 50, 110, false, 'moderate',
      );
      const highSbp = calculateScore2(
        baseDemographics, 200, 50, 170, false, 'moderate',
      );
      expect(highSbp.tenYearRisk).toBeGreaterThan(lowSbp.tenYearRisk);
    });

    it('should increase risk with higher TC', () => {
      const lowTc = calculateScore2(
        baseDemographics, 150, 50, 130, false, 'moderate',
      );
      const highTc = calculateScore2(
        baseDemographics, 280, 50, 130, false, 'moderate',
      );
      expect(highTc.tenYearRisk).toBeGreaterThan(lowTc.tenYearRisk);
    });

    it('should decrease risk with higher HDL', () => {
      const lowHdl = calculateScore2(
        baseDemographics, 200, 30, 130, false, 'moderate',
      );
      const highHdl = calculateScore2(
        baseDemographics, 200, 80, 130, false, 'moderate',
      );
      expect(highHdl.tenYearRisk).toBeLessThan(lowHdl.tenYearRisk);
    });
  });

  // ── Sex Differences ──────────────────────────────────────────────

  describe('sex differences', () => {
    it('should generally show lower risk for females', () => {
      const male = calculateScore2(
        baseDemographics, 200, 50, 130, false, 'moderate',
      );
      const female = calculateScore2(
        { ...baseDemographics, sex: 'female' },
        200, 50, 130, false, 'moderate',
      );
      expect(female.tenYearRisk).toBeLessThan(male.tenYearRisk);
    });
  });

  // ── Risk Categories ──────────────────────────────────────────────

  describe('risk categories', () => {
    it('should return valid risk categories', () => {
      const validCategories = ['low', 'borderline', 'intermediate', 'high'];
      const result = calculateScore2(
        baseDemographics, 200, 50, 130, false, 'moderate',
      );
      expect(validCategories).toContain(result.riskCategory);
    });

    it('should classify high-risk profile correctly', () => {
      const result = calculateScore2(
        { ...baseDemographics, age: 65 },
        280, 30, 180, true, 'very_high',
      );
      expect(result.riskCategory).toBe('high');
    });
  });

  // ── Plausible Ranges ─────────────────────────────────────────────

  describe('plausible risk ranges', () => {
    it('should produce risk between 0 and 100', () => {
      const result = calculateScore2(
        baseDemographics, 200, 50, 130, false, 'moderate',
      );
      expect(result.tenYearRisk).toBeGreaterThanOrEqual(0);
      expect(result.tenYearRisk).toBeLessThanOrEqual(100);
    });

    it('should produce moderate risk for a typical 55yo male smoker', () => {
      const result = calculateScore2(
        baseDemographics, 220, 45, 145, true, 'moderate',
      );
      expect(result.tenYearRisk).toBeGreaterThan(3);
      expect(result.tenYearRisk).toBeLessThan(30);
    });
  });
});
