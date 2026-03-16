/**
 * NHANES (National Health and Nutrition Examination Survey) reference data.
 *
 * Population-level lipid percentiles stratified by age, sex, and ethnicity.
 * Used to impute missing lab values when computing preliminary risk scores
 * (Data Level 1 estimates).
 *
 * Values are based on the NHANES 2017-2020 pre-pandemic cycle.
 * Source: CDC/NCHS NHANES public use data files.
 *
 * Units: mg/dL for all lipid values.
 */

import type { BiologicalSex, EthnicityCode } from '../types/profile';

// ── Types ──────────────────────────────────────────────────────────────

/** Age bracket boundaries (inclusive). */
export interface AgeBracket {
  readonly minAge: number;
  readonly maxAge: number;
}

/** A single NHANES reference entry. */
export interface NhanesReference {
  readonly ageMin: number;
  readonly ageMax: number;
  readonly sex: BiologicalSex;
  readonly ethnicity: EthnicityCode;
  /** Total cholesterol 25th percentile. */
  readonly tcP25: number;
  /** Total cholesterol 50th percentile (median). */
  readonly tcP50: number;
  /** Total cholesterol 75th percentile. */
  readonly tcP75: number;
  /** HDL cholesterol 25th percentile. */
  readonly hdlP25: number;
  /** HDL cholesterol 50th percentile (median). */
  readonly hdlP50: number;
  /** HDL cholesterol 75th percentile. */
  readonly hdlP75: number;
  /** LDL cholesterol 50th percentile (median). */
  readonly ldlP50: number;
  /** Triglycerides 50th percentile (median). */
  readonly tgP50: number;
}

/** Lookup result returned by `lookupNhanesMedians`. */
export interface NhanesLookupResult {
  readonly tcP25: number;
  readonly tcP50: number;
  readonly tcP75: number;
  readonly hdlP25: number;
  readonly hdlP50: number;
  readonly hdlP75: number;
  readonly ldlP50: number;
  readonly tgP50: number;
}

// ── Reference data ─────────────────────────────────────────────────────

/**
 * NHANES lipid median data stratified by age bracket, sex, and ethnicity.
 *
 * Age brackets: 20-39, 40-59, 60-79
 * Values are approximate medians from NHANES 2017-2020 pre-pandemic data.
 */
export const NHANES_LIPID_MEDIANS: readonly NhanesReference[] = [
  // ── White, Male ──────────────────────────────────────────────────
  { ageMin: 20, ageMax: 39, sex: 'male', ethnicity: 'white', tcP25: 162, tcP50: 186, tcP75: 213, hdlP25: 38, hdlP50: 45, hdlP75: 54, ldlP50: 113, tgP50: 109 },
  { ageMin: 40, ageMax: 59, sex: 'male', ethnicity: 'white', tcP25: 177, tcP50: 203, tcP75: 231, hdlP25: 37, hdlP50: 45, hdlP75: 55, ldlP50: 126, tgP50: 127 },
  { ageMin: 60, ageMax: 79, sex: 'male', ethnicity: 'white', tcP25: 163, tcP50: 189, tcP75: 217, hdlP25: 39, hdlP50: 48, hdlP75: 59, ldlP50: 112, tgP50: 113 },

  // ── White, Female ────────────────────────────────────────────────
  { ageMin: 20, ageMax: 39, sex: 'female', ethnicity: 'white', tcP25: 161, tcP50: 185, tcP75: 210, hdlP25: 48, hdlP50: 57, hdlP75: 69, ldlP50: 104, tgP50: 89 },
  { ageMin: 40, ageMax: 59, sex: 'female', ethnicity: 'white', tcP25: 183, tcP50: 210, tcP75: 238, hdlP25: 49, hdlP50: 59, hdlP75: 73, ldlP50: 124, tgP50: 106 },
  { ageMin: 60, ageMax: 79, sex: 'female', ethnicity: 'white', tcP25: 185, tcP50: 213, tcP75: 243, hdlP25: 50, hdlP50: 61, hdlP75: 76, ldlP50: 122, tgP50: 112 },

  // ── Black, Male ──────────────────────────────────────────────────
  { ageMin: 20, ageMax: 39, sex: 'male', ethnicity: 'black', tcP25: 155, tcP50: 179, tcP75: 207, hdlP25: 41, hdlP50: 50, hdlP75: 61, ldlP50: 106, tgP50: 82 },
  { ageMin: 40, ageMax: 59, sex: 'male', ethnicity: 'black', tcP25: 170, tcP50: 196, tcP75: 225, hdlP25: 40, hdlP50: 50, hdlP75: 62, ldlP50: 120, tgP50: 95 },
  { ageMin: 60, ageMax: 79, sex: 'male', ethnicity: 'black', tcP25: 161, tcP50: 188, tcP75: 218, hdlP25: 41, hdlP50: 52, hdlP75: 65, ldlP50: 114, tgP50: 89 },

  // ── Black, Female ────────────────────────────────────────────────
  { ageMin: 20, ageMax: 39, sex: 'female', ethnicity: 'black', tcP25: 157, tcP50: 181, tcP75: 209, hdlP25: 45, hdlP50: 55, hdlP75: 67, ldlP50: 103, tgP50: 72 },
  { ageMin: 40, ageMax: 59, sex: 'female', ethnicity: 'black', tcP25: 178, tcP50: 205, tcP75: 235, hdlP25: 46, hdlP50: 57, hdlP75: 71, ldlP50: 122, tgP50: 85 },
  { ageMin: 60, ageMax: 79, sex: 'female', ethnicity: 'black', tcP25: 180, tcP50: 210, tcP75: 242, hdlP25: 47, hdlP50: 59, hdlP75: 74, ldlP50: 123, tgP50: 93 },

  // ── Hispanic, Male ───────────────────────────────────────────────
  { ageMin: 20, ageMax: 39, sex: 'male', ethnicity: 'hispanic', tcP25: 163, tcP50: 189, tcP75: 217, hdlP25: 36, hdlP50: 43, hdlP75: 51, ldlP50: 114, tgP50: 121 },
  { ageMin: 40, ageMax: 59, sex: 'male', ethnicity: 'hispanic', tcP25: 177, tcP50: 205, tcP75: 234, hdlP25: 36, hdlP50: 43, hdlP75: 52, ldlP50: 127, tgP50: 138 },
  { ageMin: 60, ageMax: 79, sex: 'male', ethnicity: 'hispanic', tcP25: 166, tcP50: 192, tcP75: 221, hdlP25: 38, hdlP50: 46, hdlP75: 55, ldlP50: 115, tgP50: 124 },

  // ── Hispanic, Female ─────────────────────────────────────────────
  { ageMin: 20, ageMax: 39, sex: 'female', ethnicity: 'hispanic', tcP25: 159, tcP50: 183, tcP75: 210, hdlP25: 43, hdlP50: 52, hdlP75: 63, ldlP50: 105, tgP50: 99 },
  { ageMin: 40, ageMax: 59, sex: 'female', ethnicity: 'hispanic', tcP25: 183, tcP50: 211, tcP75: 242, hdlP25: 44, hdlP50: 53, hdlP75: 65, ldlP50: 128, tgP50: 122 },
  { ageMin: 60, ageMax: 79, sex: 'female', ethnicity: 'hispanic', tcP25: 187, tcP50: 216, tcP75: 248, hdlP25: 45, hdlP50: 55, hdlP75: 68, ldlP50: 128, tgP50: 127 },

  // ── South Asian, Male ────────────────────────────────────────────
  // Limited NHANES representation; values derived from published Indian/South Asian cohort studies
  { ageMin: 20, ageMax: 39, sex: 'male', ethnicity: 'south_asian', tcP25: 160, tcP50: 185, tcP75: 214, hdlP25: 34, hdlP50: 40, hdlP75: 48, ldlP50: 115, tgP50: 128 },
  { ageMin: 40, ageMax: 59, sex: 'male', ethnicity: 'south_asian', tcP25: 178, tcP50: 206, tcP75: 237, hdlP25: 34, hdlP50: 40, hdlP75: 48, ldlP50: 131, tgP50: 148 },
  { ageMin: 60, ageMax: 79, sex: 'male', ethnicity: 'south_asian', tcP25: 168, tcP50: 195, tcP75: 225, hdlP25: 35, hdlP50: 42, hdlP75: 51, ldlP50: 120, tgP50: 135 },

  // ── South Asian, Female ──────────────────────────────────────────
  { ageMin: 20, ageMax: 39, sex: 'female', ethnicity: 'south_asian', tcP25: 157, tcP50: 182, tcP75: 210, hdlP25: 40, hdlP50: 48, hdlP75: 58, ldlP50: 106, tgP50: 102 },
  { ageMin: 40, ageMax: 59, sex: 'female', ethnicity: 'south_asian', tcP25: 182, tcP50: 212, tcP75: 244, hdlP25: 40, hdlP50: 48, hdlP75: 59, ldlP50: 130, tgP50: 126 },
  { ageMin: 60, ageMax: 79, sex: 'female', ethnicity: 'south_asian', tcP25: 186, tcP50: 216, tcP75: 250, hdlP25: 41, hdlP50: 50, hdlP75: 61, ldlP50: 130, tgP50: 130 },

  // ── East Asian, Male ─────────────────────────────────────────────
  { ageMin: 20, ageMax: 39, sex: 'male', ethnicity: 'east_asian', tcP25: 155, tcP50: 178, tcP75: 205, hdlP25: 40, hdlP50: 48, hdlP75: 58, ldlP50: 105, tgP50: 102 },
  { ageMin: 40, ageMax: 59, sex: 'male', ethnicity: 'east_asian', tcP25: 170, tcP50: 196, tcP75: 224, hdlP25: 39, hdlP50: 48, hdlP75: 58, ldlP50: 120, tgP50: 118 },
  { ageMin: 60, ageMax: 79, sex: 'male', ethnicity: 'east_asian', tcP25: 162, tcP50: 187, tcP75: 215, hdlP25: 40, hdlP50: 49, hdlP75: 60, ldlP50: 112, tgP50: 108 },

  // ── East Asian, Female ───────────────────────────────────────────
  { ageMin: 20, ageMax: 39, sex: 'female', ethnicity: 'east_asian', tcP25: 155, tcP50: 178, tcP75: 204, hdlP25: 48, hdlP50: 58, hdlP75: 70, ldlP50: 98, tgP50: 78 },
  { ageMin: 40, ageMax: 59, sex: 'female', ethnicity: 'east_asian', tcP25: 180, tcP50: 208, tcP75: 238, hdlP25: 48, hdlP50: 58, hdlP75: 72, ldlP50: 122, tgP50: 100 },
  { ageMin: 60, ageMax: 79, sex: 'female', ethnicity: 'east_asian', tcP25: 185, tcP50: 214, tcP75: 246, hdlP25: 49, hdlP50: 60, hdlP75: 74, ldlP50: 126, tgP50: 108 },

  // ── Southeast Asian, Male ────────────────────────────────────────
  { ageMin: 20, ageMax: 39, sex: 'male', ethnicity: 'southeast_asian', tcP25: 157, tcP50: 182, tcP75: 210, hdlP25: 37, hdlP50: 44, hdlP75: 53, ldlP50: 110, tgP50: 115 },
  { ageMin: 40, ageMax: 59, sex: 'male', ethnicity: 'southeast_asian', tcP25: 174, tcP50: 201, tcP75: 230, hdlP25: 37, hdlP50: 44, hdlP75: 53, ldlP50: 125, tgP50: 132 },
  { ageMin: 60, ageMax: 79, sex: 'male', ethnicity: 'southeast_asian', tcP25: 165, tcP50: 191, tcP75: 220, hdlP25: 38, hdlP50: 46, hdlP75: 56, ldlP50: 116, tgP50: 120 },

  // ── Southeast Asian, Female ──────────────────────────────────────
  { ageMin: 20, ageMax: 39, sex: 'female', ethnicity: 'southeast_asian', tcP25: 156, tcP50: 180, tcP75: 207, hdlP25: 43, hdlP50: 52, hdlP75: 63, ldlP50: 103, tgP50: 92 },
  { ageMin: 40, ageMax: 59, sex: 'female', ethnicity: 'southeast_asian', tcP25: 181, tcP50: 210, tcP75: 241, hdlP25: 43, hdlP50: 53, hdlP75: 64, ldlP50: 127, tgP50: 118 },
  { ageMin: 60, ageMax: 79, sex: 'female', ethnicity: 'southeast_asian', tcP25: 185, tcP50: 215, tcP75: 248, hdlP25: 44, hdlP50: 55, hdlP75: 67, ldlP50: 128, tgP50: 122 },

  // ── Middle Eastern, Male ─────────────────────────────────────────
  { ageMin: 20, ageMax: 39, sex: 'male', ethnicity: 'middle_eastern', tcP25: 161, tcP50: 186, tcP75: 215, hdlP25: 35, hdlP50: 42, hdlP75: 51, ldlP50: 114, tgP50: 122 },
  { ageMin: 40, ageMax: 59, sex: 'male', ethnicity: 'middle_eastern', tcP25: 178, tcP50: 206, tcP75: 236, hdlP25: 35, hdlP50: 42, hdlP75: 51, ldlP50: 130, tgP50: 140 },
  { ageMin: 60, ageMax: 79, sex: 'male', ethnicity: 'middle_eastern', tcP25: 167, tcP50: 194, tcP75: 224, hdlP25: 36, hdlP50: 44, hdlP75: 54, ldlP50: 118, tgP50: 128 },

  // ── Middle Eastern, Female ───────────────────────────────────────
  { ageMin: 20, ageMax: 39, sex: 'female', ethnicity: 'middle_eastern', tcP25: 158, tcP50: 183, tcP75: 211, hdlP25: 42, hdlP50: 50, hdlP75: 61, ldlP50: 106, tgP50: 96 },
  { ageMin: 40, ageMax: 59, sex: 'female', ethnicity: 'middle_eastern', tcP25: 183, tcP50: 212, tcP75: 244, hdlP25: 42, hdlP50: 51, hdlP75: 62, ldlP50: 130, tgP50: 120 },
  { ageMin: 60, ageMax: 79, sex: 'female', ethnicity: 'middle_eastern', tcP25: 187, tcP50: 217, tcP75: 250, hdlP25: 43, hdlP50: 53, hdlP75: 65, ldlP50: 131, tgP50: 126 },

  // ── Other / Multiracial, Male ────────────────────────────────────
  // Approximate averages across populations
  { ageMin: 20, ageMax: 39, sex: 'male', ethnicity: 'other', tcP25: 160, tcP50: 185, tcP75: 213, hdlP25: 38, hdlP50: 45, hdlP75: 55, ldlP50: 112, tgP50: 110 },
  { ageMin: 40, ageMax: 59, sex: 'male', ethnicity: 'other', tcP25: 176, tcP50: 203, tcP75: 232, hdlP25: 37, hdlP50: 45, hdlP75: 55, ldlP50: 125, tgP50: 128 },
  { ageMin: 60, ageMax: 79, sex: 'male', ethnicity: 'other', tcP25: 164, tcP50: 190, tcP75: 219, hdlP25: 39, hdlP50: 48, hdlP75: 59, ldlP50: 114, tgP50: 114 },

  // ── Other / Multiracial, Female ──────────────────────────────────
  { ageMin: 20, ageMax: 39, sex: 'female', ethnicity: 'other', tcP25: 159, tcP50: 183, tcP75: 210, hdlP25: 46, hdlP50: 55, hdlP75: 67, ldlP50: 104, tgP50: 88 },
  { ageMin: 40, ageMax: 59, sex: 'female', ethnicity: 'other', tcP25: 182, tcP50: 210, tcP75: 240, hdlP25: 47, hdlP50: 57, hdlP75: 70, ldlP50: 125, tgP50: 108 },
  { ageMin: 60, ageMax: 79, sex: 'female', ethnicity: 'other', tcP25: 185, tcP50: 214, tcP75: 245, hdlP25: 48, hdlP50: 60, hdlP75: 74, ldlP50: 124, tgP50: 112 },
] as const;

// ── Lookup function ────────────────────────────────────────────────────

/**
 * Find the closest matching NHANES lipid medians for a given demographic.
 *
 * @param age - Patient age in years.
 * @param sex - Biological sex.
 * @param ethnicity - Ethnicity code.
 * @returns The matched reference values, or `null` if no match found.
 */
export function lookupNhanesMedians(
  age: number,
  sex: BiologicalSex,
  ethnicity: EthnicityCode,
): NhanesLookupResult | null {
  // Direct match
  const direct = NHANES_LIPID_MEDIANS.find(
    (r) => age >= r.ageMin && age <= r.ageMax && r.sex === sex && r.ethnicity === ethnicity,
  );

  if (direct) {
    return {
      tcP25: direct.tcP25,
      tcP50: direct.tcP50,
      tcP75: direct.tcP75,
      hdlP25: direct.hdlP25,
      hdlP50: direct.hdlP50,
      hdlP75: direct.hdlP75,
      ldlP50: direct.ldlP50,
      tgP50: direct.tgP50,
    };
  }

  // For ages outside defined brackets, use the closest bracket
  const sameDemographic = NHANES_LIPID_MEDIANS.filter(
    (r) => r.sex === sex && r.ethnicity === ethnicity,
  );

  if (sameDemographic.length === 0) {
    // Fall back to 'other' ethnicity
    const fallback = NHANES_LIPID_MEDIANS.find(
      (r) => age >= r.ageMin && age <= r.ageMax && r.sex === sex && r.ethnicity === 'other',
    );
    if (!fallback) return null;
    return {
      tcP25: fallback.tcP25,
      tcP50: fallback.tcP50,
      tcP75: fallback.tcP75,
      hdlP25: fallback.hdlP25,
      hdlP50: fallback.hdlP50,
      hdlP75: fallback.hdlP75,
      ldlP50: fallback.ldlP50,
      tgP50: fallback.tgP50,
    };
  }

  // Find closest bracket by age midpoint
  const closest = sameDemographic.reduce((best, current) => {
    const bestMid = (best.ageMin + best.ageMax) / 2;
    const currentMid = (current.ageMin + current.ageMax) / 2;
    return Math.abs(age - currentMid) < Math.abs(age - bestMid) ? current : best;
  });

  return {
    tcP25: closest.tcP25,
    tcP50: closest.tcP50,
    tcP75: closest.tcP75,
    hdlP25: closest.hdlP25,
    hdlP50: closest.hdlP50,
    hdlP75: closest.hdlP75,
    ldlP50: closest.ldlP50,
    tgP50: closest.tgP50,
  };
}
