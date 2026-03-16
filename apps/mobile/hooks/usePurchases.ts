import { useCallback, useEffect, useState } from "react";
import { Platform } from "react-native";
import { api } from "@/lib/api";
import { useSubscription } from "./useSubscription";
import {
  getOfferings,
  purchasePackage,
  restorePurchases,
  type Offerings,
  type Package,
} from "@/lib/purchases";

interface UsePurchasesReturn {
  readonly offerings: Offerings | null;
  readonly purchase: (pkg: Package) => Promise<{ error: string | null }>;
  readonly restore: () => Promise<{ error: string | null }>;
  readonly isPurchasing: boolean;
  readonly isRestoring: boolean;
  readonly error: string | null;
}

export function usePurchases(): UsePurchasesReturn {
  const { refetch: refetchSubscription } = useSubscription();
  const [offerings, setOfferings] = useState<Offerings | null>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOfferings() {
      try {
        const result = await getOfferings();
        setOfferings(result);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to load offerings";
        setError(message);
      }
    }

    fetchOfferings();
  }, []);

  const purchase = useCallback(
    async (pkg: Package): Promise<{ error: string | null }> => {
      setIsPurchasing(true);
      setError(null);

      try {
        const { receipt } = await purchasePackage(pkg);

        const response = await api.post("/api/subscriptions/verify", {
          receipt,
          platform: Platform.OS,
        });

        if (response.error) {
          setError(response.error);
          return { error: response.error };
        }

        await refetchSubscription();
        return { error: null };
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Purchase failed";
        setError(message);
        return { error: message };
      } finally {
        setIsPurchasing(false);
      }
    },
    [refetchSubscription],
  );

  const restore = useCallback(async (): Promise<{ error: string | null }> => {
    setIsRestoring(true);
    setError(null);

    try {
      const { activeEntitlements } = await restorePurchases();

      if (activeEntitlements.length === 0) {
        const message = "No active subscriptions found to restore.";
        setError(message);
        return { error: message };
      }

      await refetchSubscription();
      return { error: null };
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Restore failed";
      setError(message);
      return { error: message };
    } finally {
      setIsRestoring(false);
    }
  }, [refetchSubscription]);

  return {
    offerings,
    purchase,
    restore,
    isPurchasing,
    isRestoring,
    error,
  };
}
