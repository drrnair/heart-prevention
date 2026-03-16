import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "./useAuth";

interface Supplement {
  readonly id: string;
  readonly name: string;
  readonly dosage: string;
  readonly frequency: string;
  readonly status: "active" | "paused" | "stopped";
  readonly reason: string | null;
  readonly started_at: string;
  readonly stopped_at: string | null;
}

interface SupplementInput {
  readonly name: string;
  readonly dosage: string;
  readonly frequency: string;
  readonly isMedication: boolean;
  readonly reason: string;
  readonly startedAt: string;
}

interface ConditionInference {
  readonly id: string;
  readonly condition: string;
  readonly confidence: number;
  readonly source: string;
}

interface SupplementsEnvelope {
  readonly success: boolean;
  readonly data: readonly Supplement[];
  readonly error: string | null;
  readonly disclaimer: string | null;
}

interface AddSupplementEnvelope {
  readonly success: boolean;
  readonly data: Supplement;
  readonly conditionInferences?: readonly ConditionInference[];
  readonly error: string | null;
  readonly disclaimer: string | null;
}

interface UpdateSupplementEnvelope {
  readonly success: boolean;
  readonly data: Supplement;
  readonly error: string | null;
  readonly disclaimer: string | null;
}

interface UseSupplementsReturn {
  readonly supplements: readonly Supplement[];
  readonly isLoading: boolean;
  readonly error: string | null;
  readonly add: (input: SupplementInput) => Promise<{ error: string | null }>;
  readonly update: (
    id: string,
    updates: Partial<Supplement>,
  ) => Promise<{ error: string | null }>;
  readonly remove: (id: string) => Promise<{ error: string | null }>;
  readonly pendingInferences: readonly ConditionInference[];
  readonly dismissInference: (id: string) => void;
  readonly refetch: () => Promise<void>;
}

export function useSupplements(): UseSupplementsReturn {
  const { isAuthenticated } = useAuth();
  const [supplements, setSupplements] = useState<readonly Supplement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingInferences, setPendingInferences] = useState<
    readonly ConditionInference[]
  >([]);

  const fetchSupplements = useCallback(async () => {
    if (!isAuthenticated) {
      setSupplements([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const response = await api.get<SupplementsEnvelope>("/api/supplements");

    if (response.error) {
      setError(response.error);
    } else {
      setSupplements(response.data?.data ?? []);
    }

    setIsLoading(false);
  }, [isAuthenticated]);

  useEffect(() => {
    fetchSupplements();
  }, [fetchSupplements]);

  const add = useCallback(
    async (input: SupplementInput) => {
      const response = await api.post<AddSupplementEnvelope>(
        "/api/supplements",
        input,
      );

      if (response.error) {
        return { error: response.error };
      }

      const payload = response.data;
      if (payload?.data) {
        setSupplements((prev) => [...prev, payload.data]);
      }

      if (payload?.conditionInferences?.length) {
        setPendingInferences((prev) => [
          ...prev,
          ...payload.conditionInferences!,
        ]);
      }

      return { error: null };
    },
    [],
  );

  const update = useCallback(
    async (id: string, updates: Partial<Supplement>) => {
      const response = await api.put<UpdateSupplementEnvelope>(
        `/api/supplements/${id}`,
        updates,
      );

      if (response.error) {
        return { error: response.error };
      }

      const updated = response.data?.data;
      if (updated) {
        setSupplements((prev) =>
          prev.map((s) => (s.id === id ? updated : s)),
        );
      }

      return { error: null };
    },
    [],
  );

  const remove = useCallback(async (id: string) => {
    const response = await api.delete(`/api/supplements/${id}`);

    if (response.error) {
      return { error: response.error };
    }

    setSupplements((prev) => prev.filter((s) => s.id !== id));
    return { error: null };
  }, []);

  const dismissInference = useCallback((id: string) => {
    setPendingInferences((prev) => prev.filter((i) => i.id !== id));
  }, []);

  return {
    supplements,
    isLoading,
    error,
    add,
    update,
    remove,
    pendingInferences,
    dismissInference,
    refetch: fetchSupplements,
  };
}

export type { Supplement, SupplementInput, ConditionInference };
