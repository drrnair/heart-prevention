import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "./useAuth";

interface RiskScorePoint {
  readonly score_type: string;
  readonly score_value: number;
  readonly risk_category: string;
  readonly data_level: number;
  readonly calculated_at: string;
}

interface LabValuePoint {
  readonly report_date: string;
  readonly total_cholesterol: number | null;
  readonly ldl_cholesterol: number | null;
  readonly hdl_cholesterol: number | null;
  readonly triglycerides: number | null;
  readonly hba1c: number | null;
  readonly hs_crp: number | null;
  readonly apolipoprotein_b: number | null;
  readonly lipoprotein_a: number | null;
}

interface VitalPoint {
  readonly assessed_at: string;
  readonly systolic_bp: number;
  readonly diastolic_bp: number;
  readonly bmi: number | null;
  readonly weight_kg: number;
  readonly waist_to_hip: number | null;
  readonly waist_to_height: number | null;
}

interface TrendsEnvelope {
  readonly success: boolean;
  readonly data: {
    readonly period: { readonly months: number; readonly since: string };
    readonly riskScores: readonly RiskScorePoint[];
    readonly labValues: readonly LabValuePoint[];
    readonly vitals: readonly VitalPoint[];
    readonly checkins: readonly Record<string, unknown>[];
  } | null;
  readonly error: string | null;
}

interface ChartPoint {
  readonly x: Date;
  readonly y: number;
}

interface RiskChartPoint extends ChartPoint {
  readonly level: string;
}

interface UseTrendsReturn {
  readonly riskData: readonly RiskChartPoint[];
  readonly ldlData: readonly ChartPoint[];
  readonly hdlData: readonly ChartPoint[];
  readonly tgData: readonly ChartPoint[];
  readonly systolicData: readonly ChartPoint[];
  readonly weightData: readonly ChartPoint[];
  readonly isLoading: boolean;
  readonly error: string | null;
  readonly refetch: () => Promise<void>;
}

function toChartPoint(
  dateStr: string,
  value: number | null,
): ChartPoint | null {
  if (value == null) return null;
  return { x: new Date(dateStr), y: value };
}

export function useTrends(): UseTrendsReturn {
  const { isAuthenticated } = useAuth();
  const [riskData, setRiskData] = useState<readonly RiskChartPoint[]>([]);
  const [ldlData, setLdlData] = useState<readonly ChartPoint[]>([]);
  const [hdlData, setHdlData] = useState<readonly ChartPoint[]>([]);
  const [tgData, setTgData] = useState<readonly ChartPoint[]>([]);
  const [systolicData, setSystolicData] = useState<readonly ChartPoint[]>([]);
  const [weightData, setWeightData] = useState<readonly ChartPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTrends = useCallback(async () => {
    if (!isAuthenticated) {
      setRiskData([]);
      setLdlData([]);
      setHdlData([]);
      setTgData([]);
      setSystolicData([]);
      setWeightData([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const response = await api.get<TrendsEnvelope>("/api/trends?months=12");

    if (response.error) {
      setError(response.error);
      setIsLoading(false);
      return;
    }

    const trends = response.data?.data;

    if (!trends) {
      setIsLoading(false);
      return;
    }

    setRiskData(
      trends.riskScores.map((s) => ({
        x: new Date(s.calculated_at),
        y: s.score_value,
        level: s.risk_category,
      })),
    );

    setLdlData(
      trends.labValues
        .map((l) => toChartPoint(l.report_date, l.ldl_cholesterol))
        .filter((p): p is ChartPoint => p !== null),
    );

    setHdlData(
      trends.labValues
        .map((l) => toChartPoint(l.report_date, l.hdl_cholesterol))
        .filter((p): p is ChartPoint => p !== null),
    );

    setTgData(
      trends.labValues
        .map((l) => toChartPoint(l.report_date, l.triglycerides))
        .filter((p): p is ChartPoint => p !== null),
    );

    setSystolicData(
      trends.vitals.map((v) => ({
        x: new Date(v.assessed_at),
        y: v.systolic_bp,
      })),
    );

    setWeightData(
      trends.vitals.map((v) => ({
        x: new Date(v.assessed_at),
        y: v.weight_kg,
      })),
    );

    setIsLoading(false);
  }, [isAuthenticated]);

  useEffect(() => {
    fetchTrends();
  }, [fetchTrends]);

  return {
    riskData,
    ldlData,
    hdlData,
    tgData,
    systolicData,
    weightData,
    isLoading,
    error,
    refetch: fetchTrends,
  };
}

export type { ChartPoint, RiskChartPoint, UseTrendsReturn };
