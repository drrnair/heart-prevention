/**
 * Google Fit abstraction for Android.
 *
 * Currently returns mock data in development.
 * Wire to react-native-google-fit when native builds are available.
 */

import { Platform } from "react-native";

export interface WearableData {
  readonly restingHeartRate?: number;
  readonly stepCount?: number;
  readonly exerciseMinutes?: number;
  readonly sleepHours?: number;
  readonly weight?: number;
  readonly bloodPressure?: {
    readonly systolic: number;
    readonly diastolic: number;
  };
}

/**
 * Request Google Fit permissions from the user.
 *
 * TODO: Replace with GoogleFit.authorize() using OAuth scopes:
 * - https://www.googleapis.com/auth/fitness.heart_rate.read
 * - https://www.googleapis.com/auth/fitness.activity.read
 * - https://www.googleapis.com/auth/fitness.sleep.read
 * - https://www.googleapis.com/auth/fitness.body.read
 * - https://www.googleapis.com/auth/fitness.blood_pressure.read
 */
export async function requestPermissions(): Promise<boolean> {
  if (!isAvailable()) return false;

  // TODO: Call GoogleFit.authorize({ scopes: [...] })
  return true;
}

/**
 * Read health data for the given date range.
 *
 * TODO: Replace with Google Fit data type queries:
 * - com.google.heart_rate.bpm (resting)
 * - com.google.step_count.delta
 * - com.google.active_minutes
 * - com.google.sleep.segment
 * - com.google.weight
 * - com.google.blood_pressure
 */
export async function readData(
  _startDate: Date,
  _endDate: Date,
): Promise<WearableData> {
  if (!isAvailable()) return {};

  // TODO: Replace with real Google Fit queries
  return {
    restingHeartRate: 64,
    stepCount: 7850,
    exerciseMinutes: 28,
    sleepHours: 6.8,
    weight: 79.0,
    bloodPressure: { systolic: 120, diastolic: 78 },
  };
}

/**
 * Check if Google Fit is available on this device.
 *
 * TODO: Replace with GoogleFit.isAvailable()
 */
export function isAvailable(): boolean {
  return Platform.OS === "android";
}
