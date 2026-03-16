import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "./useAuth";

interface Recommendation {
  readonly id: string;
  readonly testCode: string;
  readonly category: string;
  readonly priority: string;
  readonly rationale: string;
  readonly status: string;
  readonly snoozedUntil: string | null;
  readonly completedAt: string | null;
}

interface RecommendationsEnvelope {
  readonly success: boolean;
  readonly data: {
    readonly recommendations: readonly Recommendation[];
    readonly dataLevel: number;
  } | null;
  readonly error: string | null;
}

interface UpdateEnvelope {
  readonly success: boolean;
  readonly data: unknown;
  readonly error: string | null;
}

const TEST_DISPLAY_NAMES: Readonly<Record<string, string>> = {
  lipid_panel: "Fasting Lipid Panel",
  fasting_glucose: "Fasting Glucose / HbA1c",
  lpa: "Lipoprotein(a)",
  apob: "Apolipoprotein B",
  hs_crp: "hs-CRP",
  cac_score: "Coronary Artery Calcium Score",
  ctca: "CT Coronary Angiography",
  abi: "Ankle-Brachial Index",
} as const;

interface UseRecommendationsReturn {
  readonly recommendations: readonly Recommendation[];
  readonly dataLevel: number | null;
  readonly isLoading: boolean;
  readonly error: string | null;
  readonly refetch: () => Promise<void>;
  readonly updateStatus: (
    id: string,
    status: string,
  ) => Promise<{ error: string | null }>;
}

export function useRecommendations(): UseRecommendationsReturn {
  const { isAuthenticated } = useAuth();
  const [recommendations, setRecommendations] = useState<
    readonly Recommendation[]
  >([]);
  const [dataLevel, setDataLevel] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecommendations = useCallback(async () => {
    if (!isAuthenticated) {
      setRecommendations([]);
      setDataLevel(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const response =
      await api.get<RecommendationsEnvelope>("/api/recommendations");

    if (response.error) {
      setError(response.error);
    } else {
      const payload = response.data?.data;
      setRecommendations(payload?.recommendations ?? []);
      setDataLevel(payload?.dataLevel ?? null);
    }

    setIsLoading(false);
  }, [isAuthenticated]);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  const updateStatus = useCallback(
    async (id: string, status: string) => {
      const response = await api.put<UpdateEnvelope>(
        `/api/recommendations/${id}`,
        { status },
      );

      if (response.error) {
        return { error: response.error };
      }

      await fetchRecommendations();
      return { error: null };
    },
    [fetchRecommendations],
  );

  return {
    recommendations,
    dataLevel,
    isLoading,
    error,
    refetch: fetchRecommendations,
    updateStatus,
  };
}

export { TEST_DISPLAY_NAMES };
export type { Recommendation, UseRecommendationsReturn };
