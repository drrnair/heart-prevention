import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "./useAuth";

interface SupplementReference {
  readonly id: string;
  readonly name: string;
  readonly category: string;
  readonly evidence_tier: 1 | 2 | 3;
  readonly key_benefit: string;
  readonly recommended_dose: string;
  readonly mechanism: string;
  readonly evidence_summary: string;
  readonly interactions: readonly string[];
  readonly contraindications: readonly string[];
  readonly quality_markers: readonly string[];
}

interface ReferenceEnvelope {
  readonly success: boolean;
  readonly data: readonly SupplementReference[];
  readonly error: string | null;
  readonly disclaimer: string | null;
}

interface UseSupplementReferenceReturn {
  readonly references: readonly SupplementReference[];
  readonly isLoading: boolean;
  readonly error: string | null;
}

export function useSupplementReference(): UseSupplementReferenceReturn {
  const { isAuthenticated } = useAuth();
  const [references, setReferences] = useState<readonly SupplementReference[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReferences = useCallback(async () => {
    if (!isAuthenticated) {
      setReferences([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const response = await api.get<ReferenceEnvelope>(
      "/api/supplements/reference",
    );

    if (response.error) {
      setError(response.error);
    } else {
      setReferences(response.data?.data ?? []);
    }

    setIsLoading(false);
  }, [isAuthenticated]);

  useEffect(() => {
    fetchReferences();
  }, [fetchReferences]);

  return {
    references,
    isLoading,
    error,
  };
}

export type { SupplementReference };
