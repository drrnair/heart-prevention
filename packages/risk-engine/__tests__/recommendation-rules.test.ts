import { describe, expect, it } from 'vitest';
import { generateRecommendations } from '../src/recommendation-rules';
import type { Demographics, Imaging, Labs, Vitals } from '../src/types';

const baseDemographics: Demographics = {
  age: 55,
  sex: 'male',
  ethnicity: 'white',
};

const baseVitals: Vitals = {
  systolicBp: 130,
  onBpMedication: false,
  isSmoker: false,
  hasDiabetes: false,
  weightKg: 80,
  heightCm: 175,
};

describe('Recommendation Rules', () => {
  // ── Tier 1: Universal ──────────────────────────────────────────

  describe('Tier 1 - universal recommendations', () => {
    it('should recommend lipid panel when no labs available', () => {
      const recs = generateRecommendations({
        demographics: baseDemographics,
        vitals: baseVitals,
      });

      const lipidRec = recs.find((r) =>
        r.investigation.toLowerCase().includes('lipid panel'),
      );
      expect(lipidRec).toBeDefined();
      expect(lipidRec?.tier).toBe(1);
      expect(lipidRec?.priority).toBe('essential');
    });

    it('should recommend fasting glucose/HbA1c when not available', () => {
      const recs = generateRecommendations({
        demographics: baseDemographics,
        vitals: baseVitals,
      });

      const glucoseRec = recs.find(
        (r) =>
          r.investigation.toLowerCase().includes('glucose') ||
          r.investigation.toLowerCase().includes('hba1c'),
      );
      expect(glucoseRec).toBeDefined();
      expect(glucoseRec?.tier).toBe(1);
      expect(glucoseRec?.priority).toBe('essential');
    });

    it('should NOT recommend lipid panel when already available', () => {
      const labs: Labs = {
        basicLipids: {
          totalCholesterol: 200,
          ldl: 130,
          hdl: 50,
          triglycerides: 150,
        },
      };

      const recs = generateRecommendations({
        demographics: baseDemographics,
        vitals: baseVitals,
        labs,
      });

      const lipidRec = recs.find((r) =>
        r.investigation.toLowerCase().includes('lipid panel'),
      );
      expect(lipidRec).toBeUndefined();
    });

    it('should NOT recommend glucose when HbA1c available', () => {
      const labs: Labs = {
        extendedLabs: { hba1c: 5.5 },
      };

      const recs = generateRecommendations({
        demographics: baseDemographics,
        vitals: baseVitals,
        labs,
      });

      const glucoseRec = recs.find(
        (r) =>
          r.investigation.toLowerCase().includes('glucose') ||
          r.investigation.toLowerCase().includes('hba1c'),
      );
      expect(glucoseRec).toBeUndefined();
    });
  });

  // ── Tier 2: Risk >= 5% or enhancers ───────────────────────────

  describe('Tier 2 - risk-based recommendations', () => {
    it('should recommend Lp(a) when risk >= 5% and never measured', () => {
      const recs = generateRecommendations({
        demographics: baseDemographics,
        vitals: baseVitals,
        riskScore: 8,
        lpaEverMeasured: false,
      });

      const lpaRec = recs.find((r) =>
        r.investigation.toLowerCase().includes('lp(a)'),
      );
      expect(lpaRec).toBeDefined();
      expect(lpaRec?.tier).toBe(2);
    });

    it('should NOT recommend Lp(a) when already measured (ever)', () => {
      const recs = generateRecommendations({
        demographics: baseDemographics,
        vitals: baseVitals,
        riskScore: 8,
        lpaEverMeasured: true,
      });

      const lpaRec = recs.find((r) =>
        r.investigation.toLowerCase().includes('lp(a)'),
      );
      expect(lpaRec).toBeUndefined();
    });

    it('should recommend ApoB when BMI >= 25 and risk >= 5%', () => {
      const recs = generateRecommendations({
        demographics: baseDemographics,
        vitals: { ...baseVitals, weightKg: 85, heightCm: 175 }, // BMI ~27.8
        riskScore: 8,
      });

      const apoBRec = recs.find((r) =>
        r.investigation.toLowerCase().includes('apob'),
      );
      expect(apoBRec).toBeDefined();
      expect(apoBRec?.tier).toBe(2);
    });

    it('should NOT recommend ApoB when BMI < 25', () => {
      const recs = generateRecommendations({
        demographics: baseDemographics,
        vitals: { ...baseVitals, weightKg: 65, heightCm: 175 }, // BMI ~21.2
        riskScore: 8,
      });

      const apoBRec = recs.find((r) =>
        r.investigation.toLowerCase().includes('apob'),
      );
      expect(apoBRec).toBeUndefined();
    });

    it('should recommend hs-CRP when risk 5-20%', () => {
      const recs = generateRecommendations({
        demographics: baseDemographics,
        vitals: baseVitals,
        riskScore: 12,
      });

      const crpRec = recs.find((r) =>
        r.investigation.toLowerCase().includes('hs-crp'),
      );
      expect(crpRec).toBeDefined();
      expect(crpRec?.tier).toBe(2);
    });

    it('should NOT recommend hs-CRP when risk >= 20%', () => {
      const recs = generateRecommendations({
        demographics: baseDemographics,
        vitals: baseVitals,
        riskScore: 25,
      });

      const crpRec = recs.find((r) =>
        r.investigation.toLowerCase().includes('hs-crp'),
      );
      expect(crpRec).toBeUndefined();
    });

    it('should trigger Tier 2 with enhancers even if risk < 5%', () => {
      // South Asian ethnicity is an enhancer
      const recs = generateRecommendations({
        demographics: { ...baseDemographics, ethnicity: 'south_asian' },
        vitals: baseVitals,
        riskScore: 3,
        lpaEverMeasured: false,
      });

      const lpaRec = recs.find((r) =>
        r.investigation.toLowerCase().includes('lp(a)'),
      );
      expect(lpaRec).toBeDefined();
    });

    it('should trigger Tier 2 with family history enhancer', () => {
      const recs = generateRecommendations({
        demographics: baseDemographics,
        vitals: baseVitals,
        riskScore: 3,
        familyHistory: true,
        lpaEverMeasured: false,
      });

      const lpaRec = recs.find((r) =>
        r.investigation.toLowerCase().includes('lp(a)'),
      );
      expect(lpaRec).toBeDefined();
    });
  });

  // ── Tier 3: Imaging ───────────────────────────────────────────

  describe('Tier 3 - imaging recommendations', () => {
    it('should recommend CAC for intermediate risk (7.5-20%)', () => {
      const recs = generateRecommendations({
        demographics: baseDemographics,
        vitals: baseVitals,
        riskScore: 12,
      });

      const cacRec = recs.find((r) =>
        r.investigation.toLowerCase().includes('cac'),
      );
      expect(cacRec).toBeDefined();
      expect(cacRec?.tier).toBe(3);
    });

    it('should recommend CAC for borderline (5-7.5%) WITH enhancers', () => {
      const recs = generateRecommendations({
        demographics: { ...baseDemographics, ethnicity: 'south_asian' },
        vitals: baseVitals,
        riskScore: 6,
      });

      const cacRec = recs.find((r) =>
        r.investigation.toLowerCase().includes('cac'),
      );
      expect(cacRec).toBeDefined();
    });

    it('should NOT recommend CAC for borderline without enhancers', () => {
      const recs = generateRecommendations({
        demographics: baseDemographics,
        vitals: baseVitals,
        riskScore: 6,
      });

      const cacRec = recs.find((r) =>
        r.investigation.toLowerCase().includes('cac') &&
        !r.investigation.toLowerCase().includes('ctca'),
      );
      expect(cacRec).toBeUndefined();
    });

    it('should NOT recommend CAC when already done', () => {
      const imaging: Imaging = { cacScore: 50 };

      const recs = generateRecommendations({
        demographics: baseDemographics,
        vitals: baseVitals,
        riskScore: 12,
        imaging,
      });

      const cacRec = recs.find(
        (r) =>
          r.investigation.toLowerCase().includes('cac') &&
          !r.investigation.toLowerCase().includes('ctca'),
      );
      expect(cacRec).toBeUndefined();
    });

    it('should NOT recommend CAC if done within 5 years', () => {
      const recentDate = new Date();
      recentDate.setFullYear(recentDate.getFullYear() - 3);

      const recs = generateRecommendations({
        demographics: baseDemographics,
        vitals: baseVitals,
        riskScore: 12,
        lastCacDate: recentDate.toISOString(),
      });

      const cacRec = recs.find(
        (r) =>
          r.investigation.toLowerCase().includes('cac') &&
          !r.investigation.toLowerCase().includes('ctca'),
      );
      expect(cacRec).toBeUndefined();
    });

    it('should recommend CTCA only if CAC > 0', () => {
      const imaging: Imaging = { cacScore: 50, ctcaPerformed: false };

      const recs = generateRecommendations({
        demographics: baseDemographics,
        vitals: baseVitals,
        riskScore: 12,
        imaging,
      });

      const ctcaRec = recs.find((r) =>
        r.investigation.toLowerCase().includes('ctca'),
      );
      expect(ctcaRec).toBeDefined();
      expect(ctcaRec?.tier).toBe(3);
    });

    it('should NOT recommend CTCA if CAC = 0', () => {
      const imaging: Imaging = { cacScore: 0 };

      const recs = generateRecommendations({
        demographics: baseDemographics,
        vitals: baseVitals,
        riskScore: 12,
        imaging,
      });

      const ctcaRec = recs.find((r) =>
        r.investigation.toLowerCase().includes('ctca'),
      );
      expect(ctcaRec).toBeUndefined();
    });

    it('should NOT recommend CAC for age < 40', () => {
      const recs = generateRecommendations({
        demographics: { ...baseDemographics, age: 35 },
        vitals: baseVitals,
        riskScore: 12,
      });

      const cacRec = recs.find(
        (r) =>
          r.investigation.toLowerCase().includes('cac') &&
          !r.investigation.toLowerCase().includes('ctca'),
      );
      expect(cacRec).toBeUndefined();
    });
  });

  // ── Tier 4: Conditional ───────────────────────────────────────

  describe('Tier 4 - conditional recommendations', () => {
    it('should recommend ABI for age >= 65', () => {
      const recs = generateRecommendations({
        demographics: { ...baseDemographics, age: 65 },
        vitals: baseVitals,
      });

      const abiRec = recs.find((r) =>
        r.investigation.toLowerCase().includes('abi'),
      );
      expect(abiRec).toBeDefined();
      expect(abiRec?.tier).toBe(4);
    });

    it('should recommend ABI for diabetes + age >= 50', () => {
      const recs = generateRecommendations({
        demographics: { ...baseDemographics, age: 52 },
        vitals: { ...baseVitals, hasDiabetes: true },
      });

      const abiRec = recs.find((r) =>
        r.investigation.toLowerCase().includes('abi'),
      );
      expect(abiRec).toBeDefined();
    });

    it('should NOT recommend ABI for age < 65 without diabetes', () => {
      const recs = generateRecommendations({
        demographics: { ...baseDemographics, age: 55 },
        vitals: baseVitals,
      });

      const abiRec = recs.find((r) =>
        r.investigation.toLowerCase().includes('abi'),
      );
      expect(abiRec).toBeUndefined();
    });

    it('should recommend advanced lipid for family hx + discordant lipids', () => {
      const labs: Labs = {
        basicLipids: {
          totalCholesterol: 220,
          ldl: 110,
          hdl: 50,
          triglycerides: 250,
        },
      };

      const recs = generateRecommendations({
        demographics: baseDemographics,
        vitals: baseVitals,
        labs,
        familyHistory: true,
      });

      const advancedLipidRec = recs.find((r) =>
        r.investigation.toLowerCase().includes('advanced lipid'),
      );
      expect(advancedLipidRec).toBeDefined();
      expect(advancedLipidRec?.tier).toBe(4);
    });
  });

  // ── Guideline References ──────────────────────────────────────

  describe('guideline references', () => {
    it('should include guideline reference in every recommendation', () => {
      const recs = generateRecommendations({
        demographics: baseDemographics,
        vitals: baseVitals,
        riskScore: 12,
        lpaEverMeasured: false,
      });

      expect(recs.length).toBeGreaterThan(0);
      for (const rec of recs) {
        expect(rec.guidelineReference).toBeTruthy();
        expect(rec.guidelineReference.length).toBeGreaterThan(5);
      }
    });

    it('should include rationale in every recommendation', () => {
      const recs = generateRecommendations({
        demographics: baseDemographics,
        vitals: baseVitals,
        riskScore: 12,
      });

      for (const rec of recs) {
        expect(rec.rationale).toBeTruthy();
        expect(rec.rationale.length).toBeGreaterThan(10);
      }
    });
  });

  // ── Comprehensive scenario ────────────────────────────────────

  describe('comprehensive scenarios', () => {
    it('should generate no Tier 1 recs when all basic data present', () => {
      const labs: Labs = {
        basicLipids: {
          totalCholesterol: 200,
          ldl: 130,
          hdl: 50,
          triglycerides: 150,
        },
        extendedLabs: { hba1c: 5.5, fastingGlucose: 90 },
      };

      const recs = generateRecommendations({
        demographics: baseDemographics,
        vitals: baseVitals,
        labs,
        riskScore: 3,
      });

      const tier1 = recs.filter((r) => r.tier === 1);
      expect(tier1).toHaveLength(0);
    });

    it('should handle young low-risk patient with minimal recommendations', () => {
      const recs = generateRecommendations({
        demographics: { age: 30, sex: 'female', ethnicity: 'white' },
        vitals: {
          systolicBp: 110,
          onBpMedication: false,
          isSmoker: false,
          hasDiabetes: false,
        },
        riskScore: 1,
      });

      // Should get Tier 1 recs but no Tier 2/3/4
      const tier1 = recs.filter((r) => r.tier === 1);
      const tier23 = recs.filter((r) => r.tier === 2 || r.tier === 3);
      expect(tier1.length).toBeGreaterThan(0);
      expect(tier23).toHaveLength(0);
    });
  });
});
