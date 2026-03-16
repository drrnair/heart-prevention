import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "./useAuth";

interface Profile {
  readonly id: string;
  readonly email: string;
  readonly date_of_birth: string | null;
  readonly biological_sex: "male" | "female" | null;
  readonly ethnicity: string | null;
  readonly score2_region: string | null;
  readonly height_cm: number | null;
  readonly weight_kg: number | null;
  readonly waist_cm: number | null;
  readonly hip_cm: number | null;
  readonly smoking_status: string | null;
  readonly diabetes_status: string | null;
  readonly on_bp_medication: boolean;
  readonly on_statin: boolean;
  readonly on_aspirin: boolean;
  readonly family_history_premature_cvd: boolean;
  readonly preferred_cuisines: readonly string[];
  readonly activity_level: string | null;
  readonly unit_system: "metric" | "imperial";
  readonly cholesterol_unit: "mg/dL" | "mmol/L";
  readonly onboarding_completed: boolean;
  readonly created_at: string;
  readonly updated_at: string;
}

interface UseProfileReturn {
  readonly profile: Profile | null;
  readonly isLoading: boolean;
  readonly error: string | null;
  readonly refetch: () => Promise<void>;
  readonly updateProfile: (
    updates: Partial<Profile>,
  ) => Promise<{ error: string | null }>;
}

export function useProfile(): UseProfileReturn {
  const { isAuthenticated } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!isAuthenticated) {
      setProfile(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const response = await api.get<Profile>("/api/profile");

    if (response.error) {
      setError(response.error);
    } else {
      setProfile(response.data);
    }

    setIsLoading(false);
  }, [isAuthenticated]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const updateProfile = useCallback(
    async (updates: Partial<Profile>) => {
      const response = await api.patch<Profile>("/api/profile", updates);

      if (response.error) {
        return { error: response.error };
      }

      setProfile(response.data);
      return { error: null };
    },
    [],
  );

  return {
    profile,
    isLoading,
    error,
    refetch: fetchProfile,
    updateProfile,
  };
}

export type { Profile };
