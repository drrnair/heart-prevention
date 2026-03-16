import { useCallback, useEffect, useState } from "react";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "@/lib/api";
import {
  isAvailable as checkAvailable,
  readData,
  requestPermissions as requestWearablePermissions,
} from "@/lib/wearable";
import type { WearableData } from "@/lib/wearable";
import { useAuth } from "./useAuth";

const STORAGE_KEY_CONNECTED = "@wearable_connected";
const STORAGE_KEY_LAST_SYNCED = "@wearable_last_synced";

interface UseWearableReturn {
  readonly isAvailable: boolean;
  readonly isConnected: boolean;
  readonly lastSynced: Date | null;
  readonly latestData: WearableData | null;
  readonly requestPermissions: () => Promise<void>;
  readonly sync: () => Promise<void>;
  readonly disconnect: () => Promise<void>;
  readonly isSyncing: boolean;
  readonly error: string | null;
}

function wearableDataToReadings(
  data: WearableData,
  recordedAt: string,
): readonly { readonly dataType: string; readonly value: number; readonly unit: string; readonly recordedAt: string }[] {
  const readings: { dataType: string; value: number; unit: string; recordedAt: string }[] = [];

  if (data.restingHeartRate != null) {
    readings.push({ dataType: "resting_heart_rate", value: data.restingHeartRate, unit: "bpm", recordedAt });
  }
  if (data.stepCount != null) {
    readings.push({ dataType: "step_count", value: data.stepCount, unit: "steps", recordedAt });
  }
  if (data.exerciseMinutes != null) {
    readings.push({ dataType: "exercise_minutes", value: data.exerciseMinutes, unit: "min", recordedAt });
  }
  if (data.sleepHours != null) {
    readings.push({ dataType: "sleep_hours", value: data.sleepHours, unit: "hours", recordedAt });
  }
  if (data.weight != null) {
    readings.push({ dataType: "weight", value: data.weight, unit: "kg", recordedAt });
  }
  if (data.bloodPressure != null) {
    readings.push({ dataType: "blood_pressure_systolic", value: data.bloodPressure.systolic, unit: "mmHg", recordedAt });
    readings.push({ dataType: "blood_pressure_diastolic", value: data.bloodPressure.diastolic, unit: "mmHg", recordedAt });
  }

  return readings;
}

export function useWearable(): UseWearableReturn {
  const { isAuthenticated } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const [latestData, setLatestData] = useState<WearableData | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const available = checkAvailable();

  useEffect(() => {
    async function loadState() {
      try {
        const connected = await AsyncStorage.getItem(STORAGE_KEY_CONNECTED);
        const synced = await AsyncStorage.getItem(STORAGE_KEY_LAST_SYNCED);
        setIsConnected(connected === "true");
        setLastSynced(synced ? new Date(synced) : null);
      } catch {
        // Ignore storage read errors
      }
    }
    loadState();
  }, []);

  const requestPermissions = useCallback(async () => {
    setError(null);
    try {
      const granted = await requestWearablePermissions();
      if (granted) {
        setIsConnected(true);
        await AsyncStorage.setItem(STORAGE_KEY_CONNECTED, "true");
      } else {
        setError("Permissions were not granted");
      }
    } catch {
      setError("Failed to request permissions");
    }
  }, []);

  const sync = useCallback(async () => {
    if (!isAuthenticated || !isConnected || isSyncing) return;

    setIsSyncing(true);
    setError(null);

    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);

      const data = await readData(startDate, endDate);
      setLatestData(data);

      const source = Platform.OS === "ios" ? "apple_health" : "google_fit";
      const recordedAt = endDate.toISOString();
      const readings = wearableDataToReadings(data, recordedAt);

      if (readings.length > 0) {
        const response = await api.post("/api/wearable-syncs", { source, readings });
        if (response.error) {
          setError(response.error);
          setIsSyncing(false);
          return;
        }
      }

      const now = new Date();
      setLastSynced(now);
      await AsyncStorage.setItem(STORAGE_KEY_LAST_SYNCED, now.toISOString());
    } catch {
      setError("Failed to sync wearable data");
    }

    setIsSyncing(false);
  }, [isAuthenticated, isConnected, isSyncing]);

  const disconnect = useCallback(async () => {
    setIsConnected(false);
    setLatestData(null);
    setLastSynced(null);
    await AsyncStorage.multiRemove([STORAGE_KEY_CONNECTED, STORAGE_KEY_LAST_SYNCED]);
  }, []);

  return {
    isAvailable: available,
    isConnected,
    lastSynced,
    latestData,
    requestPermissions,
    sync,
    disconnect,
    isSyncing,
    error,
  };
}

export type { WearableData, UseWearableReturn };
