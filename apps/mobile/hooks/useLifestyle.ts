import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "./useAuth";

interface LifestylePlan {
  readonly id: string;
  readonly category: string;
  readonly title: string;
  readonly description: string;
  readonly status: string;
  readonly start_date: string;
  readonly end_date: string;
  readonly goals: readonly unknown[];
  readonly plan_data: Record<string, unknown> | null;
  readonly disclaimer: string;
  readonly created_at: string;
  readonly updated_at: string;
}

interface PlanData {
  readonly clinicalSummary: string;
  readonly targets: Record<string, unknown>;
  readonly nutrition: Record<string, unknown>;
  readonly exercise: Record<string, unknown>;
  readonly supplements: Record<string, unknown>;
  readonly monitoring: Record<string, unknown>;
  readonly decisionFramework: Record<string, unknown>;
}

interface GetEnvelope {
  readonly success: boolean;
  readonly data: LifestylePlan | null;
  readonly error: string | null;
}

interface PostEnvelope {
  readonly success: boolean;
  readonly data: {
    readonly plan: LifestylePlan;
    readonly details: PlanData;
  } | null;
  readonly error: string | null;
}

interface UseLifestyleReturn {
  readonly plan: LifestylePlan | null;
  readonly planData: PlanData | null;
  readonly isLoading: boolean;
  readonly error: string | null;
  readonly generate: () => Promise<void>;
  readonly isGenerating: boolean;
  readonly refetch: () => Promise<void>;
}

export function useLifestyle(): UseLifestyleReturn {
  const { isAuthenticated } = useAuth();
  const [plan, setPlan] = useState<LifestylePlan | null>(null);
  const [planData, setPlanData] = useState<PlanData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLifestyle = useCallback(async () => {
    if (!isAuthenticated) {
      setPlan(null);
      setPlanData(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const response = await api.get<GetEnvelope>("/api/lifestyle");

    if (response.error) {
      setError(response.error);
    } else {
      const payload = response.data?.data ?? null;
      setPlan(payload);
      setPlanData((payload?.plan_data as PlanData | null) ?? null);
    }

    setIsLoading(false);
  }, [isAuthenticated]);

  useEffect(() => {
    fetchLifestyle();
  }, [fetchLifestyle]);

  const generate = useCallback(async () => {
    setIsGenerating(true);
    setError(null);

    const response = await api.post<PostEnvelope>("/api/lifestyle", {});

    if (response.error) {
      setError(response.error);
      setIsGenerating(false);
      return;
    }

    const payload = response.data?.data;
    if (payload) {
      setPlan(payload.plan);
      setPlanData(payload.details);
    }

    setIsGenerating(false);
  }, []);

  return {
    plan,
    planData,
    isLoading,
    error,
    generate,
    isGenerating,
    refetch: fetchLifestyle,
  };
}

export type { LifestylePlan, PlanData, UseLifestyleReturn };
