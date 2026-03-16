/**
 * Platform-agnostic wearable abstraction.
 *
 * Routes to HealthKit on iOS, Google Fit on Android.
 */

import { Platform } from "react-native";
import * as HealthKit from "./healthkit";
import * as GoogleFit from "./google-fit";

export type { WearableData } from "./healthkit";

const provider = Platform.OS === "ios" ? HealthKit : GoogleFit;

export const requestPermissions = provider.requestPermissions;
export const readData = provider.readData;
export const isAvailable = provider.isAvailable;
