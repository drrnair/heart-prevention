import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "./useAuth";

interface Features {
  readonly aiChat: boolean;
  readonly pdfReports: boolean;
  readonly lifestylePlan: boolean;
  readonly riskScores: boolean;
  readonly labUpload: boolean;
}

interface SubscriptionEnvelope {
  readonly success: boolean;
  readonly data: {
    readonly tier: string;
    readonly storedTier: string;
    readonly isActive: boolean;
    readonly expiresAt: string | null;
    readonly features: Features;
  } | null;
  readonly error: string | null;
}

interface UseSubscriptionReturn {
  readonly tier: string | null;
  readonly isActive: boolean;
  readonly features: Features | null;
  readonly isLoading: boolean;
  readonly error: string | null;
  readonly refetch: () => Promise<void>;
}

export function useSubscription(): UseSubscriptionReturn {
  const { isAuthenticated } = useAuth();
  const [tier, setTier] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [features, setFeatures] = useState<Features | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscription = useCallback(async () => {
    if (!isAuthenticated) {
      setTier(null);
      setIsActive(false);
      setFeatures(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const response = await api.get<SubscriptionEnvelope>(
      "/api/subscriptions/status",
    );

    if (response.error) {
      setError(response.error);
    } else {
      const payload = response.data?.data;
      setTier(payload?.tier ?? null);
      setIsActive(payload?.isActive ?? false);
      setFeatures(payload?.features ?? null);
    }

    setIsLoading(false);
  }, [isAuthenticated]);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  return {
    tier,
    isActive,
    features,
    isLoading,
    error,
    refetch: fetchSubscription,
  };
}

export type { Features, UseSubscriptionReturn };
