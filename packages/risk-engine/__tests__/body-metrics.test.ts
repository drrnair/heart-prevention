import { describe, expect, it } from 'vitest';
import {
  calculateAbsi,
  calculateBmi,
  calculateWaistToHeight,
  calculateWaistToHip,
  interpretBmi,
  interpretWhr,
  interpretWhtR,
} from '../src/body-metrics';

describe('Body Metrics', () => {
  // ── BMI ──────────────────────────────────────────────────────────

  describe('calculateBmi', () => {
    it('should calculate BMI correctly for normal weight', () => {
      // 70kg, 175cm → BMI ~22.9
      expect(calculateBmi(70, 175)).toBeCloseTo(22.9, 1);
    });

    it('should calculate BMI correctly for overweight', () => {
      // 85kg, 175cm → BMI ~27.8
      expect(calculateBmi(85, 175)).toBeCloseTo(27.8, 1);
    });

    it('should calculate BMI correctly for obese', () => {
      // 110kg, 175cm → BMI ~35.9
      expect(calculateBmi(110, 175)).toBeCloseTo(35.9, 1);
    });

    it('should calculate BMI correctly for short height', () => {
      // 60kg, 150cm → BMI ~26.7
      expect(calculateBmi(60, 150)).toBeCloseTo(26.7, 1);
    });

    it('should throw for zero weight', () => {
      expect(() => calculateBmi(0, 175)).toThrow();
    });

    it('should throw for negative height', () => {
      expect(() => calculateBmi(70, -175)).toThrow();
    });
  });

  describe('interpretBmi', () => {
    it('should classify underweight', () => {
      expect(interpretBmi(17)).toBe('underweight');
      expect(interpretBmi(18.4)).toBe('underweight');
    });

    it('should classify normal', () => {
      expect(interpretBmi(18.5)).toBe('normal');
      expect(interpretBmi(22)).toBe('normal');
      expect(interpretBmi(24.9)).toBe('normal');
    });

    it('should classify overweight', () => {
      expect(interpretBmi(25)).toBe('overweight');
      expect(interpretBmi(29.9)).toBe('overweight');
    });

    it('should classify obese class 1', () => {
      expect(interpretBmi(30)).toBe('obese_class_1');
      expect(interpretBmi(34.9)).toBe('obese_class_1');
    });

    it('should classify obese class 2', () => {
      expect(interpretBmi(35)).toBe('obese_class_2');
      expect(interpretBmi(39.9)).toBe('obese_class_2');
    });

    it('should classify obese class 3', () => {
      expect(interpretBmi(40)).toBe('obese_class_3');
      expect(interpretBmi(50)).toBe('obese_class_3');
    });
  });

  // ── Waist-to-Hip Ratio ───────────────────────────────────────────

  describe('calculateWaistToHip', () => {
    it('should calculate WHR correctly', () => {
      expect(calculateWaistToHip(85, 100)).toBe(0.85);
      expect(calculateWaistToHip(100, 105)).toBeCloseTo(0.95, 2);
    });

    it('should throw for zero values', () => {
      expect(() => calculateWaistToHip(0, 100)).toThrow();
      expect(() => calculateWaistToHip(85, 0)).toThrow();
    });
  });

  describe('interpretWhr', () => {
    it('should classify male WHR', () => {
      expect(interpretWhr(0.85, 'male')).toBe('low');
      expect(interpretWhr(0.95, 'male')).toBe('moderate');
      expect(interpretWhr(1.0, 'male')).toBe('high');
      expect(interpretWhr(1.05, 'male')).toBe('high');
    });

    it('should classify female WHR', () => {
      expect(interpretWhr(0.75, 'female')).toBe('low');
      expect(interpretWhr(0.82, 'female')).toBe('moderate');
      expect(interpretWhr(0.85, 'female')).toBe('high');
      expect(interpretWhr(0.95, 'female')).toBe('high');
    });

    it('should handle boundary values for male', () => {
      expect(interpretWhr(0.89, 'male')).toBe('low');
      expect(interpretWhr(0.9, 'male')).toBe('moderate');
      expect(interpretWhr(0.99, 'male')).toBe('moderate');
    });

    it('should handle boundary values for female', () => {
      expect(interpretWhr(0.79, 'female')).toBe('low');
      expect(interpretWhr(0.8, 'female')).toBe('moderate');
      expect(interpretWhr(0.84, 'female')).toBe('moderate');
    });
  });

  // ── Waist-to-Height Ratio ────────────────────────────────────────

  describe('calculateWaistToHeight', () => {
    it('should calculate WHtR correctly', () => {
      expect(calculateWaistToHeight(85, 175)).toBeCloseTo(0.49, 2);
      expect(calculateWaistToHeight(95, 175)).toBeCloseTo(0.54, 2);
    });

    it('should throw for non-positive values', () => {
      expect(() => calculateWaistToHeight(-1, 175)).toThrow();
    });
  });

  describe('interpretWhtR', () => {
    it('should classify low risk below 0.5', () => {
      expect(interpretWhtR(0.45)).toBe('low');
      expect(interpretWhtR(0.49)).toBe('low');
    });

    it('should classify high risk at 0.5 and above', () => {
      expect(interpretWhtR(0.5)).toBe('high');
      expect(interpretWhtR(0.55)).toBe('high');
      expect(interpretWhtR(0.7)).toBe('high');
    });
  });

  // ── ABSI ─────────────────────────────────────────────────────────

  describe('calculateAbsi', () => {
    it('should calculate ABSI in expected range', () => {
      // Typical ABSI is ~0.07-0.09
      const bmi = calculateBmi(80, 175);
      const absi = calculateAbsi(90, bmi, 175);

      expect(absi).toBeGreaterThan(0.06);
      expect(absi).toBeLessThan(0.10);
    });

    it('should increase with larger waist (same BMI and height)', () => {
      const bmi = 25;
      const absiSmallWaist = calculateAbsi(80, bmi, 175);
      const absiLargeWaist = calculateAbsi(100, bmi, 175);

      expect(absiLargeWaist).toBeGreaterThan(absiSmallWaist);
    });

    it('should throw for zero values', () => {
      expect(() => calculateAbsi(0, 25, 175)).toThrow();
      expect(() => calculateAbsi(90, 0, 175)).toThrow();
      expect(() => calculateAbsi(90, 25, 0)).toThrow();
    });

    it('should handle different body types', () => {
      // Person A: 90cm waist, BMI 22, 180cm tall
      const absiA = calculateAbsi(90, 22, 180);
      // Person B: 90cm waist, BMI 30, 165cm tall
      const absiB = calculateAbsi(90, 30, 165);

      // Same waist but different BMI/height → different ABSI
      expect(absiA).not.toEqual(absiB);
      // Higher BMI person should have lower ABSI (waist "expected" for their BMI)
      expect(absiB).toBeLessThan(absiA);
    });
  });
});
