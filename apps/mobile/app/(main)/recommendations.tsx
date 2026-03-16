import React from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  SafeAreaView,
  Alert,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { ErrorBanner } from "@/components/ErrorBanner";
import {
  useRecommendations,
  TEST_DISPLAY_NAMES,
} from "@/hooks/useRecommendations";

type RecommendationStatus =
  | "pending"
  | "scheduled"
  | "completed"
  | "declined"
  | "snoozed";

const STATUS_BADGES: Record<
  RecommendationStatus,
  { readonly bg: string; readonly text: string; readonly label: string }
> = {
  pending: { bg: "bg-gray-100", text: "text-gray-700", label: "Pending" },
  scheduled: {
    bg: "bg-blue-100",
    text: "text-blue-700",
    label: "Scheduled",
  },
  completed: {
    bg: "bg-green-100",
    text: "text-green-700",
    label: "Completed",
  },
  declined: {
    bg: "bg-red-100",
    text: "text-red-700",
    label: "Declined",
  },
  snoozed: {
    bg: "bg-amber-100",
    text: "text-amber-700",
    label: "Snoozed",
  },
};

const PRIORITY_BORDERS: Record<string, string> = {
  routine: "border-gray-200",
  recommended: "border-blue-300",
  strongly_recommended: "border-orange-300",
};

export default function RecommendationsScreen() {
  const router = useRouter();
  const { recommendations, isLoading, error, refetch, updateStatus } =
    useRecommendations();

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    const result = await updateStatus(id, newStatus);
    if (result.error) {
      Alert.alert("Error", result.error);
    }
  };

  const handlePrint = () => {
    Alert.alert(
      "Print List",
      "This feature will generate a printable PDF of recommended tests to bring to your healthcare provider.",
    );
  };

  if (isLoading && recommendations.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-surface-secondary">
        <LoadingSkeleton />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-surface-secondary">
        <ErrorBanner message={error} onRetry={refetch} />
      </SafeAreaView>
    );
  }

  if (recommendations.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-surface-secondary">
        <View className="flex-1 items-center justify-center px-6">
          <View className="w-20 h-20 bg-green-100 rounded-full items-center justify-center mb-4">
            <Ionicons name="checkmark-circle" size={48} color="#22C55E" />
          </View>
          <Text className="text-xl font-bold text-text-primary mb-2 text-center">
            All Caught Up
          </Text>
          <Text className="text-sm text-text-secondary text-center">
            No recommended tests at this time. Check back after your next
            assessment update.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-surface-secondary">
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 py-4 pb-8"
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
      >
        <View className="flex-row items-center mb-4">
          <Pressable onPress={() => router.back()} className="mr-3" accessibilityRole="button" accessibilityLabel="Go back" style={{ minHeight: 44, minWidth: 44 }}>
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </Pressable>
          <View className="flex-1">
            <Text className="text-xl font-bold text-text-primary">
              Recommended Tests
            </Text>
          </View>
          <Pressable
            onPress={handlePrint}
            className="w-10 h-10 bg-white rounded-full items-center justify-center shadow-sm"
            accessibilityRole="button"
            accessibilityLabel="Print recommended tests list"
          >
            <Ionicons name="print-outline" size={20} color="#111827" />
          </Pressable>
        </View>

        <View className="gap-3">
          {recommendations.map((rec) => {
            const status = rec.status as RecommendationStatus;
            const badge = STATUS_BADGES[status] ?? STATUS_BADGES.pending;
            const borderClass = PRIORITY_BORDERS[rec.priority] ?? "border-gray-200";
            const displayName =
              TEST_DISPLAY_NAMES[rec.testCode] ?? rec.testCode;

            return (
              <View
                key={rec.id}
                className={`bg-white rounded-2xl p-4 shadow-sm border-l-4 ${borderClass}`}
                accessibilityLabel={`${displayName}, priority: ${rec.priority}, status: ${badge.label}`}
              >
                <View className="flex-row items-start justify-between mb-2">
                  <Text className="text-base font-semibold text-text-primary flex-1 mr-2">
                    {displayName}
                  </Text>
                  <View
                    className={`${badge.bg} rounded-full px-2.5 py-0.5`}
                  >
                    <Text
                      className={`text-2xs font-medium ${badge.text}`}
                    >
                      {badge.label}
                    </Text>
                  </View>
                </View>

                <Text className="text-xs text-text-secondary mb-2">
                  <Text className="font-medium">Why for you: </Text>
                  {rec.rationale}
                </Text>

                <View className="bg-blue-50 rounded-lg p-2 mb-3">
                  <Text className="text-xs text-blue-700">
                    <Text className="font-medium">Category: </Text>
                    {rec.category}
                  </Text>
                </View>

                {status === "pending" && (
                  <View className="flex-row gap-2">
                    <Pressable
                      onPress={() =>
                        handleUpdateStatus(rec.id, "scheduled")
                      }
                      className="flex-1 bg-blue-50 py-2 rounded-lg items-center active:bg-blue-100"
                      accessibilityRole="button"
                      accessibilityLabel={`Schedule ${displayName}`}
                      style={{ minHeight: 44 }}
                    >
                      <Text className="text-xs font-medium text-blue-700">
                        Schedule
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={() =>
                        handleUpdateStatus(rec.id, "completed")
                      }
                      className="flex-1 bg-green-50 py-2 rounded-lg items-center active:bg-green-100"
                      accessibilityRole="button"
                      accessibilityLabel={`Mark ${displayName} as completed`}
                      style={{ minHeight: 44 }}
                    >
                      <Text className="text-xs font-medium text-green-700">
                        Completed
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={() =>
                        handleUpdateStatus(rec.id, "declined")
                      }
                      className="flex-1 bg-gray-50 py-2 rounded-lg items-center active:bg-gray-100"
                      accessibilityRole="button"
                      accessibilityLabel={`Decline ${displayName}`}
                      style={{ minHeight: 44 }}
                    >
                      <Text className="text-xs font-medium text-gray-600">
                        Decline
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={() =>
                        handleUpdateStatus(rec.id, "snoozed")
                      }
                      className="flex-1 bg-amber-50 py-2 rounded-lg items-center active:bg-amber-100"
                      accessibilityRole="button"
                      accessibilityLabel={`Snooze ${displayName}`}
                      style={{ minHeight: 44 }}
                    >
                      <Text className="text-xs font-medium text-amber-700">
                        Snooze
                      </Text>
                    </Pressable>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        <DisclaimerBanner disclaimerKey="recommendations" />
      </ScrollView>
    </SafeAreaView>
  );
}
