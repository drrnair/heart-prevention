import React from "react";
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  Pressable,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { CompletenessMeter } from "@/components/CompletenessMeter";
import { ConfidenceRange } from "@/components/ConfidenceRange";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { ErrorBanner } from "@/components/ErrorBanner";
import { useDashboard } from "@/hooks/useDashboard";
import { useUnits } from "@/hooks/useUnits";
import { useWearable } from "@/hooks/useWearable";

function RiskGauge({
  percentage,
  riskLevel,
}: {
  readonly percentage: number;
  readonly riskLevel: string;
}) {
  const riskColors: Record<string, string> = {
    low: "#22C55E",
    borderline: "#EAB308",
    intermediate: "#F97316",
    high: "#EF4444",
  };

  const color = riskColors[riskLevel] ?? "#6B7280";

  return (
    <View className="items-center py-4" accessibilityLabel={`10-year cardiovascular risk: ${percentage.toFixed(1)} percent, ${riskLevel} risk`}>
      <View
        className="w-40 h-40 rounded-full border-8 items-center justify-center"
        style={{ borderColor: color }}
      >
        <Text className="text-4xl font-bold" style={{ color }}>
          {percentage.toFixed(1)}%
        </Text>
        <Text className="text-xs text-text-secondary mt-1">10-Year Risk</Text>
      </View>
    </View>
  );
}

function MetricCard({
  label,
  value,
  unit,
  status,
}: {
  readonly label: string;
  readonly value: string;
  readonly unit: string;
  readonly status: "normal" | "borderline" | "elevated";
}) {
  const statusColors: Record<string, string> = {
    normal: "bg-risk-low-bg border-green-200",
    borderline: "bg-risk-borderline-bg border-yellow-200",
    elevated: "bg-risk-high-bg border-red-200",
  };

  const statusTextColors: Record<string, string> = {
    normal: "text-risk-low",
    borderline: "text-risk-borderline",
    elevated: "text-risk-high",
  };

  return (
    <View
      className={`flex-1 rounded-xl border p-3 ${statusColors[status]}`}
      accessibilityLabel={`${label}: ${value} ${unit}, ${status}`}
    >
      <Text className="text-xs text-text-secondary mb-1">{label}</Text>
      <View className="flex-row items-baseline">
        <Text className="text-xl font-bold text-text-primary">{value}</Text>
        <Text className="text-xs text-text-secondary ml-1">{unit}</Text>
      </View>
      <Text className={`text-2xs font-medium mt-1 ${statusTextColors[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Text>
    </View>
  );
}

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

function getBmiStatus(bmi: number): "normal" | "borderline" | "elevated" {
  if (bmi < 25) return "normal";
  if (bmi < 30) return "borderline";
  return "elevated";
}

function getWhrStatus(whr: number): "normal" | "borderline" | "elevated" {
  if (whr < 0.9) return "normal";
  if (whr < 1.0) return "borderline";
  return "elevated";
}

export default function DashboardScreen() {
  const router = useRouter();
  const { riskScore, completeness, assessment, isLoading, error, refetch } =
    useDashboard();
  const { formatWeight, weightUnit } = useUnits();
  const { isConnected, latestData, lastSynced } = useWearable();

  if (isLoading && !riskScore && !assessment) {
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

  return (
    <SafeAreaView className="flex-1 bg-surface-secondary">
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 py-4 pb-8"
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
      >
        {/* Header */}
        <View className="flex-row items-center justify-between mb-4">
          <View>
            <Text className="text-2xl font-bold text-text-primary">
              Dashboard
            </Text>
          </View>
          <Pressable className="w-10 h-10 bg-white rounded-full items-center justify-center shadow-sm" accessibilityRole="button" accessibilityLabel="Notifications">
            <Ionicons name="notifications-outline" size={22} color="#111827" />
          </Pressable>
        </View>

        {/* Risk Gauge or Profile Prompt */}
        {riskScore ? (
          <>
            <View className="bg-white rounded-2xl p-4 shadow-sm mb-4">
              <RiskGauge
                percentage={riskScore.percentage}
                riskLevel={riskScore.riskLevel}
              />
            </View>

            <View className="mb-4">
              <ConfidenceRange
                low={riskScore.percentage * 0.65}
                high={riskScore.percentage * 1.45}
                midpoint={riskScore.percentage}
                isPreliminary={riskScore.isPreliminary}
                riskLevel={riskScore.riskLevel}
              />
            </View>
          </>
        ) : (
          <Pressable
            onPress={() => router.push("/(main)/checkin")}
            className="bg-blue-50 border border-blue-200 rounded-2xl p-6 items-center mb-4 active:bg-blue-100"
            accessibilityRole="button"
            accessibilityLabel="Complete your profile to see cardiovascular risk estimate"
          >
            <View className="w-16 h-16 bg-blue-100 rounded-full items-center justify-center mb-3">
              <Ionicons name="person-add" size={32} color="#3B82F6" />
            </View>
            <Text className="text-base font-semibold text-blue-900">
              Complete Your Profile
            </Text>
            <Text className="text-xs text-blue-700 mt-1 text-center">
              Add your health data to see your cardiovascular risk estimate
            </Text>
          </Pressable>
        )}

        {/* Completeness Meter */}
        {completeness && (
          <View className="mb-4">
            <CompletenessMeter
              currentLevel={completeness.currentLevel}
              nextLevelHint={completeness.nextLevelHint}
            />
          </View>
        )}

        {/* Body Metrics */}
        {assessment && (
          <>
            <Text className="text-sm font-semibold text-text-primary mb-2 ml-1">
              Body Metrics
            </Text>
            <View className="flex-row gap-3 mb-4">
              {assessment.bmi != null && (
                <MetricCard
                  label="BMI"
                  value={assessment.bmi.toFixed(1)}
                  unit="kg/m2"
                  status={getBmiStatus(assessment.bmi)}
                />
              )}
              {assessment.waistToHip != null && (
                <MetricCard
                  label="WHR"
                  value={assessment.waistToHip.toFixed(2)}
                  unit=""
                  status={getWhrStatus(assessment.waistToHip)}
                />
              )}
              <MetricCard
                label="BP"
                value={`${assessment.systolicBp}/${assessment.diastolicBp}`}
                unit="mmHg"
                status={assessment.systolicBp >= 130 ? "elevated" : assessment.systolicBp >= 120 ? "borderline" : "normal"}
              />
            </View>
            <View className="flex-row gap-3 mb-4">
              <MetricCard
                label="Weight"
                value={formatWeight(assessment.weightKg).split(" ")[0] ?? ""}
                unit={weightUnit}
                status="normal"
              />
            </View>
          </>
        )}

        {/* Wearable Data */}
        {isConnected && latestData && (
          <View className="bg-white rounded-2xl p-4 shadow-sm mb-4">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-sm font-semibold text-text-primary">
                Wearable Data
              </Text>
              {lastSynced && (
                <Text className="text-2xs text-text-tertiary">
                  {formatTimeAgo(lastSynced)}
                </Text>
              )}
            </View>
            <View className="flex-row gap-4">
              {latestData.restingHeartRate != null && (
                <View className="flex-row items-center gap-1.5" accessibilityLabel={`Resting heart rate: ${latestData.restingHeartRate} beats per minute`}>
                  <Ionicons name="heart" size={16} color="#EF4444" />
                  <Text className="text-sm font-medium text-text-primary">
                    {latestData.restingHeartRate}
                  </Text>
                  <Text className="text-2xs text-text-secondary">bpm</Text>
                </View>
              )}
              {latestData.stepCount != null && (
                <View className="flex-row items-center gap-1.5" accessibilityLabel={`Step count: ${latestData.stepCount.toLocaleString()} steps`}>
                  <Ionicons name="walk" size={16} color="#3B82F6" />
                  <Text className="text-sm font-medium text-text-primary">
                    {latestData.stepCount.toLocaleString()}
                  </Text>
                </View>
              )}
              {latestData.exerciseMinutes != null && (
                <View className="flex-row items-center gap-1.5">
                  <Ionicons name="fitness" size={16} color="#22C55E" />
                  <Text className="text-sm font-medium text-text-primary">
                    {latestData.exerciseMinutes}
                  </Text>
                  <Text className="text-2xs text-text-secondary">min</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Weekly Check-in CTA */}
        <Pressable
          onPress={() => router.push("/(main)/checkin")}
          className="bg-green-50 border border-green-200 rounded-2xl p-4 flex-row items-center mb-4 active:bg-green-100"
          accessibilityRole="button"
          accessibilityLabel="Weekly check-in. Update your latest readings"
        >
          <View className="w-10 h-10 bg-green-100 rounded-full items-center justify-center mr-3">
            <Ionicons name="fitness" size={20} color="#22C55E" />
          </View>
          <View className="flex-1">
            <Text className="text-sm font-semibold text-green-900">
              Weekly Check-in
            </Text>
            <Text className="text-xs text-green-700 mt-0.5">
              Update your latest readings
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#22C55E" />
        </Pressable>

        {/* Recommended Tests CTA */}
        <Pressable
          onPress={() => router.push("/(main)/recommendations")}
          className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex-row items-center mb-4 active:bg-blue-100"
          accessibilityRole="button"
          accessibilityLabel="See recommended tests. Improve your estimate by completing key tests"
        >
          <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center mr-3">
            <Ionicons name="flask" size={20} color="#3B82F6" />
          </View>
          <View className="flex-1">
            <Text className="text-sm font-semibold text-blue-900">
              See Recommended Tests
            </Text>
            <Text className="text-xs text-blue-700 mt-0.5">
              Improve your estimate by completing key tests
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#3B82F6" />
        </Pressable>

        <DisclaimerBanner disclaimerKey="risk" />
      </ScrollView>
    </SafeAreaView>
  );
}
