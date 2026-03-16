import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "./useAuth";

interface Checkin {
  readonly id: string;
  readonly user_id: string;
  readonly week_starting: string;
  readonly mood_level: string | null;
  readonly exercise_minutes: number | null;
  readonly sleep_hours_avg: number | null;
  readonly stress_level: number | null;
  readonly medication_adherence: number | null;
  readonly notes: string | null;
  readonly created_at: string;
}

interface CheckinInput {
  readonly weekStarting: string;
  readonly moodLevel?: string | null;
  readonly exerciseMinutes?: number | null;
  readonly sleepHoursAvg?: number | null;
  readonly stressLevel?: number | null;
  readonly medicationAdherence?: number | null;
  readonly notes?: string | null;
}

interface ListEnvelope {
  readonly success: boolean;
  readonly data: {
    readonly items: readonly Checkin[];
    readonly total: number;
    readonly limit: number;
    readonly offset: number;
  } | null;
  readonly error: string | null;
}

interface CreateEnvelope {
  readonly success: boolean;
  readonly data: Checkin | null;
  readonly error: string | null;
}

interface UseCheckinsReturn {
  readonly checkins: readonly Checkin[];
  readonly isLoading: boolean;
  readonly submit: (input: CheckinInput) => Promise<{ error: string | null }>;
  readonly isSubmitting: boolean;
  readonly error: string | null;
  readonly refetch: () => Promise<void>;
}

export function useCheckins(): UseCheckinsReturn {
  const { isAuthenticated } = useAuth();
  const [checkins, setCheckins] = useState<readonly Checkin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCheckins = useCallback(async () => {
    if (!isAuthenticated) {
      setCheckins([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const response = await api.get<ListEnvelope>("/api/checkins");

    if (response.error) {
      setError(response.error);
    } else {
      const payload = response.data?.data;
      setCheckins(payload?.items ?? []);
    }

    setIsLoading(false);
  }, [isAuthenticated]);

  useEffect(() => {
    fetchCheckins();
  }, [fetchCheckins]);

  const submit = useCallback(
    async (input: CheckinInput) => {
      setIsSubmitting(true);
      setError(null);

      const response = await api.post<CreateEnvelope>("/api/checkins", input);

      setIsSubmitting(false);

      if (response.error) {
        setError(response.error);
        return { error: response.error };
      }

      await fetchCheckins();
      return { error: null };
    },
    [fetchCheckins],
  );

  return {
    checkins,
    isLoading,
    submit,
    isSubmitting,
    error,
    refetch: fetchCheckins,
  };
}

export type { Checkin, CheckinInput, UseCheckinsReturn };
