/**
 * Hook that provides unit-aware formatting functions based on
 * the user's preferred unit_system and cholesterol_unit from their profile.
 *
 * Defaults to metric / mg/dL when profile is not yet loaded.
 */

import { useMemo } from "react";
import { useProfile } from "./useProfile";
import {
  kgToLbs,
  cmToFeetInches,
  cmToInches,
  mgdlToMmolChol,
  mgdlToMmolTG,
  mgdlToMmolGlucose,
} from "@/lib/unit-conversion";

interface UseUnitsReturn {
  /** Format weight: "82.5 kg" or "181.9 lbs" */
  readonly formatWeight: (kg: number) => string;
  /** Format height: "175 cm" or "5'9\"" */
  readonly formatHeight: (cm: number) => string;
  /** Format waist/hip: "85 cm" or "33.5 in" */
  readonly formatWaist: (cm: number) => string;
  /** Format cholesterol: "218 mg/dL" or "5.64 mmol/L" */
  readonly formatChol: (mgdl: number) => string;
  /** Format triglycerides: "150 mg/dL" or "1.69 mmol/L" */
  readonly formatTG: (mgdl: number) => string;
  /** Format glucose: "100 mg/dL" or "5.6 mmol/L" */
  readonly formatGlucose: (mgdl: number) => string;
  /** Current weight unit label */
  readonly weightUnit: string;
  /** Current cholesterol unit label */
  readonly cholUnit: string;
}

export function useUnits(): UseUnitsReturn {
  const { profile } = useProfile();

  const unitSystem = profile?.unit_system ?? "metric";
  const cholUnit = profile?.cholesterol_unit ?? "mg/dL";

  return useMemo(() => {
    const isImperial = unitSystem === "imperial";
    const isMmol = cholUnit === "mmol/L";

    const formatWeight = (kg: number): string =>
      isImperial ? `${kgToLbs(kg)} lbs` : `${kg} kg`;

    const formatHeight = (cm: number): string =>
      isImperial ? cmToFeetInches(cm) : `${cm} cm`;

    const formatWaist = (cm: number): string =>
      isImperial ? `${cmToInches(cm)} in` : `${cm} cm`;

    const formatChol = (mgdl: number): string =>
      isMmol ? `${mgdlToMmolChol(mgdl)} mmol/L` : `${mgdl} mg/dL`;

    const formatTG = (mgdl: number): string =>
      isMmol ? `${mgdlToMmolTG(mgdl)} mmol/L` : `${mgdl} mg/dL`;

    const formatGlucose = (mgdl: number): string =>
      isMmol ? `${mgdlToMmolGlucose(mgdl)} mmol/L` : `${mgdl} mg/dL`;

    return {
      formatWeight,
      formatHeight,
      formatWaist,
      formatChol,
      formatTG,
      formatGlucose,
      weightUnit: isImperial ? "lbs" : "kg",
      cholUnit,
    };
  }, [unitSystem, cholUnit]);
}
