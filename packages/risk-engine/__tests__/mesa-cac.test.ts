import { describe, expect, it } from 'vitest';
import {
  adjustRiskByCac,
  lookupCacPercentile,
  MesaCacValidationError,
} from '../src/mesa-cac-adjustment';
import type { CacReferenceLookup } from '../src/types';

// Mock reference lookup: returns a simple percentile based on CAC score
const mockCacLookup: CacReferenceLookup = (
  _age,
  _sex,
  _ethnicity,
  cacScore,
): number => {
  if (cacScore === 0) return 0;
  if (cacScore <= 10) return 25;
  if (cacScore <= 100) return 50;
  if (cacScore <= 400) return 75;
  return 90;
};

describe('MESA CAC Adjustment', () => {
  // ── lookupCacPercentile ──────────────────────────────────────────

  describe('lookupCacPercentile', () => {
    it('should return percentile from reference data', () => {
      const percentile = lookupCacPercentile(
        55, 'male', 'white', 100, mockCacLookup,
      );
      expect(percentile).toBe(50);
    });

    it('should return 0 percentile for CAC = 0', () => {
      const percentile = lookupCacPercentile(
        55, 'male', 'white', 0, mockCacLookup,
      );
      expect(percentile).toBe(0);
    });

    it('should throw for negative CAC score', () => {
      expect(() =>
        lookupCacPercentile(55, 'male', 'white', -1, mockCacLookup),
      ).toThrow(MesaCacValidationError);
    });
  });

  // ── adjustRiskByCac ──────────────────────────────────────────────

  describe('adjustRiskByCac', () => {
    describe('CAC = 0 (strong negative predictor)', () => {
      it('should halve risk when CAC = 0', () => {
        const result = adjustRiskByCac(10, 0, 0);
        expect(result.adjustedRisk).toBe(5);
      });

      it('should reclassify intermediate to low with CAC = 0', () => {
        const result = adjustRiskByCac(8, 0, 0);
        expect(result.originalCategory).toBe('intermediate');
        expect(result.adjustedCategory).toBe('low');
        expect(result.reclassified).toBe(true);
      });
    });

    describe('CAC 1-100 (mild)', () => {
      it('should apply ~1.0x multiplier for CAC = 1', () => {
        const result = adjustRiskByCac(10, 1, 25);
        expect(result.adjustedRisk).toBeCloseTo(10, 0);
      });

      it('should apply ~1.5x multiplier for CAC = 100', () => {
        const result = adjustRiskByCac(10, 100, 50);
        expect(result.adjustedRisk).toBeCloseTo(15, 0);
      });

      it('should interpolate linearly between CAC 1 and 100', () => {
        const result50 = adjustRiskByCac(10, 50, 40);
        expect(result50.adjustedRisk).toBeGreaterThan(10);
        expect(result50.adjustedRisk).toBeLessThan(15);
      });
    });

    describe('CAC 101-300 (moderate)', () => {
      it('should apply ~1.5x multiplier for CAC = 101', () => {
        const result = adjustRiskByCac(10, 101, 60);
        expect(result.adjustedRisk).toBeCloseTo(15, 0);
      });

      it('should apply ~2.5x multiplier for CAC = 300', () => {
        const result = adjustRiskByCac(10, 300, 75);
        expect(result.adjustedRisk).toBeCloseTo(25, 0);
      });
    });

    describe('CAC > 300 (severe)', () => {
      it('should apply 3.0x+ multiplier for CAC = 301', () => {
        const result = adjustRiskByCac(10, 301, 85);
        expect(result.adjustedRisk).toBeGreaterThanOrEqual(30);
      });

      it('should cap multiplier at 4.0x', () => {
        const result = adjustRiskByCac(10, 2000, 99);
        expect(result.adjustedRisk).toBeLessThanOrEqual(40);
      });

      it('should apply 4.0x for very high CAC', () => {
        const result = adjustRiskByCac(10, 1500, 99);
        expect(result.adjustedRisk).toBeCloseTo(40, 0);
      });
    });

    // ── Reclassification ───────────────────────────────────────────

    describe('reclassification', () => {
      it('should mark as reclassified when category changes', () => {
        // baseline 6% (borderline) → CAC=0 → 3% (low)
        const result = adjustRiskByCac(6, 0, 0);
        expect(result.reclassified).toBe(true);
        expect(result.originalCategory).toBe('borderline');
        expect(result.adjustedCategory).toBe('low');
      });

      it('should mark as NOT reclassified when category stays same', () => {
        // baseline 15% (intermediate) → CAC=50 → ~18.8% (still intermediate)
        const result = adjustRiskByCac(15, 50, 50);
        expect(result.reclassified).toBe(false);
        expect(result.originalCategory).toBe('intermediate');
        expect(result.adjustedCategory).toBe('intermediate');
      });

      it('should reclassify up from intermediate to high', () => {
        // baseline 15% (intermediate) → CAC=300 → ~37.5% (high)
        const result = adjustRiskByCac(15, 300, 80);
        expect(result.reclassified).toBe(true);
        expect(result.originalCategory).toBe('intermediate');
        expect(result.adjustedCategory).toBe('high');
      });
    });

    // ── Validation ─────────────────────────────────────────────────

    describe('validation', () => {
      it('should throw for negative CAC score', () => {
        expect(() => adjustRiskByCac(10, -1, 50)).toThrow(
          MesaCacValidationError,
        );
      });

      it('should throw for percentile < 0', () => {
        expect(() => adjustRiskByCac(10, 100, -1)).toThrow(
          MesaCacValidationError,
        );
      });

      it('should throw for percentile > 100', () => {
        expect(() => adjustRiskByCac(10, 100, 101)).toThrow(
          MesaCacValidationError,
        );
      });
    });

    // ── Result Structure ───────────────────────────────────────────

    describe('result structure', () => {
      it('should include all required fields', () => {
        const result = adjustRiskByCac(10, 50, 40);
        expect(result).toHaveProperty('baselineRisk');
        expect(result).toHaveProperty('adjustedRisk');
        expect(result).toHaveProperty('cacPercentile');
        expect(result).toHaveProperty('reclassified');
        expect(result).toHaveProperty('originalCategory');
        expect(result).toHaveProperty('adjustedCategory');
      });

      it('should preserve baseline risk in result', () => {
        const result = adjustRiskByCac(12.5, 50, 40);
        expect(result.baselineRisk).toBe(12.5);
      });

      it('should preserve CAC percentile in result', () => {
        const result = adjustRiskByCac(10, 50, 42);
        expect(result.cacPercentile).toBe(42);
      });
    });

    // ── Edge Cases ─────────────────────────────────────────────────

    describe('edge cases', () => {
      it('should handle zero baseline risk', () => {
        const result = adjustRiskByCac(0, 100, 50);
        expect(result.adjustedRisk).toBe(0);
      });

      it('should clamp adjusted risk to max 100', () => {
        const result = adjustRiskByCac(90, 500, 95);
        expect(result.adjustedRisk).toBeLessThanOrEqual(100);
      });
    });
  });
});
