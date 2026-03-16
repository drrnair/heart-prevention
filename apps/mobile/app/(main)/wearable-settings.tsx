import React from "react";
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  Pressable,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useWearable } from "@/hooks/useWearable";

const DATA_TYPES = [
  { label: "Resting Heart Rate", icon: "heart" as const },
  { label: "Step Count", icon: "walk" as const },
  { label: "Exercise Minutes", icon: "fitness" as const },
  { label: "Sleep Hours", icon: "moon" as const },
  { label: "Weight", icon: "scale" as const },
  { label: "Blood Pressure", icon: "pulse" as const },
] as const;

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function WearableSettingsScreen() {
  const router = useRouter();
  const {
    isAvailable,
    isConnected,
    lastSynced,
    requestPermissions,
    sync,
    disconnect,
    isSyncing,
    error,
  } = useWearable();

  const platformName = Platform.OS === "ios" ? "Apple Health" : "Google Fit";

  return (
    <SafeAreaView className="flex-1 bg-surface-secondary">
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 py-4 pb-8"
      >
        {/* Header */}
        <View className="flex-row items-center mb-6">
          <Pressable
            onPress={() => router.back()}
            className="w-10 h-10 bg-white rounded-full items-center justify-center shadow-sm mr-3"
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={22} color="#111827" />
          </Pressable>
          <Text className="text-2xl font-bold text-text-primary">
            Wearable Settings
          </Text>
        </View>

        {!isAvailable && (
          <View className="bg-gray-50 border border-gray-200 rounded-2xl p-6 items-center">
            <Ionicons name="watch-outline" size={48} color="#9CA3AF" />
            <Text className="text-base font-semibold text-text-secondary mt-3">
              Not Available
            </Text>
            <Text className="text-sm text-text-tertiary text-center mt-1">
              {platformName} is not available on this device.
            </Text>
          </View>
        )}

        {isAvailable && (
          <>
            {/* Connection Status Card */}
            <View
              className={`rounded-2xl p-4 shadow-sm mb-4 ${
                isConnected
                  ? "bg-green-50 border border-green-200"
                  : "bg-gray-50 border border-gray-200"
              }`}
              accessibilityLabel={isConnected ? `Connected to ${platformName}` : "Not connected to wearable"}
            >
              <View className="flex-row items-center">
                <View
                  className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${
                    isConnected ? "bg-green-100" : "bg-gray-200"
                  }`}
                >
                  <Ionicons
                    name="watch"
                    size={20}
                    color={isConnected ? "#22C55E" : "#9CA3AF"}
                  />
                </View>
                <View className="flex-1">
                  <Text
                    className={`text-base font-semibold ${
                      isConnected ? "text-green-900" : "text-text-secondary"
                    }`}
                  >
                    {isConnected
                      ? `Connected to ${platformName}`
                      : "Not Connected"}
                  </Text>
                  {isConnected && lastSynced && (
                    <Text className="text-xs text-green-700 mt-0.5">
                      Last synced: {formatTimeAgo(lastSynced)}
                    </Text>
                  )}
                </View>
              </View>
            </View>

            {!isConnected && (
              <>
                <View className="bg-white rounded-2xl p-4 shadow-sm mb-4">
                  <Text className="text-sm font-semibold text-text-primary mb-2">
                    What data will be synced
                  </Text>
                  <Text className="text-sm text-text-secondary leading-5">
                    Connecting to {platformName} allows the app to read your
                    resting heart rate, step count, exercise minutes, sleep
                    duration, weight, and blood pressure readings.
                  </Text>
                </View>

                <Pressable
                  onPress={requestPermissions}
                  className="bg-red-600 rounded-xl py-4 items-center mb-4 active:bg-red-700"
                  accessibilityRole="button"
                  accessibilityLabel={`Connect ${platformName}`}
                >
                  <Text className="text-white font-semibold text-base">
                    Connect {platformName}
                  </Text>
                </Pressable>
              </>
            )}

            {isConnected && (
              <>
                {/* Data Types */}
                <View className="bg-white rounded-2xl p-4 shadow-sm mb-4">
                  <Text className="text-sm font-semibold text-text-primary mb-3">
                    Data types synced
                  </Text>
                  {DATA_TYPES.map((item) => (
                    <View
                      key={item.label}
                      className="flex-row items-center py-2 border-b border-gray-100 last:border-b-0"
                    >
                      <Ionicons
                        name={item.icon}
                        size={18}
                        color="#6B7280"
                      />
                      <Text className="text-sm text-text-primary flex-1 ml-3">
                        {item.label}
                      </Text>
                      <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color="#22C55E"
                      />
                    </View>
                  ))}
                </View>

                {/* Sync Now */}
                <Pressable
                  onPress={sync}
                  disabled={isSyncing}
                  className={`rounded-xl py-4 items-center mb-3 flex-row justify-center gap-2 ${
                    isSyncing
                      ? "bg-gray-300"
                      : "bg-red-600 active:bg-red-700"
                  }`}
                  accessibilityRole="button"
                  accessibilityLabel={isSyncing ? "Syncing data" : "Sync now"}
                >
                  {isSyncing && (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  )}
                  <Text className="text-white font-semibold text-base">
                    {isSyncing ? "Syncing..." : "Sync Now"}
                  </Text>
                </Pressable>

                {lastSynced && (
                  <Text className="text-xs text-text-tertiary text-center mb-4">
                    Last synced: {formatTimeAgo(lastSynced)}
                  </Text>
                )}

                {/* Disconnect */}
                <Pressable
                  onPress={disconnect}
                  className="rounded-xl py-3 items-center border border-gray-300 mb-4 active:bg-gray-50"
                  accessibilityRole="button"
                  accessibilityLabel={`Disconnect ${platformName}`}
                >
                  <Text className="text-sm text-text-secondary">
                    Disconnect {platformName}
                  </Text>
                </Pressable>
              </>
            )}

            {error && (
              <View className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 flex-row items-center gap-2">
                <Ionicons name="alert-circle" size={18} color="#DC2626" />
                <Text className="text-xs text-red-800 flex-1">{error}</Text>
              </View>
            )}

            {/* Privacy Note */}
            <View className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex-row items-start gap-2">
              <Ionicons name="shield-checkmark" size={18} color="#3B82F6" />
              <Text className="text-xs text-blue-800 flex-1">
                Your health data stays in your account and is never shared.
              </Text>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
