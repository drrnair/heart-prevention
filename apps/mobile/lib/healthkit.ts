/**
 * Apple HealthKit abstraction for iOS.
 *
 * Currently returns mock data in development.
 * Wire to react-native-health when native builds are available.
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
 * Request HealthKit permissions from the user.
 *
 * TODO: Replace with react-native-health AppleHealthKit.initHealthKit()
 * Required HKQuantityTypeIdentifiers:
 * - HKQuantityTypeIdentifierRestingHeartRate
 * - HKQuantityTypeIdentifierStepCount
 * - HKQuantityTypeIdentifierAppleExerciseTime
 * - HKCategoryTypeIdentifierSleepAnalysis
 * - HKQuantityTypeIdentifierBodyMass
 * - HKQuantityTypeIdentifierBloodPressureSystolic
 * - HKQuantityTypeIdentifierBloodPressureDiastolic
 */
export async function requestPermissions(): Promise<boolean> {
  if (!isAvailable()) return false;

  // TODO: Call AppleHealthKit.initHealthKit({ permissions: { read: [...] } })
  return true;
}

/**
 * Read health data for the given date range.
 *
 * TODO: Replace with individual AppleHealthKit queries:
 * - AppleHealthKit.getRestingHeartRateSamples()
 * - AppleHealthKit.getStepCount()
 * - AppleHealthKit.getAppleExerciseTime()
 * - AppleHealthKit.getSleepSamples()
 * - AppleHealthKit.getLatestWeight()
 * - AppleHealthKit.getBloodPressureSamples()
 */
export async function readData(
  _startDate: Date,
  _endDate: Date,
): Promise<WearableData> {
  if (!isAvailable()) return {};

  // TODO: Replace with real HealthKit queries
  return {
    restingHeartRate: 62,
    stepCount: 8432,
    exerciseMinutes: 35,
    sleepHours: 7.2,
    weight: 78.5,
    bloodPressure: { systolic: 118, diastolic: 76 },
  };
}

/**
 * Check if HealthKit is available on this device.
 *
 * TODO: Replace with AppleHealthKit.isAvailable()
 */
export function isAvailable(): boolean {
  return Platform.OS === "ios";
}
