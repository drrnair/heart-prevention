import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "./useAuth";

interface RiskScoreItem {
  readonly id: string;
  readonly score_type: string;
  readonly score_value: number;
  readonly risk_category: string;
  readonly data_level: number;
  readonly input_snapshot: Record<string, unknown> | null;
  readonly calculated_at: string;
}

interface RiskScoresEnvelope {
  readonly success: boolean;
  readonly data: {
    readonly items: readonly RiskScoreItem[];
    readonly total: number;
    readonly limit: number;
    readonly offset: number;
  } | null;
  readonly error: string | null;
}

interface CompletenessData {
  readonly missingForNextLevel: readonly string[];
  readonly currentLevelFields: readonly string[];
  readonly nextLevelFields: readonly string[];
}

interface CompletenessEnvelope {
  readonly success: boolean;
  readonly data: {
    readonly currentLevel: number;
    readonly completeness: CompletenessData;
    readonly hasAssessment: boolean;
    readonly hasLabs: boolean;
    readonly hasImaging: boolean;
  } | null;
  readonly error: string | null;
}

interface AssessmentItem {
  readonly id: string;
  readonly assessed_at: string;
  readonly systolic_bp: number;
  readonly diastolic_bp: number;
  readonly pulse_rate: number | null;
  readonly height_cm: number;
  readonly weight_kg: number;
  readonly waist_cm: number | null;
  readonly hip_cm: number | null;
  readonly bmi: number | null;
  readonly waist_to_hip: number | null;
  readonly waist_to_height: number | null;
}

interface AssessmentEnvelope {
  readonly success: boolean;
  readonly data: {
    readonly items: readonly AssessmentItem[];
    readonly total: number;
    readonly limit: number;
    readonly offset: number;
  } | null;
  readonly error: string | null;
}

interface DashboardRiskScore {
  readonly percentage: number;
  readonly riskLevel: string;
  readonly inputSnapshot: Record<string, unknown> | null;
  readonly isPreliminary: boolean;
}

interface DashboardCompleteness {
  readonly currentLevel: number;
  readonly nextLevelHint: string | null;
  readonly hasAssessment: boolean;
  readonly hasLabs: boolean;
  readonly hasImaging: boolean;
}

interface DashboardAssessment {
  readonly bmi: number | null;
  readonly waistToHip: number | null;
  readonly systolicBp: number;
  readonly diastolicBp: number;
  readonly weightKg: number;
}

interface UseDashboardReturn {
  readonly riskScore: DashboardRiskScore | null;
  readonly completeness: DashboardCompleteness | null;
  readonly assessment: DashboardAssessment | null;
  readonly isLoading: boolean;
  readonly error: string | null;
  readonly refetch: () => Promise<void>;
}

export function useDashboard(): UseDashboardReturn {
  const { isAuthenticated } = useAuth();
  const [riskScore, setRiskScore] = useState<DashboardRiskScore | null>(null);
  const [completeness, setCompleteness] =
    useState<DashboardCompleteness | null>(null);
  const [assessment, setAssessment] = useState<DashboardAssessment | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    if (!isAuthenticated) {
      setRiskScore(null);
      setCompleteness(null);
      setAssessment(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const [riskRes, completenessRes, assessmentRes] = await Promise.all([
      api.get<RiskScoresEnvelope>(
        "/api/risk-scores?limit=1&scoreType=ascvd_pce_10yr",
      ),
      api.get<CompletenessEnvelope>("/api/completeness"),
      api.get<AssessmentEnvelope>("/api/assessments?limit=1"),
    ]);

    const firstError =
      riskRes.error ?? completenessRes.error ?? assessmentRes.error;

    if (firstError) {
      setError(firstError);
      setIsLoading(false);
      return;
    }

    const riskData = riskRes.data?.data;
    const completenessData = completenessRes.data?.data;
    const assessmentData = assessmentRes.data?.data;

    const latestScore = riskData?.items?.[0] ?? null;
    const currentLevel = completenessData?.currentLevel ?? 0;

    setRiskScore(
      latestScore
        ? {
            percentage: latestScore.score_value,
            riskLevel: latestScore.risk_category,
            inputSnapshot: latestScore.input_snapshot,
            isPreliminary: currentLevel < 4,
          }
        : null,
    );

    setCompleteness(
      completenessData
        ? {
            currentLevel,
            nextLevelHint:
              completenessData.completeness.missingForNextLevel[0] ?? null,
            hasAssessment: completenessData.hasAssessment,
            hasLabs: completenessData.hasLabs,
            hasImaging: completenessData.hasImaging,
          }
        : null,
    );

    const latestAssessment = assessmentData?.items?.[0] ?? null;
    setAssessment(
      latestAssessment
        ? {
            bmi: latestAssessment.bmi,
            waistToHip: latestAssessment.waist_to_hip,
            systolicBp: latestAssessment.systolic_bp,
            diastolicBp: latestAssessment.diastolic_bp,
            weightKg: latestAssessment.weight_kg,
          }
        : null,
    );

    setIsLoading(false);
  }, [isAuthenticated]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return {
    riskScore,
    completeness,
    assessment,
    isLoading,
    error,
    refetch: fetchDashboard,
  };
}

export type {
  DashboardRiskScore,
  DashboardCompleteness,
  DashboardAssessment,
  UseDashboardReturn,
};
